// ============================================================
// Arab Unity School Operations Platform
// Printing Status Constants
// ============================================================
//
// Purpose:
// Centralizes every printing/request status used by the Printing
// module so workflow logic is controlled, consistent, and easy
// to update later.
//
// ============================================================

const PRINTING_STATUSES = Object.freeze({
  DRAFT: "Draft",
  PENDING: "Pending",
  PENDING_HOD_APPROVAL: "Pending HOD Approval",
  PENDING_HOS_APPROVAL: "Pending HOS Approval",
  FORWARDED_TO_HOS: "Forwarded to HOS",

  APPROVED_BY_HOD: "Approved by HOD",
  APPROVED_BY_HOS: "Approved by HOS",
  FORWARDED_TO_PRINTING: "Forwarded to Printing",
  QUEUED: "Queued for Printing",

  PRINTING: "Printing",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
  CANCELLED_BY_REQUESTER: "Cancelled by Teacher",
  COMPLETED: "Completed",

  REJECTED_BY_HOD: "Rejected by HOD",
  REJECTED_BY_HOS: "Rejected by HOS",
  RETURNED_BY_HOD: "Returned by HOD",
  RETURNED_BY_HOS: "Returned by HOS",
});

const PRINTING_QUEUE_STATUSES = Object.freeze([
  PRINTING_STATUSES.APPROVED_BY_HOD,
  PRINTING_STATUSES.APPROVED_BY_HOS,
  PRINTING_STATUSES.FORWARDED_TO_PRINTING,
  PRINTING_STATUSES.QUEUED,
  PRINTING_STATUSES.PRINTING,
  PRINTING_STATUSES.ON_HOLD,
]);

const PRINTING_START_ALLOWED_STATUSES = Object.freeze([
  PRINTING_STATUSES.APPROVED_BY_HOD,
  PRINTING_STATUSES.APPROVED_BY_HOS,
  PRINTING_STATUSES.FORWARDED_TO_PRINTING,
  PRINTING_STATUSES.QUEUED,
]);

const HOD_PENDING_STATUSES = Object.freeze([
  PRINTING_STATUSES.PENDING,
  PRINTING_STATUSES.PENDING_HOD_APPROVAL,
]);

const HOS_PENDING_STATUSES = Object.freeze([
  PRINTING_STATUSES.PENDING_HOS_APPROVAL,
  PRINTING_STATUSES.FORWARDED_TO_HOS,
]);

const REQUESTER_CANCELLABLE_STATUSES = Object.freeze([
  PRINTING_STATUSES.DRAFT,
  ...HOD_PENDING_STATUSES,
  ...HOS_PENDING_STATUSES,
  PRINTING_STATUSES.APPROVED_BY_HOD,
  PRINTING_STATUSES.APPROVED_BY_HOS,
  PRINTING_STATUSES.FORWARDED_TO_PRINTING,
  PRINTING_STATUSES.QUEUED,
]);

module.exports = {
  PRINTING_STATUSES,
  PRINTING_QUEUE_STATUSES,
  PRINTING_START_ALLOWED_STATUSES,
  HOD_PENDING_STATUSES,
  HOS_PENDING_STATUSES,
  REQUESTER_CANCELLABLE_STATUSES,
};
