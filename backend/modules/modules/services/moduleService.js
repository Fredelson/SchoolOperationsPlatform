// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Service
// ============================================
//
// Purpose:
// Contains business rules for the platform
// Module Registry.
//
// Architecture:
// Repository -> Service -> Controller -> Routes
// ============================================

const moduleRepository = require("../repositories/moduleRepository");
const { mapModule, mapModules } = require("../helpers/moduleMapper");
const {
  MODULE_VISIBILITY,
  PROTECTED_MODULE_KEYS,
} = require("../constants/moduleDefaults");

// ============================================
// Helpers
// ============================================

const normalizeModuleKey = (moduleKey) => {
  return String(moduleKey || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
};

const toNullableBoolean = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return value === "true" || value === true;
};

const hasPagination = (filters = {}) => {
  return filters.page !== undefined || filters.pageSize !== undefined;
};

// ============================================
// Get Modules
// ============================================
//
// Purpose:
// Supports both legacy full-list loading and
// new server-side pagination.
//
// Backward compatible behavior:
// - No page/pageSize => returns array
// - With page/pageSize => returns paginated object
// ============================================

const getModules = async (filters = {}) => {
  const sharedFilters = {
    search: filters.search || "",
    statusKey: filters.statusKey || "",
    isActive: toNullableBoolean(filters.isActive),
  };

  if (hasPagination(filters)) {
    const paginatedResult = await moduleRepository.getModulesPaginated({
      ...sharedFilters,
      page: filters.page,
      pageSize: filters.pageSize,
    });

    return {
      items: mapModules(paginatedResult.items),
      page: paginatedResult.page,
      pageSize: paginatedResult.pageSize,
      totalRows: paginatedResult.totalRows,
      totalPages: paginatedResult.totalPages,
    };
  }

  const rows = await moduleRepository.getModules(sharedFilters);

  return mapModules(rows);
};

// ============================================
// Get Module By ID
// ============================================

const getModuleById = async (moduleId) => {
  const module = await moduleRepository.getModuleById(moduleId);

  if (!module) {
    const error = new Error("Module not found.");
    error.statusCode = 404;
    throw error;
  }

  return mapModule(module);
};

// ============================================
// Create Module
// ============================================

const createModule = async (payload) => {
  const moduleKey = normalizeModuleKey(payload.moduleKey);

  const existing = await moduleRepository.getModuleByKey(moduleKey);

  if (existing) {
    const error = new Error("Module key already exists.");
    error.statusCode = 409;
    throw error;
  }

  const visibilityStatusId =
    await moduleRepository.getVisibilityStatusIdByKey(
      payload.visibilityStatusKey || MODULE_VISIBILITY.ENABLED
    );

  if (!visibilityStatusId) {
    const error = new Error("Invalid visibility status.");
    error.statusCode = 400;
    throw error;
  }

  const created = await moduleRepository.createModule({
    moduleKey,
    moduleName: payload.moduleName.trim(),
    description: payload.description || null,
    icon: payload.icon || null,
    baseRoute: payload.baseRoute || null,
    visibilityStatusId,
    isActive: payload.isActive ?? true,
    sortOrder: Number(payload.sortOrder || 0),
  });

  return mapModule(created);
};

// ============================================
// Update Module
// ============================================

const updateModule = async (moduleId, payload) => {
  const existing = await moduleRepository.getModuleById(moduleId);

  if (!existing) {
    const error = new Error("Module not found.");
    error.statusCode = 404;
    throw error;
  }

  const visibilityStatusId =
    await moduleRepository.getVisibilityStatusIdByKey(
      payload.visibilityStatusKey || existing.VisibilityStatusKey
    );

  if (!visibilityStatusId) {
    const error = new Error("Invalid visibility status.");
    error.statusCode = 400;
    throw error;
  }

  const updated = await moduleRepository.updateModule(moduleId, {
    moduleName: payload.moduleName.trim(),
    description: payload.description || null,
    icon: payload.icon || null,
    baseRoute: payload.baseRoute || null,
    visibilityStatusId,
    isActive:
      payload.isActive === undefined
        ? existing.IsActive
        : Boolean(payload.isActive),
    sortOrder:
      payload.sortOrder === undefined
        ? existing.SortOrder
        : Number(payload.sortOrder),
  });

  return mapModule(updated);
};

// ============================================
// Activate Module
// ============================================

const activateModule = async (moduleId) => {
  await getModuleById(moduleId);

  const updated = await moduleRepository.setModuleActiveState(moduleId, true);
  return mapModule(updated);
};

// ============================================
// Deactivate Module
// ============================================

const deactivateModule = async (moduleId) => {
  const existing = await getModuleById(moduleId);

  if (PROTECTED_MODULE_KEYS.includes(existing.moduleKey)) {
    const error = new Error("This protected module cannot be deactivated.");
    error.statusCode = 403;
    throw error;
  }

  const updated = await moduleRepository.setModuleActiveState(moduleId, false);
  return mapModule(updated);
};

// ============================================
// Delete Module
// ============================================

const deleteModule = async (moduleId) => {
  const existing = await getModuleById(moduleId);

  if (PROTECTED_MODULE_KEYS.includes(existing.moduleKey)) {
    const error = new Error("This protected module cannot be deleted.");
    error.statusCode = 403;
    throw error;
  }

  await moduleRepository.deleteModule(moduleId);

  return {
    deleted: true,
    moduleId,
  };
};

// ============================================
// Exports
// ============================================

module.exports = {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  activateModule,
  deactivateModule,
  deleteModule,
};