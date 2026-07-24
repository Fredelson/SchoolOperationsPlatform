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
  const { user, token, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState({ permissions: [], allowedPermissionKeys: [] });
  const [loading, setLoading] = useState(Boolean(token));

  const loadPermissions = useCallback(async () => {
    if (!token) {
      setProfile({ permissions: [], allowedPermissionKeys: [] });
      setLoading(false);
      return;
    }
    if (authLoading) return;
    if (user?.mustChangePassword) {
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
  }, [authLoading, token, user?.mustChangePassword]);

  useEffect(() => {
     
    loadPermissions();
  }, [loadPermissions]);

  const value = useMemo(() => {
    const allowed = new Set(profile.allowedPermissionKeys || []);
    const normalizedRole=String(user?.roleKey||user?.role||user?.Role||profile.user?.roleKey||profile.user?.Role||"").replace(/[\s_-]/g,"").toLowerCase();
    const isSuperAdmin=normalizedRole==="superadmin";
    const isPlatformAdmin=normalizedRole==="platformadmin";
    const hasWorkspaceView=allowed.has("workspace.view");
    const allowedButtons=new Set((profile.runtimeControls?.buttons||[]).map(item=>item.ButtonKey));
    const allowedWidgets=new Set((profile.runtimeControls?.widgets||[]).map(item=>item.WidgetKey));
    const visibleRoutes=new Set();const collect=items=>(items||[]).forEach(item=>{if(item.path||item.route)visibleRoutes.add(item.path||item.route);collect(item.children)});(profile.sidebar||[]).forEach(section=>collect(section.items));
    const modulePermissionMap = new Map();
    (profile.permissions || []).forEach((permission) => {
      const rawKey = permission.permissionKey || "";
      const moduleKey = rawKey.split(".")[0];
      if (!moduleKey) return;
      if (!modulePermissionMap.has(moduleKey)) {
        modulePermissionMap.set(moduleKey, new Set());
      }
      modulePermissionMap.get(moduleKey).add(rawKey);
    });

    const sidebarModuleKeys = new Set();
    const collectSidebarModules = (items) => {
      (items || []).forEach((item) => {
        const key = item.moduleKey || item.module || item.ModuleKey || item.Module;
        if (key) sidebarModuleKeys.add(String(key).toLowerCase().replace(/[\s-]/g, "_").replace(/[^a-z0-9_]/g, ""));
        collectSidebarModules(item.children);
      });
    };
    (profile.sidebar || []).forEach((section) => collectSidebarModules(section.items));

    const normalizeModuleName = (moduleName = "") =>
      String(moduleName)
        .trim()
        .toLowerCase()
        .replace(/[\s-]/g, "_")
        .replace(/[^a-z0-9_]/g, "");

    const canAccessModule = (moduleName = "") => {
      if (isSuperAdmin || isPlatformAdmin || hasWorkspaceView) return true;
      const normalized = normalizeModuleName(moduleName);
      const candidates = new Set([normalized, normalized.replace(/_/g, "")]);
      for (const [moduleKey, permissions] of modulePermissionMap.entries()) {
        if (permissions.size === 0) continue;
        if (candidates.has(moduleKey) || candidates.has(moduleKey.replace(/_/g, ""))) {
          return true;
        }
      }
      for (const candidate of candidates) {
        if (sidebarModuleKeys.has(candidate)) {
          return true;
        }
      }
      return false;
    };

    return {
      loading,
      permissions: profile.permissions || [], modules: [], actions: profile.allowedPermissionKeys || [],
      buttons: profile.runtimeControls?.buttons||[], widgets: profile.runtimeControls?.widgets||[], featureFlags: {},
      hasRole: (role) => [user?.Role, user?.role, profile.user?.roleKey].includes(role),
      hasPermission: (key) => isSuperAdmin || isPlatformAdmin || hasWorkspaceView || allowed.has(key),
      canAccessModule,
      hasModuleAccess: canAccessModule,
      hasActionAccess: (moduleName, actionName) => {
        if (isSuperAdmin || isPlatformAdmin || hasWorkspaceView) return true;
        return false;
      },
      hasButtonAccess: (key) => isSuperAdmin || isPlatformAdmin || allowedButtons.has(key),
      hasWidgetAccess: (key) => isSuperAdmin || isPlatformAdmin || allowedWidgets.has(key),
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
