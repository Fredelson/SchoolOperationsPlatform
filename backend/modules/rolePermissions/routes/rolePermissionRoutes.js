// ============================================================
// Arab Unity School Operations Platform
// Role Permission Routes
// ============================================================
//
// Purpose:
// Defines API routes for the Role Permissions module.
//
// Base Route:
// /api/role-permissions
//
// Architecture:
//
// Route
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
// • JWT protected
// • Controller handles request/response
//
// ============================================================

const express = require("express");

const rolePermissionController = require("../controllers/rolePermissionController");
const { protect } = require("../../../middleware/authMiddleware");

// ============================================================
// Router Initialization
// ============================================================

const router = express.Router();

// ============================================================
// Role Permission CRUD Routes
// ============================================================

router.get(
    "/",
    protect,
    rolePermissionController.getRolePermissions
);

router.get(
    "/:rolePermissionId",
    protect,
    rolePermissionController.getRolePermissionById
);

router.post(
    "/",
    protect,
    rolePermissionController.createRolePermission
);

router.put(
    "/:rolePermissionId",
    protect,
    rolePermissionController.updateRolePermission
);

router.delete(
    "/:rolePermissionId",
    protect,
    rolePermissionController.deleteRolePermission
);

// ============================================================
// Exports
// ============================================================

module.exports = router;