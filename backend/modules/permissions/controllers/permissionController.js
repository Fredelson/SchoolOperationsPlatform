// ============================================================
// Arab Unity School Operations Platform
// Permission Controller
// ============================================================
//
// Purpose:
// Handles HTTP requests related to Permissions.
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

const permissionService = require("../services/permissionService");

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");

// ============================================================
// Get All Permissions
// ============================================================
//
// GET /api/permissions
//
// ============================================================

const getPermissions = asyncHandler(async (req, res) => {

    const permissions =
        await permissionService.getAllPermissions();

    return sendSuccess(
        res,
        "Permissions retrieved successfully.",
        permissions
    );

});

// ============================================================
// Get Permission By ID
// ============================================================
//
// GET /api/permissions/:permissionId
//
// ============================================================

const getPermissionById = asyncHandler(async (req, res) => {

    const permission =
        await permissionService.getPermissionById(
            req.params.permissionId
        );

    return sendSuccess(
        res,
        "Permission retrieved successfully.",
        permission
    );

});

// ============================================================
// Create Permission
// ============================================================
//
// POST /api/permissions
//
// ============================================================

const createPermission = asyncHandler(async (req, res) => {

    const permission =
        await permissionService.createPermission(
            req.body
        );

    return sendSuccess(
        res,
        "Permission created successfully.",
        permission,
        201
    );

});

// ============================================================
// Update Permission
// ============================================================
//
// PUT /api/permissions/:permissionId
//
// ============================================================

const updatePermission = asyncHandler(async (req, res) => {

    const permission =
        await permissionService.updatePermission(
            req.params.permissionId,
            req.body
        );

    return sendSuccess(
        res,
        "Permission updated successfully.",
        permission
    );

});

// ============================================================
// Delete Permission
// ============================================================
//
// DELETE /api/permissions/:permissionId
//
// Performs a soft delete.
//
// ============================================================

const deletePermission = asyncHandler(async (req, res) => {

    const result =
        await permissionService.deletePermission(
            req.params.permissionId
        );

    return sendSuccess(
        res,
        "Permission deleted successfully.",
        result
    );

});

// ============================================================
// Exports
// ============================================================

module.exports = {

    getPermissions,
    getPermissionById,

    createPermission,
    updatePermission,
    deletePermission,

};