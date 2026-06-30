// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Sidebar Permission Filter
// Phase 2 Frontend Foundation
// ============================================
//
// Purpose:
// Build sidebar/menu items based on:
// - User role
// - Module access
// - Feature flags
// - Item visibility
// - Permission keys
//
// This keeps Sidebar.jsx clean and readable.
// ============================================

import permissionService from "../services/permissionService";

// ============================================
// Check Single Sidebar Item
// ============================================

export const canShowSidebarItem = ({
  item,
  user,
  modules = [],
  permissions = [],
  featureFlags = [],
}) => {
  if (!item) return false;

  // Hidden manually
  if (item.hidden === true) return false;

  // SuperAdmin can see all non-hidden items
  if (permissionService.hasRole(user, "SuperAdmin")) {
    return true;
  }

  // Feature flag check
  if (item.featureFlag) {
    const enabled = permissionService.isFeatureEnabled(
      featureFlags,
      item.featureFlag
    );

    if (!enabled) return false;
  }

  // Module access check
  if (item.module) {
    const allowedModule = permissionService.canAccessModule(
      modules,
      item.module
    );

    if (!allowedModule) return false;
  }

  // Permission key check
  if (item.permission) {
    const allowedPermission = permissionService.hasPermission(
      permissions,
      item.permission
    );

    if (!allowedPermission) return false;
  }

  return true;
};

// ============================================
// Recursive Sidebar Filter
// Supports sidebar groups and child menus
// ============================================

export const filterSidebarItems = ({
  items = [],
  user,
  modules = [],
  permissions = [],
  featureFlags = [],
}) => {
  return items
    .map((item) => {
      const children = item.children
        ? filterSidebarItems({
            items: item.children,
            user,
            modules,
            permissions,
            featureFlags,
          })
        : [];

      const itemAllowed = canShowSidebarItem({
        item,
        user,
        modules,
        permissions,
        featureFlags,
      });

      // Keep parent group if at least one child is visible
      if (children.length > 0) {
        return {
          ...item,
          children,
        };
      }

      // Keep normal item if allowed
      if (itemAllowed) {
        return {
          ...item,
          children: item.children ? children : undefined,
        };
      }

      return null;
    })
    .filter(Boolean);
};

export default filterSidebarItems;
