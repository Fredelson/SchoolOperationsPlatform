const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const { countPages } = require("../../../shared/utils/pageCounter");
const repository = require("../repositories/printingRequestRepository");
const settingsService = require("./printingSettingsService");
const accessService = require("./printingAccessService");
const {
  calculateAttachment,
} = require("../helpers/printCalculationEngine");
const {
  PRINTING_STATUSES,
  HOD_PENDING_STATUSES,
  HOS_PENDING_STATUSES,
  REQUESTER_CANCELLABLE_STATUSES,
} = require("../constants/printingStatuses");

const error = (message, statusCode = 400, details = null) => {
  const serviceError = new Error(message);
  serviceError.statusCode = statusCode;
  if (details) serviceError.details = details;
  return serviceError;
};

const normalizeAssignmentKey = (value) =>
  String(value || "").trim().toUpperCase();

const generateRequestNumber = () => {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `PR-${date}-${suffix}`;
};

const resolveSubmittedAssignment = (actor, payload) => {
  const requestedKey = normalizeAssignmentKey(payload.submittedByAssignmentKey);

  if (
    requestedKey &&
    actor.assignments.some(
      (assignment) =>
        normalizeAssignmentKey(assignment.assignmentKey) === requestedKey
    )
  ) {
    return requestedKey;
  }

  const primary = actor.assignments.find((assignment) => assignment.isPrimary);
  return primary?.assignmentKey || null;
};

const createDraft = async (actor, payload = {}) => {
  const departmentId = Number(payload.departmentId);
  const subjectId = Number(payload.subjectId);
  const purposeId = Number(payload.purposeId);

  if (!departmentId || !subjectId || !purposeId) {
    throw error("Department, subject, and purpose are required.");
  }

  const [department, lookups] = await Promise.all([
    repository.getDepartmentContext(departmentId, actor.schoolId),
    repository.validateLookupIds({ subjectId, purposeId }),
  ]);

  if (!department) throw error("The selected department is unavailable.");
  if (!lookups?.SubjectExists) throw error("The selected subject is unavailable.");
  if (!lookups?.PurposeExists) throw error("The selected purpose is unavailable.");

  const dueDate = payload.dueDate || payload.requiredDate;
  const parsedDueDate = dueDate ? new Date(dueDate) : null;

  if (parsedDueDate && Number.isNaN(parsedDueDate.getTime())) {
    throw error("The required date is invalid.");
  }

  const transaction = await repository.beginTransaction();
  try {
    const draft = await repository.createDraft(transaction, {
      requestNumber: generateRequestNumber(),
      requesterId: actor.userId,
      schoolId: actor.schoolId,
      departmentId,
      sectionId: department.SectionId || actor.sectionId,
      subjectId,
      purposeId,
      priorityLevel: payload.priorityLevel || payload.priority || "Normal",
      dueDate: parsedDueDate,
      remarks: payload.remarks || null,
      isExam: Boolean(payload.isExam),
      submittedByAssignmentKey: resolveSubmittedAssignment(actor, payload),
    });
    await repository.insertWorkflowEvent(transaction, {
      requestId: draft.RequestId,
      eventType: "DRAFT_CREATED",
      fromStatus: null,
      toStatus: PRINTING_STATUSES.DRAFT,
      actorUserId: actor.userId,
      actorAssignmentKey: draft.SubmittedByAssignmentKey,
    });
    await transaction.commit();
    return draft;
  } catch (eventError) {
    try {
      await transaction.rollback();
    } catch {
      // Preserve the original draft creation error.
    }
    throw eventError;
  }
};

const toPublicFilePath = (physicalPath) => {
  const normalized = path.resolve(physicalPath).replace(/\\/g, "/");
  const marker = "/uploads/";
  const markerIndex = normalized.toLowerCase().lastIndexOf(marker);

  return markerIndex >= 0
    ? normalized.slice(markerIndex)
    : `/uploads/printing/attachments/${path.basename(physicalPath)}`;
};

const safeUnlink = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // The upload may already have been removed by middleware or cleanup.
  }
};

const uploadAttachment = async (
  actor,
  requestId,
  file,
  payload = {}
) => {
  if (!file) throw error("A document file is required.");

  const settings = await settingsService.getSettings(actor.schoolId);
  const extension = path
    .extname(file.originalname || "")
    .replace(/^\./, "")
    .toLowerCase();

  if (!settings.allowedExtensions.includes(extension)) {
    await safeUnlink(file.path);
    throw error(`Files with the .${extension || "unknown"} extension are not allowed.`);
  }

  if (file.size > settings.uploadMaxMb * 1024 * 1024) {
    await safeUnlink(file.path);
    throw error(`The file exceeds the ${settings.uploadMaxMb} MB upload limit.`);
  }

  const pageCount = await countPages(file.path, file.originalname);
  const calculation = calculateAttachment({
    pageCount,
    copies: payload.copies,
    printType: payload.printType,
    pagesPerSheet: payload.pagesPerSheet,
    pageSelection: payload.pageSelection,
    customPageRange: payload.customPageRange,
    paperSize: payload.paperSize,
    printColor: payload.printColor,
  });
  const transaction = await repository.beginTransaction();

  try {
    const editableRequest = await repository.getOwnedEditableRequest(
      transaction,
      requestId,
      actor.userId
    );

    if (!editableRequest) {
      throw error(
        "The request is not editable or does not belong to this requester.",
        404
      );
    }

    const attachment = await repository.insertAttachment(transaction, {
      requestId,
      originalFileName: file.originalname,
      storedFileName: file.filename,
      filePath: toPublicFilePath(file.path),
      fileType: file.mimetype,
      fileSizeKB: file.size / 1024,
      documentName: payload.documentName || file.originalname,
      pageSelection: payload.pageSelection || "All Pages",
      customPageRange: payload.customPageRange || null,
      ...calculation,
    });
    const requestSummary = await repository.refreshRequestTotals(
      transaction,
      requestId
    );

    await repository.insertWorkflowEvent(transaction, {
      requestId,
      eventType: "ATTACHMENT_ADDED",
      fromStatus: editableRequest.Status,
      toStatus: editableRequest.Status,
      actorUserId: actor.userId,
      actorAssignmentKey: editableRequest.SubmittedByAssignmentKey,
      metadata: {
        attachmentId: attachment.AttachmentId,
        originalFileName: attachment.OriginalFileName,
        paperSize: attachment.PaperSize,
        totalSheets: attachment.TotalSheets,
      },
    });

    await transaction.commit();
    return { attachment, requestSummary };
  } catch (uploadError) {
    try {
      await transaction.rollback();
    } catch {
      // Preserve the original upload error.
    }
    await safeUnlink(file.path);
    throw uploadError;
  }
};

const isScopedHod = (actor, printingRequest) => {
  const matchingAssignment = actor.assignments.find((assignment) => {
    if (normalizeAssignmentKey(assignment.assignmentKey) !== "HOD") {
      return false;
    }

    const departmentMatches = assignment.scopes.some(
      (scope) =>
        scope.scopeType === "Department" &&
        Number(scope.scopeEntityId) === Number(printingRequest.DepartmentId)
    );
    const subjectScopes = assignment.scopes.filter(
      (scope) => scope.scopeType === "Subject"
    );
    const subjectMatches =
      subjectScopes.length === 0 ||
      subjectScopes.some(
        (scope) =>
          Number(scope.scopeEntityId) === Number(printingRequest.SubjectId)
      );

    return departmentMatches && subjectMatches;
  });

  return matchingAssignment || null;
};

const resolveQueueRoute = async (
  transaction,
  printingRequest,
  settings
) => {
  if (settings.queueAssignmentMode === "direct") {
    const operator = await repository.findPrintingOperator(
      transaction,
      printingRequest.SchoolId || 1
    );

    if (!operator) {
      throw error("No active Printing Admin or Printing Coordinator is available.");
    }

    return {
      status: PRINTING_STATUSES.FORWARDED_TO_PRINTING,
      approverId: operator.UserId,
    };
  }

  return {
    status: PRINTING_STATUSES.QUEUED,
    approverId: null,
  };
};

const submitRequest = async (actor, requestId) => {
  const settings = await settingsService.getSettings(actor.schoolId);
  const transaction = await repository.beginTransaction();

  try {
    const submission = await repository.getRequestForSubmission(
      transaction,
      requestId,
      actor.userId
    );

    if (!submission) {
      throw error("The request is not available for submission.", 404);
    }

    const printingRequest = await repository.refreshRequestTotals(
      transaction,
      requestId
    );

    if (!submission.attachments.length || Number(printingRequest.TotalSheets) <= 0) {
      throw error("At least one valid document is required before submission.");
    }

    const hodAssignment = isScopedHod(actor, printingRequest);
    const skipOwnHodApproval =
      hodAssignment && settings.hodSelfApproval === false;

    let route;
    let pendingApproval = null;

    if (!settings.requireHodApproval || skipOwnHodApproval) {
      await assertQuota(transaction, printingRequest);

      if (Number(printingRequest.TotalSheets) > settings.approvalThresholdSheets) {
        const hos = await repository.findHosApprover(transaction, {
          schoolId: printingRequest.SchoolId || actor.schoolId,
          departmentId: printingRequest.DepartmentId,
          sectionId: printingRequest.SectionId,
        });

        if (!hos) {
          throw error("No active HOS assignment covers this request.");
        }

        route = {
          status: PRINTING_STATUSES.PENDING_HOS_APPROVAL,
          approverId: hos.UserId,
        };
        pendingApproval = {
          requestId,
          approverId: hos.UserId,
          approvalRole: "HOS",
          stepOrder: 2,
          scopeType: hos.ScopeType,
          scopeEntityId: hos.ScopeEntityId,
        };
      } else {
        route = await resolveQueueRoute(
          transaction,
          printingRequest,
          settings
        );
      }
    } else {
      const hod = await repository.findHodApprover(transaction, {
        schoolId: printingRequest.SchoolId || actor.schoolId,
        departmentId: printingRequest.DepartmentId,
        subjectId: printingRequest.SubjectId,
      });

      if (!hod) {
        throw error(
          "No active HOD assignment covers the selected department and subject."
        );
      }

      route = {
        status: PRINTING_STATUSES.PENDING_HOD_APPROVAL,
        approverId: hod.UserId,
      };
      pendingApproval = {
        requestId,
        approverId: hod.UserId,
        approvalRole: "HOD",
        stepOrder: 1,
        scopeType: hod.ScopeType,
        scopeEntityId: hod.ScopeEntityId,
      };
    }

    const updatedRequest = await repository.updateRequestRoute(transaction, {
      requestId,
      status: route.status,
      approverId: route.approverId,
    });

    if (pendingApproval) {
      await repository.insertApproval(transaction, pendingApproval);
    }

    await repository.insertWorkflowEvent(transaction, {
      requestId,
      eventType: "REQUEST_SUBMITTED",
      fromStatus: submission.request.Status,
      toStatus: route.status,
      actorUserId: actor.userId,
      actorAssignmentKey: submission.request.SubmittedByAssignmentKey,
      metadata: {
        approvalThresholdSheets: settings.approvalThresholdSheets,
        totalSheets: updatedRequest.TotalSheets,
        nextApproverId: route.approverId,
      },
    });

    await transaction.commit();
    return updatedRequest;
  } catch (submitError) {
    try {
      await transaction.rollback();
    } catch {
      // Preserve the original workflow error.
    }
    throw submitError;
  }
};

const listMyRequests = (actor) => repository.listMyRequests(actor.userId);
const listMyAttachments = (actor) =>
  repository.listMyAttachments(actor.userId);

const canViewRequest = (actor, printingRequest) => {
  if (!printingRequest) return false;
  if (Number(printingRequest.TeacherId) === actor.userId) return true;
  if (Number(printingRequest.CurrentApproverId) === actor.userId) return true;
  if (Number(printingRequest.ClaimedByUserId) === actor.userId) return true;
  if (accessService.isPrintingOperator(actor)) return true;

  return (
    accessService.hasScopedAssignment(actor, "HOD", {
      departmentId: printingRequest.DepartmentId,
      subjectId: printingRequest.SubjectId,
    }) ||
    accessService.hasScopedAssignment(actor, "HOS", {
      departmentId: printingRequest.DepartmentId,
      sectionId: printingRequest.SectionId,
    }) ||
    accessService.hasScopedAssignment(actor, "SECRETARY", {
      departmentId: printingRequest.DepartmentId,
      sectionId: printingRequest.SectionId,
    })
  );
};

const getRequestById = async (actor, requestId) => {
  const bundle = await repository.getRequestBundle(requestId);

  if (!bundle.request) throw error("Printing request not found.", 404);
  if (!canViewRequest(actor, bundle.request)) {
    throw error("You are not authorized to view this printing request.", 403);
  }

  return bundle;
};

const cancelRequest = async (actor, requestId, remarks = null) => {
  const settings = await settingsService.getSettings(actor.schoolId);

  if (!settings.allowCancelBeforePrinting) {
    throw error("Requester cancellation is disabled in Printing Management.");
  }

  const transaction = await repository.beginTransaction();
  try {
    const ownedRequest = await repository.getOwnedRequestForUpdate(
      transaction,
      requestId,
      actor.userId
    );

    if (!ownedRequest || Number(ownedRequest.TeacherId) !== actor.userId) {
      throw error("Printing request not found.", 404);
    }
    if (!REQUESTER_CANCELLABLE_STATUSES.includes(ownedRequest.Status)) {
      throw error(
        `The request cannot be cancelled while its status is '${ownedRequest.Status}'.`
      );
    }

    const updatedRequest = await repository.updateRequestTerminalStatus(
      transaction,
      {
        requestId,
        status: PRINTING_STATUSES.CANCELLED_BY_REQUESTER,
        remarks: remarks || "Cancelled by requester",
      }
    );
    await repository.closePendingApprovals(
      transaction,
      requestId,
      "Cancelled",
      remarks || "Cancelled by requester"
    );
    await repository.insertWorkflowEvent(transaction, {
      requestId,
      eventType: "REQUEST_CANCELLED",
      fromStatus: ownedRequest.Status,
      toStatus: PRINTING_STATUSES.CANCELLED_BY_REQUESTER,
      actorUserId: actor.userId,
      actorAssignmentKey: ownedRequest.SubmittedByAssignmentKey,
      remarks,
    });

    await transaction.commit();
    return updatedRequest;
  } catch (cancelError) {
    try {
      await transaction.rollback();
    } catch {
      // Preserve the original cancellation error.
    }
    throw cancelError;
  }
};

const listApprovalInbox = (actor, approvalRole) => {
  const role = normalizeAssignmentKey(approvalRole);
  accessService.assertCapability(
    actor,
    role === "HOD"
      ? accessService.CAPABILITIES.APPROVE_HOD
      : accessService.CAPABILITIES.APPROVE_HOS
  );
  return repository.listApprovalInbox(actor.userId, role);
};

const listApprovalHistory = (actor, approvalRole) => {
  const role = normalizeAssignmentKey(approvalRole);
  accessService.assertCapability(
    actor,
    role === "HOD"
      ? accessService.CAPABILITIES.APPROVE_HOD
      : accessService.CAPABILITIES.APPROVE_HOS
  );
  return repository.listApprovalHistory(actor.userId, role);
};

const getApprovalSummary = (actor, approvalRole) => {
  const role = normalizeAssignmentKey(approvalRole);
  accessService.assertCapability(
    actor,
    role === "HOD"
      ? accessService.CAPABILITIES.APPROVE_HOD
      : accessService.CAPABILITIES.APPROVE_HOS
  );
  return repository.getApprovalSummary(actor.userId, role);
};

const assertApprovalScope = (actor, printingRequest, approvalRole) => {
  const role = normalizeAssignmentKey(approvalRole);
  const assignmentKeys = role === "HOD" ? ["HOD"] : ["HOS", "SECRETARY"];
  const valid = assignmentKeys.some((assignmentKey) =>
    accessService.hasScopedAssignment(actor, assignmentKey, {
      departmentId: printingRequest.DepartmentId,
      sectionId: role === "HOD" ? null : printingRequest.SectionId,
      subjectId: role === "HOD" ? printingRequest.SubjectId : null,
    })
  );

  if (!valid && !accessService.isPlatformAdministrator(actor)) {
    throw error("This request is outside your active approval scope.", 403);
  }
};

const assertQuota = async (transaction, printingRequest) => {
  const quota = await repository.getQuotaSnapshotForUpdate(transaction, {
    requestId: printingRequest.RequestId,
    departmentId: printingRequest.DepartmentId,
    subjectId: printingRequest.SubjectId,
    totalSheets: printingRequest.TotalSheets,
  });

  if (!quota) {
    throw error(
      "Department and subject printing limits must be configured before approval."
    );
  }
  if (Number(quota.SubjectRemaining) < Number(printingRequest.TotalSheets)) {
    throw error(
      `Subject limit exceeded. Remaining: ${quota.SubjectRemaining}, requested: ${printingRequest.TotalSheets}.`
    );
  }
  if (
    Number(quota.DepartmentRemaining) < Number(printingRequest.TotalSheets)
  ) {
    throw error(
      `Department limit exceeded. Remaining: ${quota.DepartmentRemaining}, requested: ${printingRequest.TotalSheets}.`
    );
  }

  return quota;
};

const decideApproval = async (
  actor,
  requestId,
  approvalRole,
  decision,
  remarks = null
) => {
  const role = normalizeAssignmentKey(approvalRole);
  const normalizedDecision = String(decision || "").trim().toLowerCase();
  const expectedStatuses =
    role === "HOD" ? HOD_PENDING_STATUSES : HOS_PENDING_STATUSES;

  accessService.assertCapability(
    actor,
    role === "HOD"
      ? accessService.CAPABILITIES.APPROVE_HOD
      : accessService.CAPABILITIES.APPROVE_HOS
  );

  if (!["approve", "reject", "return"].includes(normalizedDecision)) {
    throw error("Approval decision must be approve, reject, or return.");
  }
  if (
    ["reject", "return"].includes(normalizedDecision) &&
    !String(remarks || "").trim()
  ) {
    throw error("Remarks are required when rejecting or returning a request.");
  }

  const settings = await settingsService.getSettings(actor.schoolId);
  if (normalizedDecision === "return" && !settings.allowReturn) {
    throw error("Returning requests is disabled in Printing Management.");
  }

  const transaction = await repository.beginTransaction();
  try {
    const printingRequest = await repository.getApprovalRequestForUpdate(
      transaction,
      requestId,
      actor.userId
    );

    if (!printingRequest || !expectedStatuses.includes(printingRequest.Status)) {
      throw error(
        "The request is no longer pending this approval or is assigned elsewhere.",
        409
      );
    }

    assertApprovalScope(actor, printingRequest, role);

    if (normalizedDecision === "reject" || normalizedDecision === "return") {
      const targetStatus =
        normalizedDecision === "reject"
          ? role === "HOD"
            ? PRINTING_STATUSES.REJECTED_BY_HOD
            : PRINTING_STATUSES.REJECTED_BY_HOS
          : role === "HOD"
          ? PRINTING_STATUSES.RETURNED_BY_HOD
          : PRINTING_STATUSES.RETURNED_BY_HOS;

      await repository.updatePendingApproval(transaction, {
        requestId,
        approverId: actor.userId,
        approvalRole: role,
        approvalStatus:
          normalizedDecision === "reject" ? "Rejected" : "Returned",
        remarks,
      });
      const updatedRequest = await repository.updateRequestTerminalStatus(
        transaction,
        { requestId, status: targetStatus, remarks }
      );
      await repository.insertWorkflowEvent(transaction, {
        requestId,
        eventType:
          normalizedDecision === "reject"
            ? "APPROVAL_REJECTED"
            : "REQUEST_RETURNED",
        fromStatus: printingRequest.Status,
        toStatus: targetStatus,
        actorUserId: actor.userId,
        actorAssignmentKey: role,
        remarks,
      });
      await transaction.commit();
      return updatedRequest;
    }

    const quota = await assertQuota(transaction, printingRequest);
    let route;
    let nextApproval = null;

    if (
      role === "HOD" &&
      Number(printingRequest.TotalSheets) > settings.approvalThresholdSheets
    ) {
      const hos = await repository.findHosApprover(transaction, {
        schoolId: printingRequest.SchoolId || actor.schoolId,
        departmentId: printingRequest.DepartmentId,
        sectionId: printingRequest.SectionId,
      });

      if (!hos) throw error("No active HOS assignment covers this request.");

      route = {
        status: PRINTING_STATUSES.PENDING_HOS_APPROVAL,
        approverId: hos.UserId,
      };
      nextApproval = {
        requestId,
        approverId: hos.UserId,
        approvalRole: "HOS",
        stepOrder: 2,
        scopeType: hos.ScopeType,
        scopeEntityId: hos.ScopeEntityId,
      };
    } else {
      route = await resolveQueueRoute(transaction, printingRequest, settings);
    }

    await repository.updatePendingApproval(transaction, {
      requestId,
      approverId: actor.userId,
      approvalRole: role,
      approvalStatus: "Approved",
      remarks: remarks || `Approved by ${role}`,
    });
    if (nextApproval) {
      await repository.insertApproval(transaction, nextApproval);
    }
    const updatedRequest = await repository.updateRequestRoute(transaction, {
      requestId,
      status: route.status,
      approverId: route.approverId,
    });
    await repository.insertWorkflowEvent(transaction, {
      requestId,
      eventType: "APPROVAL_APPROVED",
      fromStatus: printingRequest.Status,
      toStatus: route.status,
      actorUserId: actor.userId,
      actorAssignmentKey: role,
      remarks,
      metadata: {
        quota,
        nextApproverId: route.approverId,
      },
    });

    await transaction.commit();
    return updatedRequest;
  } catch (approvalError) {
    try {
      await transaction.rollback();
    } catch {
      // Preserve the original approval error.
    }
    throw approvalError;
  }
};

module.exports = {
  createDraft,
  uploadAttachment,
  submitRequest,
  listMyRequests,
  listMyAttachments,
  getRequestById,
  cancelRequest,
  listApprovalInbox,
  listApprovalHistory,
  getApprovalSummary,
  decideApproval,
};
