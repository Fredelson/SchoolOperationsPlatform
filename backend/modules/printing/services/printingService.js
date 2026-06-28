// ============================================================
// Arab Unity School Operations Platform
// Printing Service
// ============================================================
//
// Purpose:
// Owns all Printing business logic and workflow rules.
//
// Architecture:
// Service Layer
//
// Rules:
// - Business logic lives here
// - Controllers stay thin
// - Repository handles SQL only
// - Printing workflow is fully backend-controlled
//
// ============================================================

const { sql, poolPromise } = require("../../../shared/database");

const printingRepository = require("../repositories/printingRepository");

const {
  PRINTING_STATUSES,
} = require("../constants/printingStatuses");

const {
  buildPrintCalculationSummary,
} = require("../helpers/printCalculationEngine");

const {
  canStartPrinting,
  canHoldPrinting,
  canResumePrinting,
  canCompletePrinting,
  canCancelPrinting,
  assertWorkflowAllowed,
} = require("../helpers/printingWorkflow");

// ============================================================
// Error Helper
// ============================================================

const createServiceError = (message, statusCode = 400, details = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  if (details) {
    error.details = details;
  }

  return error;
};

// ============================================================
// Dashboard
// ============================================================

const getPrintingDashboard = async (printingAdminId) => {
  const [
    kpis,
    inventory,
    jobStatus,
    topDepartments,
    recentJobs,
  ] = await Promise.all([
    printingRepository.getDashboardKpis(printingAdminId),
    printingRepository.getDashboardInventory(),
    printingRepository.getDashboardJobStatus(printingAdminId),
    printingRepository.getTopDepartmentsThisMonth(),
    printingRepository.getRecentPrintJobs(),
  ]);

  const a4 = inventory.find((item) => item.PaperType === "A4");
  const a3 = inventory.find((item) => item.PaperType === "A3");

  const a4Stock = Number(a4?.CurrentStock || 0);
  const a3Stock = Number(a3?.CurrentStock || 0);

  return {
    stats: [
      {
        title: "Pending Jobs",
        value: Number(kpis?.PendingJobs || 0),
        subtitle: "Awaiting printing",
        color: "warning",
        icon: "pending",
      },
      {
        title: "Printing Now",
        value: Number(kpis?.PrintingNow || 0),
        subtitle: "Currently printing",
        color: "info",
        icon: "printing",
      },
      {
        title: "On Hold",
        value: Number(kpis?.OnHoldJobs || 0),
        subtitle: "Paused jobs",
        color: "warning",
        icon: "pause",
      },
      {
        title: "Completed Today",
        value: Number(kpis?.CompletedToday || 0),
        subtitle: "Completed today",
        color: "success",
        icon: "completed",
      },
      {
        title: "Completed Month",
        value: Number(kpis?.CompletedMonth || 0),
        subtitle: "This month",
        color: "info",
        icon: "calendar",
      },
      {
        title: "Overdue Jobs",
        value: Number(kpis?.OverdueJobs || 0),
        subtitle: "Past due date",
        color: "danger",
        icon: "warning",
      },
      {
        title: "A4 Stock",
        value: a4Stock.toLocaleString(),
        subtitle: "Sheets available",
        color: a4Stock <= 3000 ? "danger" : "success",
        icon: "inventory",
      },
      {
        title: "A3 Stock",
        value: a3Stock.toLocaleString(),
        subtitle: "Sheets available",
        color: a3Stock <= 1500 ? "danger" : "success",
        icon: "inventory",
      },
    ],

    jobStatus: [
      {
        key: "pending",
        label: "Pending",
        value: Number(jobStatus?.Pending || 0),
      },
      {
        key: "printing",
        label: "Printing",
        value: Number(jobStatus?.Printing || 0),
      },
      {
        key: "onHold",
        label: "On Hold",
        value: Number(jobStatus?.OnHold || 0),
      },
      {
        key: "completed",
        label: "Completed",
        value: Number(jobStatus?.Completed || 0),
      },
      {
        key: "rejected",
        label: "Rejected",
        value: Number(jobStatus?.Rejected || 0),
      },
      {
        key: "cancelled",
        label: "Cancelled",
        value: Number(jobStatus?.Cancelled || 0),
      },
    ],

    topDepartments,

    recentJobs: recentJobs.map((job) => ({
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
        total: 15000,
        minimum: 3000,
      },
      {
        paperType: "A3 Paper",
        current: a3Stock,
        total: 6000,
        minimum: 1500,
      },
    ],
  };
};

// ============================================================
// Queue / Details
// ============================================================

const getPrintingQueue = async (printingAdminId) => {
  const queue = await printingRepository.getPrintingQueue(printingAdminId);

  return queue.map((request) => ({
    ...request,
    printSummary: buildPrintCalculationSummary({
      totalPages: request.TotalPages,
      copies: request.Copies,
      printSide: request.PrintSide,
      paperSize: request.PaperSize,
      printType: request.PrintType,
    }),
  }));
};

const getPrintingRequestById = async (requestId, printingAdminId) => {
  const request = await printingRepository.getPrintingRequestById(
    requestId,
    printingAdminId
  );

  if (!request) {
    throw createServiceError(
      "Printing request not found or not assigned to this Printing Admin.",
      404
    );
  }

  return {
    ...request,
    printSummary: buildPrintCalculationSummary({
      totalPages: request.TotalPages,
      copies: request.Copies,
      printSide: request.PrintSide,
      paperSize: request.PaperSize,
      printType: request.PrintType,
    }),
  };
};

// ============================================================
// Workflow Actions
// ============================================================

const startPrinting = async (requestId, printingAdminId) => {
  const request = await printingRepository.getRequestForWorkflow(
    requestId,
    printingAdminId
  );

  if (!request) {
    throw createServiceError(
      "Request not found or not assigned to this Printing Admin.",
      404
    );
  }

  assertWorkflowAllowed(
    canStartPrinting(request.Status),
    `Request cannot start printing while status is '${request.Status}'.`
  );

  const updatedRequest = await printingRepository.markAsPrinting(
    requestId,
    printingAdminId
  );

  return {
    message: "Printing started successfully.",
    request: updatedRequest,
  };
};

const holdPrinting = async (requestId, printingAdminId, remarks = null) => {
  const request = await printingRepository.getRequestForWorkflow(
    requestId,
    printingAdminId
  );

  if (!request) {
    throw createServiceError(
      "Request not found or not assigned to this Printing Admin.",
      404
    );
  }

  assertWorkflowAllowed(
    canHoldPrinting(request.Status),
    `Request cannot be placed on hold while status is '${request.Status}'.`
  );

  const updatedRequest = await printingRepository.markAsOnHold(
    requestId,
    printingAdminId,
    remarks
  );

  return {
    message: "Printing request placed on hold.",
    request: updatedRequest,
  };
};

const resumePrinting = async (requestId, printingAdminId) => {
  const request = await printingRepository.getRequestForWorkflow(
    requestId,
    printingAdminId
  );

  if (!request) {
    throw createServiceError(
      "Request not found or not assigned to this Printing Admin.",
      404
    );
  }

  assertWorkflowAllowed(
    canResumePrinting(request.Status),
    `Request cannot resume while status is '${request.Status}'.`
  );

  const updatedRequest = await printingRepository.markAsPrinting(
    requestId,
    printingAdminId
  );

  return {
    message: "Printing resumed successfully.",
    request: updatedRequest,
  };
};

const cancelPrinting = async (requestId, printingAdminId, remarks = null) => {
  const request = await printingRepository.getRequestForWorkflow(
    requestId,
    printingAdminId
  );

  if (!request) {
    throw createServiceError(
      "Request not found or not assigned to this Printing Admin.",
      404
    );
  }

  assertWorkflowAllowed(
    canCancelPrinting(request.Status),
    `Request cannot be cancelled while status is '${request.Status}'.`
  );

  const updatedRequest = await printingRepository.markAsCancelled(
    requestId,
    printingAdminId,
    remarks || "Cancelled by Printing Admin"
  );

  return {
    message: "Printing request cancelled successfully.",
    request: updatedRequest,
  };
};

const completePrinting = async (
  requestId,
  printingAdminId,
  { remarks = null, actualPrintedSheets = null, printerAssetId = null } = {}
) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const request = await printingRepository.getRequestForWorkflow(
      requestId,
      printingAdminId,
      transaction
    );

    if (!request) {
      throw createServiceError(
        "Request not found, not printing, or not assigned to this Printing Admin.",
        404
      );
    }

    assertWorkflowAllowed(
      canCompletePrinting(request.Status),
      `Request cannot be completed while status is '${request.Status}'.`
    );

    const paperType = request.PaperSize || "A4";
    const expectedSheets = Number(request.TotalSheets || 0);
    const printedSheets =
      actualPrintedSheets !== null && actualPrintedSheets !== undefined
        ? Number(actualPrintedSheets)
        : expectedSheets;

    if (!printedSheets || printedSheets <= 0) {
      throw createServiceError(
        "Printed sheets must be greater than zero.",
        400
      );
    }

    const inventory = await printingRepository.getPaperInventoryForUpdate(
      transaction,
      paperType
    );

    if (!inventory) {
      throw createServiceError(
        `No inventory record found for ${paperType}.`,
        404
      );
    }

    const previousStock = Number(inventory.CurrentStock || 0);
    const newStock = previousStock - printedSheets;

    if (previousStock < printedSheets) {
      throw createServiceError(
        `Not enough ${paperType} stock. Available: ${previousStock}, Required: ${printedSheets}.`,
        400,
        {
          paperType,
          availableStock: previousStock,
          requiredSheets: printedSheets,
        }
      );
    }

    await printingRepository.deductPaperInventory(
      transaction,
      inventory.InventoryId,
      printedSheets
    );

    await printingRepository.insertInventoryTransaction(transaction, {
      paperType,
      transactionType: "DEDUCTION",
      quantity: printedSheets,
      previousStock,
      newStock,
      referenceId: requestId,
      remarks:
        remarks ||
        `Deducted ${printedSheets} sheets of ${paperType} for completed print request ${request.RequestNumber}`,
      createdBy: printingAdminId,
    });

    await printingRepository.markRequestCompleted(transaction, requestId);

    await printingRepository.insertPrintingLog(transaction, {
      requestId,
      printedBy: printingAdminId,
      printerAssetId,
      printedPages: Number(request.TotalPages || 0),
      printedSheets,
      remarks: remarks || "Printing completed",
    });

    await transaction.commit();

    return {
      message:
        "Printing completed successfully, inventory deducted, and logs saved.",
      requestId,
      requestNumber: request.RequestNumber,
      paperType,
      printedSheets,
      previousStock,
      newStock,
    };
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Complete printing rollback error:", rollbackError);
    }

    throw error;
  }
};

// ============================================================
// History
// ============================================================

const getPrintingHistory = async () => {
  return printingRepository.getPrintingHistory();
};

module.exports = {
  getPrintingDashboard,
  getPrintingQueue,
  getPrintingRequestById,

  startPrinting,
  holdPrinting,
  resumePrinting,
  cancelPrinting,
  completePrinting,

  getPrintingHistory,
};