// ============================================================
// Arab Unity School Operations Platform
// Role Permission Controller
// ============================================================
//
// Purpose:
// Handles HTTP requests related to Role Permissions.
//
// Architecture:
//
// Request
//      ↓
// Controller
//      ↓
// Service
//      ↓
// Repository
//
// Rules:
//
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
//
// GET /api/role-permissions
//
// ============================================================

const getRolePermissions = asyncHandler(async (req, res) => {

    const rolePermissions =
        await rolePermissionService.getRolePermissions();

    return sendSuccess(
        res,
        "Role Permissions retrieved successfully.",
        rolePermissions
    );

});

// ============================================================
// Get Role Permission By ID
// ============================================================
//
// GET /api/role-permissions/:rolePermissionId
//
// ============================================================

const getRolePermissionById = asyncHandler(async (req, res) => {

    const rolePermission =
        await rolePermissionService.getRolePermissionById(
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
//
// POST /api/role-permissions
//
// ============================================================

const createRolePermission = asyncHandler(async (req, res) => {

    const rolePermission =
        await rolePermissionService.createRolePermission(
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
//
// PUT /api/role-permissions/:rolePermissionId
//
// ============================================================

const updateRolePermission = asyncHandler(async (req, res) => {

    const rolePermission =
        await rolePermissionService.updateRolePermission(
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
//
// DELETE /api/role-permissions/:rolePermissionId
//
// ============================================================

const deleteRolePermission = asyncHandler(async (req, res) => {

    const result =
        await rolePermissionService.deleteRolePermission(
            req.params.rolePermissionId
        );

    return sendSuccess(
        res,
        "Role Permission deleted successfully.",
        result
    );

});

// ============================================================
// Exports
// ============================================================

module.exports = {

    getRolePermissions,
    getRolePermissionById,

    createRolePermission,
    updateRolePermission,
    deleteRolePermission,

};