// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Navigation Service
// ============================================
//
// Purpose:
// Business layer for platform navigation.
// Converts flat SQL menu rows into nested
// sidebar sections for the frontend.
//
// Architecture:
// Repository → Service → Controller → Routes
// ============================================

const navigationRepository = require("../repositories/navigationRepository");

// ============================================
// Remove Empty Children Recursively
// ============================================

function cleanChildren(node) {
  if (!node.children || node.children.length === 0) {
    delete node.children;
    return node;
  }

  node.children = node.children.map(cleanChildren);
  return node;
}

// ============================================
// Build Menu Tree
// ============================================
//
// Important:
// SQL returns both root menus and child menus.
// Only menus with a valid parent should be nested.
// Only menus without ParentMenuId should become
// root sidebar items.
//
// This prevents child items like:
// IT Asset Management → Dashboard
//
// from appearing as:
// Main → Dashboard
// Main → Dashboard
// ============================================

function buildMenuTree(menus) {
  const byId = new Map();
  const roots = [];

  // First pass:
  // Create a map of every menu row.
  menus.forEach((menu) => {
    byId.set(menu.MenuId, {
      id: menu.MenuId,
      key: menu.MenuKey,
      label: menu.MenuName,
      path: menu.Route,
      iconKey: menu.Icon,
      comingSoon:
        String(menu.VisibilityStatusKey || "").toLowerCase() === "hidden",
      backendReady:
        String(menu.VisibilityStatusKey || "").toLowerCase() === "enabled",
      children: [],
    });
  });

  // Second pass:
  // Attach each menu to its parent when possible.
  menus.forEach((menu) => {
    const node = byId.get(menu.MenuId);

    if (menu.ParentMenuId) {
      const parent = byId.get(menu.ParentMenuId);

      if (parent) {
        parent.children.push(node);
      }

      return;
    }

    roots.push(node);
  });

  return roots.map(cleanChildren);
}

// ============================================
// Get My Sidebar
// ============================================
//
// Purpose:
// Builds the authenticated user's sidebar.
//
// Rules:
// - Root menus decide sidebar section placement.
// - Child menus inherit their parent's section.
// - Empty groups are ignored.
// ============================================

async function getMySidebar(user) {
  const userId =
    user?.UserId ||
    user?.userId ||
    user?.id;

  let menus = await navigationRepository.getSidebarMenusForUser(userId);

  const role = String(
    user?.RoleName || user?.roleName || user?.role || ""
  ).toLowerCase().replace(/[\s_-]+/g, "");

  if (role !== "superadmin" && role !== "platformadmin") {
    const protectedRootIds = new Set(
      menus.filter((menu) => menu.MenuKey === "USER_ACCESS_ROOT").map((menu) => menu.MenuId)
    );
    menus = menus.filter((menu) => {
      if (menu.GroupName === "User & Access") return false;
      let current = menu;
      while (current) {
        if (protectedRootIds.has(current.MenuId)) return false;
        current = menus.find((candidate) => candidate.MenuId === current.ParentMenuId);
      }
      return true;
    });
  }

  const groups = {};

  // Only root menus should create sidebar group buckets.
  // Child menus are added later by buildMenuTree().
  menus
    .filter((menu) => !menu.ParentMenuId)
    .forEach((menu) => {
      const groupKey = menu.GroupKey || "MAIN";

      if (!groups[groupKey]) {
        groups[groupKey] = {
          title: menu.GroupName || "Main",
          sortOrder: menu.GroupSortOrder || 999,
          rawMenus: [],
        };
      }
    });

  // Add every menu row into the group where its root parent belongs.
  // This lets nested child menus stay inside the correct section.
  Object.keys(groups).forEach((groupKey) => {
    const rootMenuIds = menus
      .filter((menu) => !menu.ParentMenuId && (menu.GroupKey || "MAIN") === groupKey)
      .map((menu) => menu.MenuId);

    groups[groupKey].rawMenus = menus.filter((menu) => {
      if (rootMenuIds.includes(menu.MenuId)) {
        return true;
      }

      // Include descendants whose parent chain belongs to this group.
      let currentParentId = menu.ParentMenuId;

      while (currentParentId) {
        const parent = menus.find((item) => item.MenuId === currentParentId);

        if (!parent) return false;

        if (rootMenuIds.includes(parent.MenuId)) {
          return true;
        }

        currentParentId = parent.ParentMenuId;
      }

      return false;
    });
  });

  const sidebar = Object.values(groups)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((group) => ({
      title: group.title,
      items: buildMenuTree(group.rawMenus),
    }))
    .filter((group) => group.items.length > 0);

  if (role === "superadmin" || role === "platformadmin") {
    const modules = await navigationRepository.getSidebarModules();
    const representedModuleIds = new Set(
      menus.map((menu) => menu.ModuleId).filter(Boolean)
    );

    const unlinkedModules = modules
      .filter((module) => !representedModuleIds.has(module.ModuleId))
      .map((module) => ({
        id: `module-${module.ModuleId}`,
        key: `MODULE_${module.ModuleKey}`,
        label: module.ModuleName,
        path: `/super-admin/module/${encodeURIComponent(module.ModuleKey)}`,
        iconKey: module.Icon || "apps",
        backendReady: true,
        moduleFallback: true,
      }));

    if (unlinkedModules.length > 0) {
      sidebar.push({
        title: "Modules",
        items: unlinkedModules,
      });
    }
  }

  return sidebar;
}

// ============================================
// Service Exports
// ============================================

module.exports = {
  getMySidebar,
};
