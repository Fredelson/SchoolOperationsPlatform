/* =========================================================
   Permission Service
   Purpose:
   Handles business rules and validation for Permission Manager.

   Architecture:
   Repository → Service → Controller → Routes
========================================================= */

const permissionRepository = require("../repositories/permissionRepository");
const {
  validatePermissionPayload,
} = require("../validators/permissionValidator");

/* =========================================================
   GET PERMISSIONS
========================================================= */
const getPermissions = async (query) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

  const filters = {
    search: query.search || "",
    moduleId: query.moduleId ? Number(query.moduleId) : null,
    permissionGroupId: query.permissionGroupId
      ? Number(query.permissionGroupId)
      : null,
    isActive:
      query.isActive === "true"
        ? true
        : query.isActive === "false"
        ? false
        : null,
    page,
    limit,
  };

  const result = await permissionRepository.getPermissions(filters);

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
   GET PERMISSION BY ID
========================================================= */
const getPermissionById = async (permissionId) => {
  const permission = await permissionRepository.getPermissionById(
    Number(permissionId)
  );

  if (!permission) {
    const error = new Error("Permission not found.");
    error.statusCode = 404;
    throw error;
  }

  return permission;
};

/* =========================================================
   CREATE PERMISSION
========================================================= */
const createPermission = async (body) => {
  const validationErrors = validatePermissionPayload(body);

  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join(" "));
    error.statusCode = 400;
    throw error;
  }

  const permissionKey = body.permissionKey?.trim();
  const permissionName = body.permissionName?.trim();

  const existingKey = await permissionRepository.getPermissionByKey(
    permissionKey
  );

  if (existingKey) {
    const error = new Error("Permission key already exists.");
    error.statusCode = 409;
    throw error;
  }

  const existingName = await permissionRepository.getPermissionByName(
    permissionName
  );

  if (existingName) {
    const error = new Error("Permission name already exists.");
    error.statusCode = 409;
    throw error;
  }

  return await permissionRepository.createPermission({
    permissionKey,
    permissionName,
    description: body.description?.trim() || null,
    moduleId: Number(body.moduleId),
    permissionGroupId: body.permissionGroupId
      ? Number(body.permissionGroupId)
      : null,
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  });
};

/* =========================================================
   UPDATE PERMISSION
========================================================= */
const updatePermission = async (permissionId, body) => {
  const id = Number(permissionId);

  const current = await permissionRepository.getPermissionById(id);

  if (!current) {
    const error = new Error("Permission not found.");
    error.statusCode = 404;
    throw error;
  }

  const validationErrors = validatePermissionPayload(body);

  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join(" "));
    error.statusCode = 400;
    throw error;
  }

  const permissionKey = body.permissionKey?.trim();
  const permissionName = body.permissionName?.trim();

  const duplicateKey = await permissionRepository.getPermissionByKey(
    permissionKey
  );

  if (duplicateKey && duplicateKey.PermissionId !== id) {
    const error = new Error("Permission key already exists.");
    error.statusCode = 409;
    throw error;
  }

  const duplicateName = await permissionRepository.getPermissionByName(
    permissionName
  );

  if (duplicateName && duplicateName.PermissionId !== id) {
    const error = new Error("Permission name already exists.");
    error.statusCode = 409;
    throw error;
  }

  return await permissionRepository.updatePermission(id, {
    permissionKey,
    permissionName,
    description: body.description?.trim() || null,
    moduleId: Number(body.moduleId),
    permissionGroupId: body.permissionGroupId
      ? Number(body.permissionGroupId)
      : null,
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  });
};

/* =========================================================
   DELETE PERMISSION
========================================================= */
const deletePermission = async (permissionId) => {
  const id = Number(permissionId);

  const current = await permissionRepository.getPermissionById(id);

  if (!current) {
    const error = new Error("Permission not found.");
    error.statusCode = 404;
    throw error;
  }

  return await permissionRepository.deletePermission(id);
};

/* =========================================================
   GET LOOKUPS
========================================================= */
const getPermissionLookups = async () => {
  return await permissionRepository.getPermissionLookups();
};

/* =========================================================
   EXPORT SERVICE
========================================================= */
module.exports = {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionLookups,
};