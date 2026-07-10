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

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState({ permissions: [], allowedPermissionKeys: [] });
  const [loading, setLoading] = useState(Boolean(token));

  const loadPermissions = useCallback(async () => {
    if (!token) {
      setProfile({ permissions: [], allowedPermissionKeys: [] });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get("/permission-resolver/me");
      setProfile(response?.data?.data || response?.data || {});
    } catch (error) {
      console.error("Failed to resolve permissions:", error);
      setProfile({ permissions: [], allowedPermissionKeys: [] });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPermissions();
  }, [loadPermissions]);

  const value = useMemo(() => {
    const allowed = new Set(profile.allowedPermissionKeys || []);
    const actionKeys = {
      View: "it_assets.assets.view", Assign: "it_assets.assignment.manage",
      Borrow: "it_assets.borrow.manage",
      Transfer: "it_assets.transfer.manage", ViewIssues: "it_assets.issues.manage",
      PrintTags: "it_assets.tags.print", Maintenance: "it_assets.maintenance.manage",
      Disposal: "it_assets.disposal.manage", Reports: "it_assets.reports.view",
      Import: "it_assets.import.manage",
    };
    return {
      loading,
      permissions: profile.permissions || [], modules: [], actions: profile.allowedPermissionKeys || [],
      widgets: [], featureFlags: {},
      hasRole: (role) => [user?.Role, user?.role, profile.user?.roleKey].includes(role),
      hasPermission: (key) => allowed.has(key),
      hasModuleAccess: (moduleName) => moduleName === "ITAssets"
        ? allowed.has("it_assets.dashboard.view") || allowed.has("it_assets.assets.view")
        : true,
      hasActionAccess: (moduleName, actionName) => moduleName === "ITAssets"
        ? allowed.has(actionKeys[actionName])
        : allowed.has(`${moduleName}.${actionName}`),
      hasWidgetAccess: () => true,
      isFeatureEnabled: () => true,
      reloadPermissions: loadPermissions,
    };
  }, [loading, loadPermissions, profile, user]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

// The provider and its companion hook intentionally share this context module.
// eslint-disable-next-line react-refresh/only-export-components
export function usePermissions() {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error("usePermissions must be used inside PermissionProvider");
  }

  return context;
}
