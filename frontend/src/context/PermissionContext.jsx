// ============================================
// ARAB UNITY SCHOOL
// Permission Context
//
// Temporary frontend-only version.
//
// Purpose:
// Prevents missing backend permission APIs from blocking UI development.
//
// Backend APIs will be added later:
// - GET /api/permissions/me
// - GET /api/permissions/me/modules
// - GET /api/permissions/me/actions
// - GET /api/permissions/me/widgets
// - GET /api/feature-flags
// ============================================

import { createContext, useContext } from "react";

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const value = {
    loading: false,

    permissions: [],
    modules: [],
    actions: [],
    widgets: [],
    featureFlags: {},

    hasRole: () => true,
    hasPermission: () => true,
    hasModuleAccess: () => true,
    hasActionAccess: () => true,
    hasWidgetAccess: () => true,
    isFeatureEnabled: () => true,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error("usePermissions must be used inside PermissionProvider");
  }

  return context;
}
