// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Constants
// Phase 2 Frontend Foundation
// ============================================
//
// Purpose:
// One source of truth for module names,
// permissions, feature flags, and route keys.
//
// Avoid hardcoding strings like "Printing"
// everywhere in the project.
// ============================================

export const MODULES = {
  SUPER_ADMIN: "SuperAdmin",
  DASHBOARD: "Dashboard",
  USERS: "Users",
  ROLES: "Roles",
  PERMISSIONS: "Permissions",
  PRINTING: "Printing",
  REPORTS: "Reports",
  AUDIT_LOGS: "AuditLogs",
  SETTINGS: "Settings",

  IT_TICKETS: "ITTickets",
  ASSETS: "Assets",
  OBSERVATIONS: "Observations",
  STUDENT_IDS: "StudentIDs",
  ACADEMIC: "Academic",
  HR: "HR",
  COMMUNICATION: "Communication",
};

export const ACTIONS = {
  VIEW: "View",
  CREATE: "Create",
  EDIT: "Edit",
  DELETE: "Delete",
  APPROVE: "Approve",
  REJECT: "Reject",
  EXPORT: "Export",
  PRINT: "Print",
  ARCHIVE: "Archive",
  RESTORE: "Restore",
};

export const FEATURE_FLAGS = {
  PRINTING: "Printing",
  IT_TICKETS: "ITTickets",
  ASSETS: "Assets",
  OBSERVATIONS: "Observations",
  STUDENT_IDS: "StudentIDs",
  ACADEMIC: "Academic",
  HR: "HR",
  COMMUNICATION: "Communication",
};

export const buildPermission = (moduleName, actionName) => {
  if (!moduleName || !actionName) return "";
  return `${moduleName}.${actionName}`;
};

export const PERMISSIONS = {
  USERS_VIEW: buildPermission(MODULES.USERS, ACTIONS.VIEW),
  USERS_CREATE: buildPermission(MODULES.USERS, ACTIONS.CREATE),
  USERS_EDIT: buildPermission(MODULES.USERS, ACTIONS.EDIT),
  USERS_DELETE: buildPermission(MODULES.USERS, ACTIONS.DELETE),

  PRINTING_VIEW: buildPermission(MODULES.PRINTING, ACTIONS.VIEW),
  PRINTING_CREATE: buildPermission(MODULES.PRINTING, ACTIONS.CREATE),
  PRINTING_EDIT: buildPermission(MODULES.PRINTING, ACTIONS.EDIT),
  PRINTING_APPROVE: buildPermission(MODULES.PRINTING, ACTIONS.APPROVE),
  PRINTING_REJECT: buildPermission(MODULES.PRINTING, ACTIONS.REJECT),
  PRINTING_EXPORT: buildPermission(MODULES.PRINTING, ACTIONS.EXPORT),

  REPORTS_VIEW: buildPermission(MODULES.REPORTS, ACTIONS.VIEW),
  REPORTS_EXPORT: buildPermission(MODULES.REPORTS, ACTIONS.EXPORT),

  AUDIT_LOGS_VIEW: buildPermission(MODULES.AUDIT_LOGS, ACTIONS.VIEW),

  SETTINGS_VIEW: buildPermission(MODULES.SETTINGS, ACTIONS.VIEW),
  SETTINGS_EDIT: buildPermission(MODULES.SETTINGS, ACTIONS.EDIT),
};

export default MODULES;
