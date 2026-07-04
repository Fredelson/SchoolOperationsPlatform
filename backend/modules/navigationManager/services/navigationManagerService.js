/* =========================================================
   Navigation Manager Service
   Purpose:
   Handles business rules and validation for Navigation Manager.

   Architecture:
   Repository → Service → Controller → Routes
========================================================= */

const navigationManagerRepository = require("../repositories/navigationManagerRepository");

/* =========================================================
   ERROR HELPER
========================================================= */

const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

/* =========================================================
   BOOLEAN NORMALIZER
========================================================= */

const normalizeBoolean = (value, defaultValue = false) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return defaultValue;
};

/* =========================================================
   INTEGER NORMALIZER
========================================================= */

const normalizeNullableNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  return Number(value);
};

/* =========================================================
   GET NAVIGATION MENUS
========================================================= */

const getNavigationMenus = async (query) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

  const filters = {
    search: query.search || "",
    moduleId: query.moduleId ? Number(query.moduleId) : null,
    parentMenuId: query.parentMenuId ? Number(query.parentMenuId) : null,
    permissionId: query.permissionId ? Number(query.permissionId) : null,
    featureFlagId: query.featureFlagId ? Number(query.featureFlagId) : null,
    visibilityStatusId: query.visibilityStatusId
      ? Number(query.visibilityStatusId)
      : null,
    rootOnly: query.rootOnly === "true",
    childrenOnly: query.childrenOnly === "true",
    page,
    limit,
  };

  const result = await navigationManagerRepository.getNavigationMenus(filters);

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
};

/* =========================================================
   GET NAVIGATION MENU BY ID
========================================================= */

const getNavigationMenuById = async (menuId) => {
  const menu = await navigationManagerRepository.getNavigationMenuById(
    Number(menuId)
  );

  if (!menu) {
    throwError("Navigation menu not found.", 404);
  }

  return menu;
};

/* =========================================================
   VALIDATE LOOKUP REFERENCES
========================================================= */

const validateReferences = async (data, currentMenuId = null) => {
  const moduleExists = await navigationManagerRepository.existsById(
    "Modules",
    "ModuleId",
    data.moduleId
  );

  if (!moduleExists) {
    throwError("Selected module does not exist.", 400);
  }

  const visibilityExists = await navigationManagerRepository.existsById(
    "FeatureVisibilityStatuses",
    "VisibilityStatusId",
    data.visibilityStatusId
  );

  if (!visibilityExists) {
    throwError("Selected visibility status does not exist.", 400);
  }

  if (data.parentMenuId) {
    if (currentMenuId && Number(data.parentMenuId) === Number(currentMenuId)) {
      throwError("A menu cannot be its own parent.", 400);
    }

    const parentExists = await navigationManagerRepository.existsById(
      "Menus",
      "MenuId",
      data.parentMenuId
    );

    if (!parentExists) {
      throwError("Selected parent menu does not exist.", 400);
    }
  }

  if (data.permissionId) {
    const permissionExists = await navigationManagerRepository.existsById(
      "Permissions",
      "PermissionId",
      data.permissionId
    );

    if (!permissionExists) {
      throwError("Selected permission does not exist.", 400);
    }
  }

  if (data.featureFlagId) {
    const featureFlagExists = await navigationManagerRepository.existsById(
      "FeatureFlags",
      "FeatureFlagId",
      data.featureFlagId
    );

    if (!featureFlagExists) {
      throwError("Selected feature flag does not exist.", 400);
    }
  }

  if (data.menuGroupId) {
    const menuGroupExists = await navigationManagerRepository.existsById(
      "MenuGroups",
      "MenuGroupId",
      data.menuGroupId
    );

    if (!menuGroupExists) {
      throwError("Selected menu group does not exist.", 400);
    }
  }
};

/* =========================================================
   NORMALIZE PAYLOAD
========================================================= */

const normalizePayload = (body) => {
  const menuKey = body.menuKey?.trim();
  const menuName = body.menuName?.trim();

  if (!menuKey || !menuName || !body.moduleId || !body.visibilityStatusId) {
    throwError("Module, menu key, menu name, and visibility status are required.");
  }

  return {
    workspaceId: normalizeNullableNumber(body.workspaceId),
    moduleId: Number(body.moduleId),
    parentMenuId: normalizeNullableNumber(body.parentMenuId),
    menuKey,
    menuName,
    route: body.route?.trim() || null,
    icon: body.icon?.trim() || null,
    permissionId: normalizeNullableNumber(body.permissionId),
    featureFlagId: normalizeNullableNumber(body.featureFlagId),
    badgeQueryKey: body.badgeQueryKey?.trim() || null,
    visibilityStatusId: Number(body.visibilityStatusId),
    isPinned: normalizeBoolean(body.isPinned, false),
    isCollapsible: normalizeBoolean(body.isCollapsible, false),
    sortOrder: Number(body.sortOrder || 0),
    menuGroupId: normalizeNullableNumber(body.menuGroupId),
    menuGroupSortOrder: Number(body.menuGroupSortOrder || body.sortOrder || 0),
  };
};

/* =========================================================
   CREATE NAVIGATION MENU
========================================================= */

const createNavigationMenu = async (body) => {
  const data = normalizePayload(body);

  const duplicate = await navigationManagerRepository.getNavigationMenuByKey(
    data.menuKey
  );

  if (duplicate) {
    throwError("Menu key already exists.", 409);
  }

  await validateReferences(data);

  if (data.parentMenuId && data.menuGroupId) {
    throwError("Only root menus can be assigned directly to a menu group.", 400);
  }

  return await navigationManagerRepository.createNavigationMenu(data);
};

/* =========================================================
   UPDATE NAVIGATION MENU
========================================================= */

const updateNavigationMenu = async (menuId, body) => {
  const id = Number(menuId);

  const current = await navigationManagerRepository.getNavigationMenuById(id);

  if (!current) {
    throwError("Navigation menu not found.", 404);
  }

  const data = normalizePayload(body);

  const duplicate = await navigationManagerRepository.getNavigationMenuByKey(
    data.menuKey
  );

  if (duplicate && duplicate.MenuId !== id) {
    throwError("Menu key already exists.", 409);
  }

  await validateReferences(data, id);

  if (data.parentMenuId && data.menuGroupId) {
    throwError("Only root menus can be assigned directly to a menu group.", 400);
  }

  return await navigationManagerRepository.updateNavigationMenu(id, data);
};

/* =========================================================
   DELETE NAVIGATION MENU
========================================================= */

const deleteNavigationMenu = async (menuId) => {
  const id = Number(menuId);

  const current = await navigationManagerRepository.getNavigationMenuById(id);

  if (!current) {
    throwError("Navigation menu not found.", 404);
  }

  const childCount = await navigationManagerRepository.countChildMenus(id);

  if (childCount > 0) {
    throwError("Cannot delete this menu because it has child menus.", 409);
  }

  return await navigationManagerRepository.deleteNavigationMenu(id);
};

/* =========================================================
   GET LOOKUPS
========================================================= */

const getNavigationLookups = async () => {
  return await navigationManagerRepository.getNavigationLookups();
};

/* =========================================================
   EXPORT SERVICE
========================================================= */

module.exports = {
  getNavigationMenus,
  getNavigationMenuById,
  createNavigationMenu,
  updateNavigationMenu,
  deleteNavigationMenu,
  getNavigationLookups,
};