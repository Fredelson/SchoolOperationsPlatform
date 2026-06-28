// ============================================================
// Arab Unity School Operations Platform
// Printing Validator
// ============================================================
//
// Purpose:
// Provides request validation middleware for Printing endpoints.
//
// Architecture:
// Validator Layer
//
// Rules:
// - Validate request params/body only
// - No SQL
// - No business workflow decisions
//
// ============================================================

const asyncHandler = require("../../../shared/helpers/asyncHandler");

const {
  sendError,
} = require("../../../shared/helpers/apiResponse");

// ============================================================
// Shared Helpers
// ============================================================

const isPositiveInteger = (value) => {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0;
};

// ============================================================
// Validate Request ID Param
// ============================================================

const validatePrintingRequestId = asyncHandler(async (req, res, next) => {
  const requestId = Number(req.params.id);

  if (!isPositiveInteger(requestId)) {
    return sendError(
      res,
      "A valid printing request ID is required.",
      400
    );
  }

  return next();
});

// ============================================================
// Validate Hold / Cancel Body
// ============================================================

const validateOptionalRemarks = asyncHandler(async (req, res, next) => {
  const { remarks } = req.body || {};

  if (
    remarks !== undefined &&
    remarks !== null &&
    typeof remarks !== "string"
  ) {
    return sendError(
      res,
      "Remarks must be text.",
      400
    );
  }

  return next();
});

// ============================================================
// Validate Complete Printing Body
// ============================================================

const validateCompletePrinting = asyncHandler(async (req, res, next) => {
  const {
    remarks,
    actualPrintedSheets,
    printerAssetId,
  } = req.body || {};

  if (
    remarks !== undefined &&
    remarks !== null &&
    typeof remarks !== "string"
  ) {
    return sendError(
      res,
      "Remarks must be text.",
      400
    );
  }

  if (
    actualPrintedSheets !== undefined &&
    actualPrintedSheets !== null &&
    !isPositiveInteger(actualPrintedSheets)
  ) {
    return sendError(
      res,
      "Actual printed sheets must be a positive whole number.",
      400
    );
  }

  if (
    printerAssetId !== undefined &&
    printerAssetId !== null &&
    !isPositiveInteger(printerAssetId)
  ) {
    return sendError(
      res,
      "Printer asset ID must be a positive whole number.",
      400
    );
  }

  return next();
});

// ============================================================
// Exports
// ============================================================

module.exports = {
  validatePrintingRequestId,
  validateOptionalRemarks,
  validateCompletePrinting,
};