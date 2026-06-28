// ============================================================
// Arab Unity School Operations Platform
// Role Controller
// ============================================================
//
// Purpose:
// Handles HTTP requests related to Roles.
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

const roleService = require("../services/roleService");

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");

// ============================================================
// Get All Roles
// ============================================================
//
// GET /api/roles
//
// ============================================================

const getRoles = asyncHandler(async (req, res) => {

    const roles =
        await roleService.getRoles();

    return sendSuccess(
        res,
        "Roles retrieved successfully.",
        roles
    );

});

// ============================================================
// Get Role By ID
// ============================================================
//
// GET /api/roles/:roleId
//
// ============================================================

const getRoleById = asyncHandler(async (req, res) => {

    const role =
        await roleService.getRoleById(
            req.params.roleId
        );

    return sendSuccess(
        res,
        "Role retrieved successfully.",
        role
    );

});

// ============================================================
// Create Role
// ============================================================
//
// POST /api/roles
//
// ============================================================

const createRole = asyncHandler(async (req, res) => {

    const role =
        await roleService.createRole(
            req.body
        );

    return sendSuccess(
        res,
        "Role created successfully.",
        role,
        201
    );

});

// ============================================================
// Update Role
// ============================================================
//
// PUT /api/roles/:roleId
//
// ============================================================

const updateRole = asyncHandler(async (req, res) => {

    const role =
        await roleService.updateRole(
            req.params.roleId,
            req.body
        );

    return sendSuccess(
        res,
        "Role updated successfully.",
        role
    );

});

// ============================================================
// Delete Role
// ============================================================
//
// DELETE /api/roles/:roleId
//
// Performs a soft delete.
//
// ============================================================

const deleteRole = asyncHandler(async (req, res) => {

    const result =
        await roleService.deleteRole(
            req.params.roleId
        );

    return sendSuccess(
        res,
        "Role deleted successfully.",
        result
    );

});

// ============================================================
// Exports
// ============================================================

module.exports = {

    getRoles,
    getRoleById,

    createRole,
    updateRole,
    deleteRole,

};