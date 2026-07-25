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
const permissionResolver = require("../../permissionResolver/services/permissionResolverService");

function isNavigationAdmin(profile) {
  const roleKey = String(profile?.user?.roleKey || "")
    .replace(/[\s_-]/g, "")
    .toLowerCase();
  return roleKey === "superadmin" || roleKey === "platformadmin";
}

function normalizeToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeRoute(value) {
  const route = String(value || "").trim().toLowerCase();
  if (!route) return "";
  return route.length > 1 ? route.replace(/\/+$/, "") : route;
}

function numericSortOrder(value, fallback = 999) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getMenuRowIdentity(menu, index = 0) {
  if (menu?.MenuId !== null && menu?.MenuId !== undefined) {
    return `id:${menu.MenuId}`;
  }

  const route = normalizeRoute(menu?.Route);
  if (route) return `route:${route}`;

  const key = normalizeToken(menu?.MenuKey);
  if (key) return `key:${key}`;

  return `row:${index}`;
}

function dedupeMenuRows(menus = []) {
  const seen = new Set();

  return menus.filter((menu, index) => {
    const identity = getMenuRowIdentity(menu, index);
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

function retainAllowedMenus(rawMenus, allowedPermissions, bypassPermissions) {
  const menus = dedupeMenuRows(rawMenus);
  const byId = new Map(
    menus
      .filter((menu) => menu.MenuId !== null && menu.MenuId !== undefined)
      .map((menu) => [String(menu.MenuId), menu])
  );
  const retained = new Set();

  menus.forEach((menu, index) => {
    const isAllowed =
      bypassPermissions ||
      (menu.PermissionKey && allowedPermissions.has(menu.PermissionKey));

    if (!isAllowed) return;

    let current = menu;
    const visited = new Set();

    while (current) {
      const identity = getMenuRowIdentity(current, index);
      if (visited.has(identity)) break;

      visited.add(identity);
      retained.add(identity);

      if (current.ParentMenuId === null || current.ParentMenuId === undefined) {
        break;
      }

      current = byId.get(String(current.ParentMenuId));
    }
  });

  return menus.filter((menu, index) =>
    retained.has(getMenuRowIdentity(menu, index))
  );
}

function compareNodes(left, right) {
  const sortDifference = left._sortOrder - right._sortOrder;
  if (sortDifference !== 0) return sortDifference;

  const labelDifference = String(left.label || "").localeCompare(
    String(right.label || "")
  );
  if (labelDifference !== 0) return labelDifference;

  return String(left.id || "").localeCompare(String(right.id || ""));
}

function sortNodes(nodes = []) {
  nodes.forEach((node) => {
    node.children = sortNodes(node.children || []);
  });

  return nodes.sort(compareNodes);
}

function canonicalNodeKey(key) {
  return normalizeToken(String(key || "").replace(/(?:[_\s-]?root)$/i, ""));
}

function getNodeIdentity(node) {
  const route = normalizeRoute(node.path);
  if (route) return `route:${route}`;

  const key = canonicalNodeKey(node.key);
  if (key) return `key:${key}`;

  if (node.id !== null && node.id !== undefined) return `id:${node.id}`;

  return `label:${normalizeToken(node.label)}`;
}

function dedupeNodes(nodes = []) {
  const deduped = [];
  const byIdentity = new Map();

  sortNodes(nodes).forEach((node) => {
    node.children = dedupeNodes(node.children || []);
    const identity = getNodeIdentity(node);
    const existing = byIdentity.get(identity);

    if (!existing) {
      byIdentity.set(identity, node);
      deduped.push(node);
      return;
    }

    existing._sortOrder = Math.min(existing._sortOrder, node._sortOrder);
    existing.children = dedupeNodes([
      ...(existing.children || []),
      ...(node.children || []),
    ]);
  });

  return sortNodes(deduped);
}

function buildMenuTree(menus) {
  const byId = new Map();
  const menuNodes = new Map();
  const roots = [];

  menus.forEach((menu, index) => {
    const identity = getMenuRowIdentity(menu, index);
    const node = {
      id: menu.MenuId ?? identity,
      key: menu.MenuKey,
      label: menu.MenuName,
      path: menu.Route,
      iconKey: menu.Icon,
      comingSoon:
        String(menu.VisibilityStatusKey || "").toLowerCase() === "hidden",
      backendReady:
        String(menu.VisibilityStatusKey || "").toLowerCase() === "enabled",
      isEnabled: menu.IsEnabled !== false,
      moduleIsEnabled: menu.ModuleIsEnabled !== false,
      children: [],
      _menu: menu,
      _sortOrder: numericSortOrder(
        menu.UserSortOrder ?? menu.MenuSortOrder
      ),
    };

    menuNodes.set(identity, node);

    if (menu.MenuId !== null && menu.MenuId !== undefined) {
      byId.set(String(menu.MenuId), node);
    }
  });

  menus.forEach((menu, index) => {
    const node = menuNodes.get(getMenuRowIdentity(menu, index));
    const parent =
      menu.ParentMenuId !== null && menu.ParentMenuId !== undefined
        ? byId.get(String(menu.ParentMenuId))
        : null;

    if (parent && parent !== node) {
      parent.children.push(node);
      return;
    }

    roots.push(node);
  });

  return dedupeNodes(roots);
}

function getModuleMetadata(menu) {
  const groupIsMain = normalizeToken(menu.GroupKey) === "main";

  return {
    id: menu.ModuleId,
    key:
      menu.ModuleKey ||
      (!groupIsMain ? menu.GroupKey : null) ||
      `module-${menu.ModuleId}`,
    name:
      menu.ModuleName ||
      (!groupIsMain ? menu.GroupName : null) ||
      "Module",
    iconKey: menu.ModuleIcon || null,
    sortOrder: numericSortOrder(
      !groupIsMain ? menu.GroupSortOrder : menu.ModuleSortOrder
    ),
    isEnabled: menu.ModuleIsEnabled !== false,
  };
}

function mergeModuleMetadata(current, menu) {
  const incoming = getModuleMetadata(menu);
  if (!current) return incoming;

  return {
    id: current.id ?? incoming.id,
    key: current.key || incoming.key,
    name: current.name || incoming.name,
    iconKey: current.iconKey || incoming.iconKey,
    sortOrder: Math.min(current.sortOrder, incoming.sortOrder),
    isEnabled: current.isEnabled !== false && incoming.isEnabled !== false,
  };
}

function isModuleContainer(node, module) {
  if (node.path) return false;

  const moduleKey = normalizeToken(module.key);
  const moduleName = normalizeToken(module.name);
  const nodeKey = canonicalNodeKey(node.key);
  const nodeLabel = normalizeToken(node.label);

  return Boolean(
    (moduleKey && nodeKey === moduleKey) ||
    (moduleName && nodeLabel === moduleName)
  );
}

function pruneEmptyContainers(nodes = []) {
  return nodes
    .map((node) => ({
      ...node,
      children: pruneEmptyContainers(node.children || []),
    }))
    .filter(
      (node) =>
        node.path ||
        node.comingSoon ||
        (node.children && node.children.length > 0)
    );
}

function toPublicNode(node) {
  const publicNode = {
    id: node.id,
    key: node.key,
    label: node.label,
    path: node.path,
    iconKey: node.iconKey,
    comingSoon: node.comingSoon,
    backendReady: node.backendReady,
    isEnabled: node.isEnabled !== false,
    moduleIsEnabled: node.moduleIsEnabled !== false,
  };

  if (node.children?.length) {
    publicNode.children = node.children.map(toPublicNode);
  }

  return publicNode;
}

function buildSidebarSections(menus) {
  const roots = buildMenuTree(menus);
  const mainItems = [];
  const moduleBuckets = new Map();

  roots.forEach((root) => {
    const menu = root._menu;
    const moduleId = menu.ModuleId ?? `unknown-${moduleBuckets.size}`;
    const module = getModuleMetadata(menu);
    const isMainGroup = normalizeToken(menu.GroupKey) === "main";

    if (isMainGroup && !isModuleContainer(root, module)) {
      mainItems.push(root);
      return;
    }

    const bucket = moduleBuckets.get(moduleId) || {
      module: null,
      roots: [],
    };

    bucket.module = mergeModuleMetadata(bucket.module, menu);
    bucket.roots.push(root);
    moduleBuckets.set(moduleId, bucket);
  });

  const moduleItems = Array.from(moduleBuckets.values()).map((bucket) => {
    const rootsForModule = dedupeNodes(bucket.roots);
    const children = [];

    rootsForModule.forEach((root) => {
      if (isModuleContainer(root, bucket.module)) {
        children.push(...(root.children || []));
      } else {
        children.push(root);
      }
    });

    return {
      id: `module-${bucket.module.id}`,
      key: `module-${bucket.module.key}`,
      label: bucket.module.name,
      path: null,
      iconKey: bucket.module.iconKey,
      comingSoon: false,
      backendReady: true,
      children: dedupeNodes(children),
      _sortOrder: bucket.module.sortOrder,
    };
  });

  const cleanMainItems = dedupeNodes(pruneEmptyContainers(mainItems));
  const cleanModuleItems = dedupeNodes(pruneEmptyContainers(moduleItems));
  const sections = [];

  if (cleanMainItems.length) {
    sections.push({
      title: "Main",
      items: cleanMainItems.map(toPublicNode),
    });
  }

  if (cleanModuleItems.length) {
    sections.push({
      title: "Modules",
      items: cleanModuleItems.map(toPublicNode),
    });
  }

  return sections;
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

async function resolveNavigationAccess(user) {
  const userId =
    user?.UserId ||
    user?.userId ||
    user?.id;

  const [rawMenus, permissionProfile] = await Promise.all([
    navigationRepository.getSidebarMenusForUser(userId),
    permissionResolver.resolveUserPermissions(userId),
  ]);
  const allowedPermissions = new Set(permissionProfile.allowedPermissionKeys || []);
  const bypassPermissions = isNavigationAdmin(permissionProfile);
  const menus = retainAllowedMenus(
    rawMenus,
    allowedPermissions,
    bypassPermissions
  );

  return { menus, permissionProfile };
}

async function getMySidebar(user) {
  const { menus } = await resolveNavigationAccess(user);
  return buildSidebarSections(menus);
}

async function getMyModuleAccess(user) {
  const { menus, permissionProfile } = await resolveNavigationAccess(user);
  const roleKey = permissionProfile.user?.roleKey || "";
  const normalizedRoleKey = normalizeToken(roleKey);
  const moduleKeys = Array.from(
    new Set(
      menus
        .filter((menu) => menu.ModuleKey && menu.ModuleIsEnabled !== false)
        .map((menu) => menu.ModuleKey)
    )
  );

  return {
    roleKey,
    isSuperAdmin: normalizedRoleKey === "superadmin",
    moduleKeys,
  };
}

async function getMyRuntimeControls(user) {
  const userId=user?.UserId||user?.userId||user?.id;
  const [controls, permissionProfile] = await Promise.all([
    navigationRepository.getRuntimeControlsForUser(userId),
    permissionResolver.resolveUserPermissions(userId),
  ]);
  const allowedPermissions = new Set(permissionProfile.allowedPermissionKeys || []);
  const bypassPermissions = isNavigationAdmin(permissionProfile);
  const isAllowed = (item) =>
    bypassPermissions ||
    !item.PermissionKey ||
    allowedPermissions.has(item.PermissionKey);

  return {
    buttons: controls.buttons.filter(isAllowed),
    widgets: controls.widgets.filter(isAllowed),
  };
}

// ============================================
// Service Exports
// ============================================

module.exports = {
  getMySidebar,
  getMyModuleAccess,
  getMyRuntimeControls,
};
