// ============================================================
// Arab Unity School Operations Platform
// Permission Key Registry
// ============================================================
//
// Purpose:
// Centralizes all permission keys used by backend route
// protection middleware.
//
// Why:
// - Prevents typo mistakes in permission strings
// - Keeps authorization keys consistent
// - Makes future refactoring easier
// - Supports enterprise-grade permission management
//
// Rule:
// Permission keys must still exist in dbo.Permissions.
// This file does not replace the database.
// The database remains the source of truth.
//
// ============================================================

const PERMISSIONS = {
  USERS: {
    VIEW: "users.view",
    CREATE: "users.create",
    UPDATE: "users.update",
    ACTIVATE: "users.activate",
    DEACTIVATE: "users.deactivate",
  },

  ROLES: {
    VIEW: "roles.view",
    CREATE: "roles.create",
    UPDATE: "roles.update",
    DELETE: "roles.delete",
  },

  PERMISSIONS: {
    VIEW: "permissions.view",
    CREATE: "permissions.create",
    UPDATE: "permissions.update",
    DELETE: "permissions.delete",
  },

  ROLE_PERMISSIONS: {
    VIEW: "role-permissions.view",
    CREATE: "role-permissions.create",
    UPDATE: "role-permissions.update",
    DELETE: "role-permissions.delete",
  },

  USER_PERMISSION_OVERRIDES: {
    VIEW: "user-permission-overrides.view",
    CREATE: "user-permission-overrides.create",
    UPDATE: "user-permission-overrides.update",
    DELETE: "user-permission-overrides.delete",
  },

  ASSIGNMENT_TYPES: {
    VIEW: "assignment-types.view",
    CREATE: "assignment-types.create",
    UPDATE: "assignment-types.update",
    DELETE: "assignment-types.delete",
  },

  USER_ASSIGNMENTS: {
    VIEW: "user-assignments.view",
    CREATE: "user-assignments.create",
    UPDATE: "user-assignments.update",
    DELETE: "user-assignments.delete",
  },

  LOOKUPS: {
    VIEW: "lookups.view",
  },

  PRINTING: {
    DASHBOARD_VIEW: "printing.dashboard.view",
    QUEUE_VIEW: "printing.queue.view",
    REQUEST_VIEW: "printing.request.view",

    START: "printing.request.start",
    HOLD: "printing.request.hold",
    RESUME: "printing.request.resume",
    COMPLETE: "printing.request.complete",
    CANCEL: "printing.request.cancel",

    HISTORY_VIEW: "printing.history.view",

    INVENTORY_VIEW: "printing.inventory.view",
    INVENTORY_UPDATE: "printing.inventory.update",

    PURCHASES_VIEW: "printing.purchases.view",
    PURCHASES_CREATE: "printing.purchases.create",
  },
};

module.exports = PERMISSIONS;