const printingRepository = require("../repositories/printingRepository");
const printingRequestRepository = require("../repositories/printingRequestRepository");
const settingsService = require("./printingSettingsService");
const accessService = require("./printingAccessService");
const {
  PRINTING_STATUSES,
  PRINTING_START_ALLOWED_STATUSES,
} = require("../constants/printingStatuses");
const {
  canHoldPrinting,
  canResumePrinting,
  canCompletePrinting,
  canCancelPrinting,
} = require("../helpers/printingWorkflow");

const serviceError = (message, statusCode = 400, details = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
};

const assertQueueAccess = (actor) =>
  accessService.assertCapability(actor, accessService.CAPABILITIES.MANAGE_QUEUE);

const canOperateRequest = (printingRequest, actor, assignmentMode) => {
  if (Number(printingRequest.ClaimedByUserId) === actor.userId) return true;
  if (Number(printingRequest.CurrentApproverId) === actor.userId) return true;

  return (
    assignmentMode === "shared" &&
    !printingRequest.ClaimedByUserId &&
    !printingRequest.CurrentApproverId
  );
};

const withTransaction = async (callback) => {
  const transaction = await printingRepository.beginTransaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // Preserve the original workflow error.
    }
    throw error;
  }
};

const getPrintingDashboard = async (actor) => {
  assertQueueAccess(actor);
  const settings = await settingsService.getSettings(actor.schoolId);
  const [
    kpis,
    inventory,
    jobStatus,
    activity,
    paperUsageRows,
    topDepartments,
    recentJobs,
  ] =
    await Promise.all([
      printingRepository.getDashboardKpis(actor.schoolId, actor.userId),
      printingRepository.getDashboardInventory(),
      printingRepository.getDashboardJobStatus(actor.schoolId),
      printingRepository.getDashboardActivity(actor.schoolId),
      printingRepository.getDashboardPaperUsage(actor.schoolId),
      printingRepository.getTopDepartmentsThisMonth(actor.schoolId),
      printingRepository.getRecentPrintJobs(actor.schoolId),
    ]);

  const stockByType = Object.fromEntries(
    inventory.map((item) => [item.PaperType, Number(item.CurrentStock || 0)])
  );
  const a4Stock = stockByType.A4 || 0;
  const a3Stock = stockByType.A3 || 0;
  const usedByType = Object.fromEntries(
    paperUsageRows.map((item) => [
      String(item.PaperType || "").toUpperCase(),
      Number(item.UsedSheets || 0),
    ])
  );
  const a4Used = usedByType.A4 || 0;
  const a3Used = usedByType.A3 || 0;
  const formatActivityDate = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  });
  const pendingActions = [];

  if (a4Stock <= settings.lowStockA4) {
    pendingActions.push({
      title: "A4 stock is below its configured threshold",
      module: "Paper Inventory",
      requestedBy: "Printing Management",
      time: `${a4Stock.toLocaleString()} sheets available`,
      status: "Pending",
    });
  }
  if (a3Stock <= settings.lowStockA3) {
    pendingActions.push({
      title: "A3 stock is below its configured threshold",
      module: "Paper Inventory",
      requestedBy: "Printing Management",
      time: `${a3Stock.toLocaleString()} sheets available`,
      status: "Pending",
    });
  }
  if (Number(kpis.PendingJobs || 0) > 0) {
    pendingActions.push({
      title: `${Number(kpis.PendingJobs)} print jobs are waiting`,
      module: "Print Queue",
      requestedBy: "Request workflow",
      time: "Current queue",
      status: "Pending",
    });
  }
  if (Number(kpis.OverdueJobs || 0) > 0) {
    pendingActions.push({
      title: `${Number(kpis.OverdueJobs)} print jobs are overdue`,
      module: "Print Queue",
      requestedBy: "Due date monitor",
      time: "Requires attention",
      status: "Pending",
    });
  }

  return {
    stats: [
      {
        title: "Pending Jobs",
        value: Number(kpis.PendingJobs || 0),
        subtitle: "Available in the printing queue",
        color: "warning",
        icon: "pending",
      },
      {
        title: "Printing Now",
        value: Number(kpis.PrintingNow || 0),
        subtitle: "Claimed by you",
        color: "info",
        icon: "printing",
      },
      {
        title: "On Hold",
        value: Number(kpis.OnHoldJobs || 0),
        subtitle: "Paused by you",
        color: "warning",
        icon: "pause",
      },
      {
        title: "Completed Today",
        value: Number(kpis.CompletedToday || 0),
        subtitle: "All operators",
        color: "success",
        icon: "completed",
      },
      {
        title: "A4 Stock",
        value: a4Stock.toLocaleString(),
        subtitle: "Sheets available",
        color: a4Stock <= settings.lowStockA4 ? "danger" : "success",
        icon: "inventory",
      },
      {
        title: "A3 Stock",
        value: a3Stock.toLocaleString(),
        subtitle: "Sheets available",
        color: a3Stock <= settings.lowStockA3 ? "danger" : "success",
        icon: "inventory",
      },
    ],
    printActivity: activity.map((item) => ({
      month: formatActivityDate.format(new Date(item.ActivityDate)),
      printRequests: Number(item.PrintRequests || 0),
      completedJobs: Number(item.CompletedJobs || 0),
    })),
    jobStatus: [
      { key: "pending", label: "Pending", value: Number(jobStatus.Pending || 0) },
      {
        key: "printing",
        label: "Printing",
        value: Number(jobStatus.Printing || 0),
      },
      { key: "onHold", label: "On Hold", value: Number(jobStatus.OnHold || 0) },
      {
        key: "completed",
        label: "Completed",
        value: Number(jobStatus.Completed || 0),
      },
      {
        key: "rejected",
        label: "Rejected",
        value: Number(jobStatus.Rejected || 0),
      },
      {
        key: "cancelled",
        label: "Cancelled",
        value: Number(jobStatus.Cancelled || 0),
      },
    ],
    inventoryHealth: [
      {
        label: "A4 Paper",
        status: a4Stock <= settings.lowStockA4 ? "Low" : "Healthy",
        value: a4Stock,
      },
      {
        label: "A3 Paper",
        status: a3Stock <= settings.lowStockA3 ? "Low" : "Healthy",
        value: a3Stock,
      },
      {
        label: "Inventory Deduction",
        status: "Active",
        value: 100,
      },
      {
        label: "Queue Assignment",
        status:
          settings.queueAssignmentMode === "shared"
            ? "Shared"
            : "Direct",
        value: 100,
      },
    ],
    topDepartments,
    recentJobs: recentJobs.map((job) => ({
      requestId: job.RequestId,
      title: `${job.RequestNumber} ${job.Status}`,
      description: `${Number(job.TotalSheets || 0)} sheets`,
      time: job.ActivityDate,
      status:
        job.Status === PRINTING_STATUSES.COMPLETED
          ? "success"
          : job.Status === PRINTING_STATUSES.PRINTING
          ? "warning"
          : "info",
    })),
    inventorySummary: [
      {
        paperType: "A4 Paper",
        current: a4Stock,
        total: a4Stock + a4Used,
        minimum: settings.lowStockA4,
      },
      {
        paperType: "A3 Paper",
        current: a3Stock,
        total: a3Stock + a3Used,
        minimum: settings.lowStockA3,
      },
    ],
    paperUsage: [
      { key: "active", label: "A4 Used", value: a4Used },
      { key: "inProgress", label: "A4 Available", value: a4Stock },
      { key: "comingSoon", label: "A3 Used", value: a3Used },
      { key: "disabled", label: "A3 Available", value: a3Stock },
    ],
    pendingActions,
    configuration: {
      queueAssignmentMode: settings.queueAssignmentMode,
      approvalThresholdSheets: settings.approvalThresholdSheets,
    },
  };
};

const getPrintingQueue = async (actor) => {
  assertQueueAccess(actor);
  const settings = await settingsService.getSettings(actor.schoolId);
  return printingRepository.getPrintingQueue({
    schoolId: actor.schoolId,
    operatorId: actor.userId,
    assignmentMode: settings.queueAssignmentMode,
  });
};

const getPrintingRequestById = async (actor, requestId) => {
  assertQueueAccess(actor);
  const settings = await settingsService.getSettings(actor.schoolId);
  const visibleRequest = await printingRepository.getPrintingRequestById({
    requestId,
    schoolId: actor.schoolId,
    operatorId: actor.userId,
    assignmentMode: settings.queueAssignmentMode,
  });

  if (!visibleRequest) {
    throw serviceError("Printing request is not available in your queue.", 404);
  }

  return printingRequestRepository.getRequestBundle(requestId);
};

const claimPrinting = async (actor, requestId) => {
  assertQueueAccess(actor);
  const settings = await settingsService.getSettings(actor.schoolId);

  return withTransaction(async (transaction) => {
    const printingRequest =
      await printingRepository.getQueueRequestForUpdate(
        transaction,
        requestId,
        actor.schoolId
      );

    if (!printingRequest) throw serviceError("Printing request not found.", 404);
    if (!PRINTING_START_ALLOWED_STATUSES.includes(printingRequest.Status)) {
      throw serviceError(
        `Request cannot be claimed while status is '${printingRequest.Status}'.`,
        409
      );
    }
    if (!canOperateRequest(printingRequest, actor, settings.queueAssignmentMode)) {
      throw serviceError("This printing request is assigned to another operator.", 409);
    }

    const updatedRequest = await printingRepository.updateQueueState(
      transaction,
      {
        requestId,
        status: printingRequest.Status,
        operatorId: actor.userId,
      }
    );
    await printingRepository.insertWorkflowEvent(transaction, {
      requestId,
      eventType: "QUEUE_CLAIMED",
      fromStatus: printingRequest.Status,
      toStatus: printingRequest.Status,
      actorUserId: actor.userId,
      metadata: { queueAssignmentMode: settings.queueAssignmentMode },
    });
    return updatedRequest;
  });
};

const transitionPrinting = async (
  actor,
  requestId,
  { action, remarks = null }
) => {
  assertQueueAccess(actor);
  const settings = await settingsService.getSettings(actor.schoolId);

  return withTransaction(async (transaction) => {
    const printingRequest =
      await printingRepository.getQueueRequestForUpdate(
        transaction,
        requestId,
        actor.schoolId
      );

    if (!printingRequest) throw serviceError("Printing request not found.", 404);
    if (!canOperateRequest(printingRequest, actor, settings.queueAssignmentMode)) {
      throw serviceError("This printing request is assigned to another operator.", 409);
    }

    const transition = {
      start: {
        allowed: PRINTING_START_ALLOWED_STATUSES.includes(printingRequest.Status),
        status: PRINTING_STATUSES.PRINTING,
        eventType: "PRINTING_STARTED",
      },
      hold: {
        allowed: canHoldPrinting(printingRequest.Status),
        status: PRINTING_STATUSES.ON_HOLD,
        eventType: "PRINTING_HELD",
      },
      resume: {
        allowed: canResumePrinting(printingRequest.Status),
        status: PRINTING_STATUSES.PRINTING,
        eventType: "PRINTING_RESUMED",
      },
      cancel: {
        allowed: canCancelPrinting(printingRequest.Status),
        status: PRINTING_STATUSES.CANCELLED,
        eventType: "PRINTING_CANCELLED",
        clearClaim: true,
      },
    }[action];

    if (!transition) throw serviceError("Unsupported printing action.");
    if (!transition.allowed) {
      throw serviceError(
        `Request cannot ${action} while status is '${printingRequest.Status}'.`,
        409
      );
    }
    if (["hold", "cancel"].includes(action) && !String(remarks || "").trim()) {
      throw serviceError(`Remarks are required to ${action} a printing request.`);
    }

    const updatedRequest = await printingRepository.updateQueueState(
      transaction,
      {
        requestId,
        status: transition.status,
        operatorId: actor.userId,
        remarks,
        clearClaim: Boolean(transition.clearClaim),
      }
    );
    await printingRepository.insertWorkflowEvent(transaction, {
      requestId,
      eventType: transition.eventType,
      fromStatus: printingRequest.Status,
      toStatus: transition.status,
      actorUserId: actor.userId,
      remarks,
    });
    return updatedRequest;
  });
};

const normalizeActualConsumptions = (
  expectedConsumptions,
  actualConsumptions,
  actualPrintedSheets
) => {
  const expected = expectedConsumptions.map((item) => ({
    paperType: String(item.PaperType || "A4").toUpperCase(),
    expectedSheets: Number(item.ExpectedSheets || 0),
  }));
  const provided = actualConsumptions || {};

  if (
    actualPrintedSheets !== null &&
    actualPrintedSheets !== undefined &&
    expected.length === 1
  ) {
    provided[expected[0].paperType] = Number(actualPrintedSheets);
  }

  return expected.map((item) => {
    const actualValue =
      provided[item.paperType] ?? provided[item.paperType.toLowerCase()];
    const actualSheets =
      actualValue === undefined ? item.expectedSheets : Number(actualValue);

    if (!Number.isInteger(actualSheets) || actualSheets <= 0) {
      throw serviceError(
        `Actual ${item.paperType} sheet consumption must be a positive whole number.`
      );
    }

    return { ...item, actualSheets };
  });
};

const completePrinting = async (
  actor,
  requestId,
  {
    remarks = null,
    actualPrintedSheets = null,
    actualConsumptions = null,
    printerAssetId = null,
  } = {}
) => {
  assertQueueAccess(actor);

  return withTransaction(async (transaction) => {
    const printingRequest =
      await printingRepository.getQueueRequestForUpdate(
        transaction,
        requestId,
        actor.schoolId
      );

    if (!printingRequest) throw serviceError("Printing request not found.", 404);
    if (
      Number(printingRequest.ClaimedByUserId) !== actor.userId &&
      Number(printingRequest.CurrentApproverId) !== actor.userId
    ) {
      throw serviceError("Only the operator handling this job can complete it.", 409);
    }
    if (!canCompletePrinting(printingRequest.Status)) {
      throw serviceError(
        `Request cannot be completed while status is '${printingRequest.Status}'.`,
        409
      );
    }

    const expectedConsumptions =
      await printingRepository.getExpectedConsumptions(
        transaction,
        requestId,
        printingRequest.PaperSize,
        printingRequest.TotalSheets
      );
    const consumptions = normalizeActualConsumptions(
      expectedConsumptions,
      actualConsumptions,
      actualPrintedSheets
    ).sort((left, right) => left.paperType.localeCompare(right.paperType));

    const inventoryResults = [];
    for (const consumption of consumptions) {
      if (!["A4", "A3"].includes(consumption.paperType)) {
        throw serviceError(
          `Unsupported paper type '${consumption.paperType}' in this request.`
        );
      }

      const inventory = await printingRepository.getPaperInventoryForUpdate(
        transaction,
        consumption.paperType
      );
      if (!inventory) {
        throw serviceError(
          `No inventory record exists for ${consumption.paperType}.`,
          404
        );
      }

      const previousStock = Number(inventory.CurrentStock || 0);
      if (previousStock < consumption.actualSheets) {
        throw serviceError(
          `Not enough ${consumption.paperType} stock. Available: ${previousStock}, required: ${consumption.actualSheets}.`,
          409,
          {
            paperType: consumption.paperType,
            availableStock: previousStock,
            requiredSheets: consumption.actualSheets,
          }
        );
      }

      const newStock = previousStock - consumption.actualSheets;
      await printingRepository.deductPaperInventory(
        transaction,
        inventory.InventoryId,
        consumption.actualSheets
      );
      await printingRepository.insertInventoryTransaction(transaction, {
        paperType: consumption.paperType,
        transactionType: "DEDUCTION",
        quantity: consumption.actualSheets,
        previousStock,
        newStock,
        referenceId: requestId,
        remarks:
          remarks ||
          `Completed printing request ${printingRequest.RequestNumber}`,
        createdBy: actor.userId,
      });
      await printingRepository.insertJobConsumption(transaction, {
        requestId,
        paperType: consumption.paperType,
        expectedSheets: consumption.expectedSheets,
        actualSheets: consumption.actualSheets,
        recordedBy: actor.userId,
      });
      inventoryResults.push({
        ...consumption,
        previousStock,
        newStock,
      });
    }

    const totalActualSheets = consumptions.reduce(
      (sum, item) => sum + item.actualSheets,
      0
    );
    const updatedRequest = await printingRepository.updateQueueState(
      transaction,
      {
        requestId,
        status: PRINTING_STATUSES.COMPLETED,
        operatorId: actor.userId,
        remarks,
        clearClaim: true,
        completed: true,
      }
    );
    await printingRepository.insertPrintingLog(transaction, {
      requestId,
      printedBy: actor.userId,
      printerAssetId,
      printedPages: Number(printingRequest.TotalPages || 0),
      printedSheets: totalActualSheets,
      remarks: remarks || "Printing completed",
    });
    await printingRepository.insertWorkflowEvent(transaction, {
      requestId,
      eventType: "PRINTING_COMPLETED",
      fromStatus: printingRequest.Status,
      toStatus: PRINTING_STATUSES.COMPLETED,
      actorUserId: actor.userId,
      remarks,
      metadata: { consumptions: inventoryResults },
    });

    return {
      request: updatedRequest,
      consumptions: inventoryResults,
      totalActualSheets,
    };
  });
};

const getPrintingHistory = (actor) => {
  accessService.assertCapability(
    actor,
    accessService.CAPABILITIES.VIEW_REPORTS
  );
  return printingRepository.getPrintingHistory(actor.schoolId);
};

const listManagedRequests = (actor) => {
  assertQueueAccess(actor);
  return printingRepository.listManagedRequests(actor.schoolId);
};

const getPrintingReport = async (actor) => {
  accessService.assertCapability(
    actor,
    accessService.CAPABILITIES.VIEW_REPORTS
  );
  const [dashboard, history, requests] = await Promise.all([
    getPrintingDashboard(actor),
    printingRepository.getPrintingHistory(actor.schoolId),
    printingRepository.listManagedRequests(actor.schoolId),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    stats: dashboard.stats,
    jobStatus: dashboard.jobStatus,
    topDepartments: dashboard.topDepartments,
    recentCompletions: history.slice(0, 25),
    totalRequests: requests.length,
  };
};

module.exports = {
  getPrintingDashboard,
  getPrintingQueue,
  getPrintingRequestById,
  claimPrinting,
  transitionPrinting,
  completePrinting,
  getPrintingHistory,
  listManagedRequests,
  getPrintingReport,
};
