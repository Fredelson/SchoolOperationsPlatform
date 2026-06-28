// ============================================================
// Arab Unity School Operations Platform
// Printing Workflow Helper
// ============================================================
//
// Purpose:
// Controls allowed status transitions for Printing requests.
// This prevents random or unsafe status changes from controllers.
//
// ============================================================

const {
  PRINTING_STATUSES,
  PRINTING_START_ALLOWED_STATUSES,
} = require("../constants/printingStatuses");

/**
 * Checks whether a request can start printing.
 */
const canStartPrinting = (status) => {
  return PRINTING_START_ALLOWED_STATUSES.includes(status);
};

/**
 * Checks whether a request can be held.
 */
const canHoldPrinting = (status) => {
  return status === PRINTING_STATUSES.PRINTING;
};

/**
 * Checks whether a request can resume.
 */
const canResumePrinting = (status) => {
  return status === PRINTING_STATUSES.ON_HOLD;
};

/**
 * Checks whether a request can be completed.
 */
const canCompletePrinting = (status) => {
  return status === PRINTING_STATUSES.PRINTING;
};

/**
 * Checks whether a request can be cancelled by Printing Admin.
 */
const canCancelPrinting = (status) => {
  return [
    PRINTING_STATUSES.APPROVED_BY_HOD,
    PRINTING_STATUSES.APPROVED_BY_HOS,
    PRINTING_STATUSES.FORWARDED_TO_PRINTING,
    PRINTING_STATUSES.PRINTING,
    PRINTING_STATUSES.ON_HOLD,
  ].includes(status);
};

/**
 * Throws a controlled error when a transition is not allowed.
 */
const assertWorkflowAllowed = (condition, message) => {
  if (!condition) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  canStartPrinting,
  canHoldPrinting,
  canResumePrinting,
  canCompletePrinting,
  canCancelPrinting,
  assertWorkflowAllowed,
};