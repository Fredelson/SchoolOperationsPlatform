// ============================================================
// Arab Unity School Operations Platform
// Printing Permission Constants
// ============================================================
//
// Purpose:
// Centralizes permission keys used by Printing routes.
// These keys should match the database permission registry.
//
// ============================================================

const PRINTING_PERMISSIONS = Object.freeze({
  VIEW_DASHBOARD: "printing.dashboard.view",
  VIEW_QUEUE: "printing.queue.view",
  VIEW_REQUEST: "printing.request.view",

  START: "printing.request.start",
  HOLD: "printing.request.hold",
  RESUME: "printing.request.resume",
  COMPLETE: "printing.request.complete",
  CANCEL: "printing.request.cancel",

  VIEW_HISTORY: "printing.history.view",

  VIEW_INVENTORY: "printing.inventory.view",
  UPDATE_INVENTORY: "printing.inventory.update",

  VIEW_PURCHASES: "printing.purchases.view",
  CREATE_PURCHASE: "printing.purchases.create",
});

module.exports = {
  PRINTING_PERMISSIONS,
};