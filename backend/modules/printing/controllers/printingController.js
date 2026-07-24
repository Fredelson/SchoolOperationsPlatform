const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");
const printingService = require("../services/printingService");

const getPrintingDashboard = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Printing dashboard loaded.",
    await printingService.getPrintingDashboard(req.printingActor)
  )
);

const getPrintingQueue = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Printing queue loaded.",
    await printingService.getPrintingQueue(req.printingActor)
  )
);

const getPrintingRequestById = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Printing request loaded.",
    await printingService.getPrintingRequestById(
      req.printingActor,
      Number(req.params.id)
    )
  )
);

const claimPrinting = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Printing request claimed.",
    await printingService.claimPrinting(
      req.printingActor,
      Number(req.params.id)
    )
  )
);

const runTransition = (action, message) =>
  asyncHandler(async (req, res) =>
    sendSuccess(
      res,
      message,
      await printingService.transitionPrinting(
        req.printingActor,
        Number(req.params.id),
        { action, remarks: req.body?.remarks }
      )
    )
  );

const startPrinting = runTransition("start", "Printing started.");
const holdPrinting = runTransition("hold", "Printing request placed on hold.");
const resumePrinting = runTransition("resume", "Printing resumed.");
const cancelPrinting = runTransition("cancel", "Printing request cancelled.");

const completePrinting = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Printing completed and inventory deducted.",
    await printingService.completePrinting(
      req.printingActor,
      Number(req.params.id),
      req.body || {}
    )
  )
);

const getPrintingHistory = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Printing history loaded.",
    await printingService.getPrintingHistory(req.printingActor)
  )
);

const listManagedRequests = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Printing requests loaded.",
    await printingService.listManagedRequests(req.printingActor)
  )
);

const getPrintingReport = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    "Printing report loaded.",
    await printingService.getPrintingReport(req.printingActor)
  )
);

module.exports = {
  getPrintingDashboard,
  getPrintingQueue,
  getPrintingRequestById,
  claimPrinting,
  startPrinting,
  holdPrinting,
  resumePrinting,
  cancelPrinting,
  completePrinting,
  getPrintingHistory,
  listManagedRequests,
  getPrintingReport,
};
