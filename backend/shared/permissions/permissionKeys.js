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
    DELETE: "users.delete",
  },

  ROLES: {
    VIEW: "roles.view",
    CREATE: "roles.create",
    UPDATE: "roles.update",
    DELETE: "roles.delete",
  },

  MODULES: {
    VIEW: "modules.view",
    CREATE: "modules.create",
    UPDATE: "modules.update",
    DELETE: "modules.delete",
  },

  MENUS: {
    VIEW: "menus.view",
    CREATE: "menus.create",
    UPDATE: "menus.update",
    DELETE: "menus.delete",
  },

  WORKSPACE: {
    VIEW: "workspace.view",
    CONFIGURE: "workspace.configure",
    ACTIVATE: "workspace.activate",
    DISABLE: "workspace.disable",
  },

  SYSTEM_SETTINGS: {
    VIEW: "system_settings.view",
    UPDATE: "system_settings.update",
  },
};

module.exports = PERMISSIONS;
