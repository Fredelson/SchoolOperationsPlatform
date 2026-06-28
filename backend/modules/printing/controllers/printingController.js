// ============================================================
// Arab Unity School Operations Platform
// Printing Controller
// ============================================================
//
// Purpose:
// Handles HTTP requests and responses for the Printing module.
//
// Architecture:
// Controller Layer
//
// Rules:
// - No SQL here
// - No business logic here
// - Calls service layer only
// - Uses standardized API responses
//
// ============================================================

const asyncHandler = require("../../../shared/helpers/asyncHandler");

const {
  sendSuccess,
} = require("../../../shared/helpers/apiResponse");

const printingService = require("../services/printingService");

// ============================================================
// Dashboard
// ============================================================

const getPrintingDashboard = asyncHandler(async (req, res) => {
  const printingAdminId = req.user.id;

  const dashboard = await printingService.getPrintingDashboard(
    printingAdminId
  );

  return sendSuccess(
    res,
    "Printing dashboard loaded successfully.",
    dashboard
  );
});

// ============================================================
// Queue
// ============================================================

const getPrintingQueue = asyncHandler(async (req, res) => {
  const printingAdminId = req.user.id;

  const queue = await printingService.getPrintingQueue(printingAdminId);

  return sendSuccess(
    res,
    "Printing queue loaded successfully.",
    queue
  );
});

// ============================================================
// Single Request Details
// ============================================================

const getPrintingRequestById = asyncHandler(async (req, res) => {
  const printingAdminId = req.user.id;
  const requestId = Number(req.params.id);

  const request = await printingService.getPrintingRequestById(
    requestId,
    printingAdminId
  );

  return sendSuccess(
    res,
    "Printing request loaded successfully.",
    request
  );
});

// ============================================================
// Start Printing
// ============================================================

const startPrinting = asyncHandler(async (req, res) => {
  const printingAdminId = req.user.id;
  const requestId = Number(req.params.id);

  const result = await printingService.startPrinting(
    requestId,
    printingAdminId
  );

  return sendSuccess(
    res,
    result.message,
    result.request
  );
});

// ============================================================
// Hold Printing
// ============================================================

const holdPrinting = asyncHandler(async (req, res) => {
  const printingAdminId = req.user.id;
  const requestId = Number(req.params.id);
  const { remarks } = req.body || {};

  const result = await printingService.holdPrinting(
    requestId,
    printingAdminId,
    remarks
  );

  return sendSuccess(
    res,
    result.message,
    result.request
  );
});

// ============================================================
// Resume Printing
// ============================================================

const resumePrinting = asyncHandler(async (req, res) => {
  const printingAdminId = req.user.id;
  const requestId = Number(req.params.id);

  const result = await printingService.resumePrinting(
    requestId,
    printingAdminId
  );

  return sendSuccess(
    res,
    result.message,
    result.request
  );
});

// ============================================================
// Cancel Printing
// ============================================================

const cancelPrinting = asyncHandler(async (req, res) => {
  const printingAdminId = req.user.id;
  const requestId = Number(req.params.id);
  const { remarks } = req.body || {};

  const result = await printingService.cancelPrinting(
    requestId,
    printingAdminId,
    remarks
  );

  return sendSuccess(
    res,
    result.message,
    result.request
  );
});

// ============================================================
// Complete Printing
// ============================================================

const completePrinting = asyncHandler(async (req, res) => {
  const printingAdminId = req.user.id;
  const requestId = Number(req.params.id);

  const {
    remarks,
    actualPrintedSheets,
    printerAssetId,
  } = req.body || {};

  const result = await printingService.completePrinting(
    requestId,
    printingAdminId,
    {
      remarks,
      actualPrintedSheets,
      printerAssetId,
    }
  );

  return sendSuccess(
    res,
    result.message,
    result
  );
});

// ============================================================
// History
// ============================================================

const getPrintingHistory = asyncHandler(async (req, res) => {
  const history = await printingService.getPrintingHistory();

  return sendSuccess(
    res,
    "Printing history loaded successfully.",
    history
  );
});

// ============================================================
// Exports
// ============================================================

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