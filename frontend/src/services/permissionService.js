// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Permission Service
// Phase 2 Frontend Foundation
// ============================================
//
// This file is the single frontend service for:
// - Loading current user permissions
// - Loading allowed modules
// - Loading allowed buttons/actions
// - Loading allowed widgets
// - Loading feature flags
// - Reusable permission checking helpers
//
// Future modules using this:
// Printing, IT Tickets, Assets, Observations,
// Academic Operations, HR, Communication, Student IDs
// ============================================

import api from "./api";

// ============================================
// API ENDPOINTS
// These should match the Phase 1 backend routes
// ============================================

const PERMISSION_ENDPOINTS = {
  myPermissions: "/permissions/me",
  myModules: "/permissions/me/modules",
  myActions: "/permissions/me/actions",
  myWidgets: "/permissions/me/widgets",
  featureFlags: "/feature-flags",
};

// ============================================
// Get Full Current User Permission Profile
// ============================================

export const getMyPermissions = async () => {
  const response = await api.get(PERMISSION_ENDPOINTS.myPermissions);
  return response.data;
};

// ============================================
// Get Modules Current User Can Access
// ============================================

export const getMyModules = async () => {
  const response = await api.get(PERMISSION_ENDPOINTS.myModules);
  return response.data;
};

// ============================================
// Get Buttons / Actions Current User Can Use
// ============================================

export const getMyActions = async () => {
  const response = await api.get(PERMISSION_ENDPOINTS.myActions);
  return response.data;
};

// ============================================
// Get Widgets Current User Can See
// ============================================

export const getMyWidgets = async () => {
  const response = await api.get(PERMISSION_ENDPOINTS.myWidgets);
  return response.data;
};

// ============================================
// Get System Feature Flags
// ============================================

export const getFeatureFlags = async () => {
  const response = await api.get(PERMISSION_ENDPOINTS.featureFlags);
  return response.data;
};

// ============================================
// Normalize Permission Key
// Example:
// moduleName = "Users"
// actionName = "Create"
// returns "Users.Create"
// ============================================

export const buildPermissionKey = (moduleName, actionName) => {
  if (!moduleName || !actionName) return "";
  return `${moduleName}.${actionName}`;
};

// ============================================
// Check Permission By Full Permission Key
// Example:
// hasPermission(permissions, "Users.Create")
// ============================================

export const hasPermission = (permissions = [], permissionKey = "") => {
  if (!permissionKey) return false;

  return permissions.some((permission) => {
    if (typeof permission === "string") {
      return permission === permissionKey;
    }

    return (
      permission.PermissionKey === permissionKey ||
      permission.permissionKey === permissionKey ||
      permission.Key === permissionKey ||
      permission.key === permissionKey
    );
  });
};

// ============================================
// Check Module Access
// Example:
// canAccessModule(modules, "Printing")
// ============================================

export const canAccessModule = (modules = [], moduleName = "") => {
  if (!moduleName) return false;

  return modules.some((module) => {
    if (typeof module === "string") {
      return module === moduleName;
    }

    return (
      module.ModuleName === moduleName ||
      module.moduleName === moduleName ||
      module.Name === moduleName ||
      module.name === moduleName
    );
  });
};

// ============================================
// Check Action / Button Access
// Example:
// canUseAction(actions, "Users", "Delete")
// ============================================

export const canUseAction = (
  actions = [],
  moduleName = "",
  actionName = ""
) => {
  if (!moduleName || !actionName) return false;

  const permissionKey = buildPermissionKey(moduleName, actionName);

  return actions.some((action) => {
    if (typeof action === "string") {
      return action === permissionKey || action === actionName;
    }

    return (
      action.PermissionKey === permissionKey ||
      action.permissionKey === permissionKey ||
      action.ActionName === actionName ||
      action.actionName === actionName ||
      action.ButtonName === actionName ||
      action.buttonName === actionName
    );
  });
};

// ============================================
// Check Widget Visibility
// Example:
// canSeeWidget(widgets, "SystemHealth")
// ============================================

export const canSeeWidget = (widgets = [], widgetName = "") => {
  if (!widgetName) return false;

  return widgets.some((widget) => {
    if (typeof widget === "string") {
      return widget === widgetName;
    }

    return (
      widget.WidgetName === widgetName ||
      widget.widgetName === widgetName ||
      widget.Name === widgetName ||
      widget.name === widgetName
    );
  });
};

// ============================================
// Check Feature Flag
// Example:
// isFeatureEnabled(flags, "Assets")
// ============================================

export const isFeatureEnabled = (featureFlags = [], flagName = "") => {
  if (!flagName) return false;

  const flag = featureFlags.find((item) => {
    if (typeof item === "string") {
      return item === flagName;
    }

    return (
      item.FlagName === flagName ||
      item.flagName === flagName ||
      item.FeatureName === flagName ||
      item.featureName === flagName ||
      item.Name === flagName ||
      item.name === flagName
    );
  });

  if (!flag) return false;

  if (typeof flag === "string") return true;

  return (
    flag.IsEnabled === true ||
    flag.isEnabled === true ||
    flag.Enabled === true ||
    flag.enabled === true
  );
};

// ============================================
// Role Checker
// Example:
// hasRole(user, "SuperAdmin")
// ============================================

export const hasRole = (user, roleName = "") => {
  if (!user || !roleName) return false;

  return (
    user.Role === roleName ||
    user.role === roleName ||
    user.AccessLevelName === roleName ||
    user.accessLevelName === roleName
  );
};

// ============================================
// Common CRUD Helpers
// These will be used by PermissionContext later
// ============================================

export const canView = (permissions = [], moduleName = "") => {
  return hasPermission(permissions, buildPermissionKey(moduleName, "View"));
};

export const canCreate = (permissions = [], moduleName = "") => {
  return hasPermission(permissions, buildPermissionKey(moduleName, "Create"));
};

export const canEdit = (permissions = [], moduleName = "") => {
  return hasPermission(permissions, buildPermissionKey(moduleName, "Edit"));
};

export const canDelete = (permissions = [], moduleName = "") => {
  return hasPermission(permissions, buildPermissionKey(moduleName, "Delete"));
};

export const canApprove = (permissions = [], moduleName = "") => {
  return hasPermission(permissions, buildPermissionKey(moduleName, "Approve"));
};

export const canReject = (permissions = [], moduleName = "") => {
  return hasPermission(permissions, buildPermissionKey(moduleName, "Reject"));
};

export const canExport = (permissions = [], moduleName = "") => {
  return hasPermission(permissions, buildPermissionKey(moduleName, "Export"));
};

// ============================================
// Default Export
// ============================================

const permissionService = {
  getMyPermissions,
  getMyModules,
  getMyActions,
  getMyWidgets,
  getFeatureFlags,

  buildPermissionKey,
  hasPermission,
  canAccessModule,
  canUseAction,
  canSeeWidget,
  isFeatureEnabled,
  hasRole,

  canView,
  canCreate,
  canEdit,
  canDelete,
  canApprove,
  canReject,
  canExport,
};

export default permissionService;
