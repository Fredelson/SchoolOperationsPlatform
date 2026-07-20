// ============================================================
// Arab Unity School Operations Platform
// Role Permission Controller
// ============================================================
//
// Purpose:
// Handles HTTP requests related to Role Permissions.
//
// Rules:
// • No SQL
// • No business logic
// • No validation
// • Returns standardized API responses
//
// ============================================================

const rolePermissionService = require("../services/rolePermissionService");

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");

// ============================================================
// Get All Role Permissions
// ============================================================

const getRolePermissions = asyncHandler(async (req, res) => {
  const result = await rolePermissionService.getRolePermissions(req.query);

  return sendSuccess(
    res,
    "Role Permissions retrieved successfully.",
    result
  );
});

// ============================================================
// Get Role Permission Lookups
// ============================================================

const getRolePermissionLookups = asyncHandler(async (req, res) => {
  const lookups = await rolePermissionService.getRolePermissionLookups();

  return sendSuccess(
    res,
    "Role Permission lookups retrieved successfully.",
    lookups
  );
});

// ============================================================
// Get Role Permission By ID
// ============================================================

const getRolePermissionById = asyncHandler(async (req, res) => {
  const rolePermission = await rolePermissionService.getRolePermissionById(
    req.params.rolePermissionId
  );

  return sendSuccess(
    res,
    "Role Permission retrieved successfully.",
    rolePermission
  );
});

// ============================================================
// Create Role Permission
// ============================================================

const createRolePermission = asyncHandler(async (req, res) => {
  const rolePermission = await rolePermissionService.createRolePermission(
    req.body
  );

  return sendSuccess(
    res,
    "Role Permission created successfully.",
    rolePermission,
    201
  );
});

// ============================================================
// Update Role Permission
// ============================================================

const updateRolePermission = asyncHandler(async (req, res) => {
  const rolePermission = await rolePermissionService.updateRolePermission(
    req.params.rolePermissionId,
    req.body
  );

  return sendSuccess(
    res,
    "Role Permission updated successfully.",
    rolePermission
  );
});

// ============================================================
// Delete Role Permission
// ============================================================

const deleteRolePermission = asyncHandler(async (req, res) => {
  const result = await rolePermissionService.deleteRolePermission(
    req.params.rolePermissionId
  );

  return sendSuccess(
    res,
    "Role Permission deleted successfully.",
    result
  );
});

const bulkGrantModulePermissions = asyncHandler(async (req, res) => {
  const result = await rolePermissionService.bulkGrantModulePermissions(
    req.body
  );

  return sendSuccess(
    res,
    "Permissions granted successfully.",
    result
  );
});

// ============================================================
// Exports
// ============================================================

module.exports = {
  getRolePermissions,
  getRolePermissionLookups,
  getRolePermissionById,
  createRolePermission,
  updateRolePermission,
  deleteRolePermission,
  bulkGrantModulePermissions,
};