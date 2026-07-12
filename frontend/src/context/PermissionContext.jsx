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
      const [response,controlsResponse,sidebarResponse] = await Promise.all([api.get("/permission-resolver/me"),api.get("/navigation/runtime-controls"),api.get("/navigation/sidebar")]);
      setProfile({...response?.data?.data || response?.data || {},runtimeControls:controlsResponse?.data?.data||{buttons:[],widgets:[]},sidebar:sidebarResponse?.data?.data||[]});
    } catch (error) {
      console.error("Failed to resolve permissions:", error);
      setProfile({ permissions: [], allowedPermissionKeys: [] });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
     
    loadPermissions();
  }, [loadPermissions]);

  const value = useMemo(() => {
    const allowed = new Set(profile.allowedPermissionKeys || []);
    const normalizedRole=String(user?.roleKey||user?.role||profile.user?.roleKey||"").replace(/[\s_-]/g,"").toLowerCase();
    const isSuperAdmin=normalizedRole==="superadmin";
    const allowedButtons=new Set((profile.runtimeControls?.buttons||[]).map(item=>item.ButtonKey));
    const allowedWidgets=new Set((profile.runtimeControls?.widgets||[]).map(item=>item.WidgetKey));
    const visibleRoutes=new Set();const collect=items=>(items||[]).forEach(item=>{if(item.path||item.route)visibleRoutes.add(item.path||item.route);collect(item.children)});(profile.sidebar||[]).forEach(section=>collect(section.items));
    const actionKeys = {
      View: "it_assets.assets.view", Assign: "it_assets.assignment.manage",
      Borrow: "it_assets.borrow.manage",
      Transfer: "it_assets.transfer.manage", ViewIssues: "it_assets.issues.manage",
      PrintTags: "asset_tags.rectangular.print",
      PrintRoundedTags: "asset_tags.rounded.print",
      PrintRectangularTags: "asset_tags.rectangular.print",
      Maintenance: "it_assets.maintenance.manage",
      Disposal: "it_assets.disposal.manage", Reports: "it_assets.reports.view",
      Import: "it_assets.import.manage",
    };
    return {
      loading,
      permissions: profile.permissions || [], modules: [], actions: profile.allowedPermissionKeys || [],
      buttons: profile.runtimeControls?.buttons||[], widgets: profile.runtimeControls?.widgets||[], featureFlags: {},
      hasRole: (role) => [user?.Role, user?.role, profile.user?.roleKey].includes(role),
      hasPermission: (key) => isSuperAdmin || allowed.has(key),
      hasModuleAccess: (moduleName) => moduleName === "ITAssets"
        ? allowed.has("it_assets.dashboard.view") || allowed.has("it_assets.assets.view")
        : true,
      hasActionAccess: (moduleName, actionName) => moduleName === "ITAssets"
        ? allowed.has(actionKeys[actionName])
        : allowed.has(`${moduleName}.${actionName}`),
      hasButtonAccess: (key) => allowedButtons.has(key),
      hasWidgetAccess: (key) => allowedWidgets.has(key),
      isRouteVisible: (route) => visibleRoutes.has(route),
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
 
export function usePermissions() {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error("usePermissions must be used inside PermissionProvider");
  }

  return context;
}
