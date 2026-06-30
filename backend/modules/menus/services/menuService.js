// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Menu Service
// ============================================
//
// Purpose:
// Contains business rules for the Super Admin
// Menu Manager.
//
// Architecture:
// Repository -> Service -> Controller -> Routes
// ============================================

const menuRepository = require("../repositories/menuRepository");
const { mapMenu, mapMenus } = require("../helpers/menuMapper");
const {
  MENU_VISIBILITY,
  PROTECTED_MENU_KEYS,
} = require("../constants/menuDefaults");

// ============================================
// Helpers
// ============================================

const normalizeMenuKey = (menuKey) => {
  return String(menuKey || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
};

const toNullableNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
};

const hasPagination = (filters = {}) => {
  return filters.page !== undefined || filters.pageSize !== undefined;
};

// ============================================
// Get Menus
// ============================================

const getMenus = async (filters = {}) => {
  const sharedFilters = {
    search: filters.search || "",
    moduleId: toNullableNumber(filters.moduleId),
    workspaceId: toNullableNumber(filters.workspaceId),
    parentMenuId: toNullableNumber(filters.parentMenuId),
    visibilityStatusKey: filters.visibilityStatusKey || "",
  };

  if (hasPagination(filters)) {
    const paginatedResult = await menuRepository.getMenusPaginated({
      ...sharedFilters,
      page: filters.page,
      pageSize: filters.pageSize,
    });

    return {
      items: mapMenus(paginatedResult.items),
      page: paginatedResult.page,
      pageSize: paginatedResult.pageSize,
      totalRows: paginatedResult.totalRows,
      totalPages: paginatedResult.totalPages,
    };
  }

  const rows = await menuRepository.getMenus(sharedFilters);

  return mapMenus(rows);
};

// ============================================
// Get Menu By ID
// ============================================

const getMenuById = async (menuId) => {
  const menu = await menuRepository.getMenuById(menuId);

  if (!menu) {
    const error = new Error("Menu not found.");
    error.statusCode = 404;
    throw error;
  }

  return mapMenu(menu);
};

// ============================================
// Create Menu
// ============================================

const createMenu = async (payload) => {
  const menuKey = normalizeMenuKey(payload.menuKey);

  const existing = await menuRepository.getMenuByKey(menuKey);

  if (existing) {
    const error = new Error("Menu key already exists.");
    error.statusCode = 409;
    throw error;
  }

  const visibilityStatusId =
    await menuRepository.getVisibilityStatusIdByKey(
      payload.visibilityStatusKey || MENU_VISIBILITY.ENABLED
    );

  if (!visibilityStatusId) {
    const error = new Error("Invalid visibility status.");
    error.statusCode = 400;
    throw error;
  }

  const created = await menuRepository.createMenu({
    workspaceId: toNullableNumber(payload.workspaceId),
    moduleId: Number(payload.moduleId),
    parentMenuId: toNullableNumber(payload.parentMenuId),
    menuKey,
    menuName: payload.menuName.trim(),
    route: payload.route || null,
    icon: payload.icon || null,
    permissionId: toNullableNumber(payload.permissionId),
    featureFlagId: toNullableNumber(payload.featureFlagId),
    badgeQueryKey: payload.badgeQueryKey || null,
    visibilityStatusId,
    isPinned: payload.isPinned ?? false,
    isCollapsible: payload.isCollapsible ?? false,
    sortOrder: Number(payload.sortOrder || 0),
  });

  return mapMenu(created);
};

// ============================================
// Update Menu
// ============================================

const updateMenu = async (menuId, payload) => {
  const existing = await menuRepository.getMenuById(menuId);

  if (!existing) {
    const error = new Error("Menu not found.");
    error.statusCode = 404;
    throw error;
  }

  const visibilityStatusId =
    await menuRepository.getVisibilityStatusIdByKey(
      payload.visibilityStatusKey || existing.VisibilityStatusKey
    );

  if (!visibilityStatusId) {
    const error = new Error("Invalid visibility status.");
    error.statusCode = 400;
    throw error;
  }

  if (Number(payload.parentMenuId) === Number(menuId)) {
    const error = new Error("A menu cannot be its own parent.");
    error.statusCode = 400;
    throw error;
  }

  const updated = await menuRepository.updateMenu(menuId, {
    workspaceId:
      payload.workspaceId === undefined
        ? existing.WorkspaceId
        : toNullableNumber(payload.workspaceId),

    moduleId:
      payload.moduleId === undefined
        ? existing.ModuleId
        : Number(payload.moduleId),

    parentMenuId:
      payload.parentMenuId === undefined
        ? existing.ParentMenuId
        : toNullableNumber(payload.parentMenuId),

    menuName: payload.menuName.trim(),
    route: payload.route || null,
    icon: payload.icon || null,
    permissionId:
      payload.permissionId === undefined
        ? existing.PermissionId
        : toNullableNumber(payload.permissionId),

    featureFlagId:
      payload.featureFlagId === undefined
        ? existing.FeatureFlagId
        : toNullableNumber(payload.featureFlagId),

    badgeQueryKey: payload.badgeQueryKey || null,
    visibilityStatusId,
    isPinned:
      payload.isPinned === undefined
        ? existing.IsPinned
        : Boolean(payload.isPinned),
    isCollapsible:
      payload.isCollapsible === undefined
        ? existing.IsCollapsible
        : Boolean(payload.isCollapsible),
    sortOrder:
      payload.sortOrder === undefined
        ? existing.SortOrder
        : Number(payload.sortOrder),
  });

  return mapMenu(updated);
};

// ============================================
// Hide Menu
// ============================================

const hideMenu = async (menuId) => {
  const existing = await getMenuById(menuId);

  if (PROTECTED_MENU_KEYS.includes(existing.menuKey)) {
    const error = new Error("This protected menu cannot be hidden.");
    error.statusCode = 403;
    throw error;
  }

  const visibilityStatusId =
    await menuRepository.getVisibilityStatusIdByKey(MENU_VISIBILITY.HIDDEN);

  if (!visibilityStatusId) {
    const error = new Error("Hidden visibility status does not exist.");
    error.statusCode = 400;
    throw error;
  }

  const updated = await menuRepository.setMenuVisibilityStatus(
    menuId,
    visibilityStatusId
  );

  return mapMenu(updated);
};

// ============================================
// Show Menu
// ============================================

const showMenu = async (menuId) => {
  await getMenuById(menuId);

  const visibilityStatusId =
    await menuRepository.getVisibilityStatusIdByKey(MENU_VISIBILITY.ENABLED);

  if (!visibilityStatusId) {
    const error = new Error("Enabled visibility status does not exist.");
    error.statusCode = 400;
    throw error;
  }

  const updated = await menuRepository.setMenuVisibilityStatus(
    menuId,
    visibilityStatusId
  );

  return mapMenu(updated);
};

// ============================================
// Delete Menu
// ============================================

const deleteMenu = async (menuId) => {
  const existing = await getMenuById(menuId);

  if (PROTECTED_MENU_KEYS.includes(existing.menuKey)) {
    const error = new Error("This protected menu cannot be deleted.");
    error.statusCode = 403;
    throw error;
  }

  await menuRepository.deleteMenu(menuId);

  return {
    deleted: true,
    menuId,
  };
};

// ============================================
// Exports
// ============================================

module.exports = {
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  hideMenu,
  showMenu,
  deleteMenu,
};