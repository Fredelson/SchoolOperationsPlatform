// ============================================================
// Arab Unity School Operations Platform
// Permission Routes
// ============================================================
//
// Purpose:
// Defines API routes for the Permissions module.
//
// Base Route:
// /api/permissions
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

const permissionController = require("../controllers/permissionController");
const { protect } = require("../../../middleware/authMiddleware");

// ============================================================
// Router Initialization
// ============================================================

const router = express.Router();

// ============================================================
// Permission CRUD Routes
// ============================================================
//
// GET    /api/permissions
// GET    /api/permissions/:permissionId
// POST   /api/permissions
// PUT    /api/permissions/:permissionId
// DELETE /api/permissions/:permissionId
//
// ============================================================

router.get(
    "/",
    protect,
    permissionController.getPermissions
);

router.get(
    "/:permissionId",
    protect,
    permissionController.getPermissionById
);

router.post(
    "/",
    protect,
    permissionController.createPermission
);

router.put(
    "/:permissionId",
    protect,
    permissionController.updatePermission
);

router.delete(
    "/:permissionId",
    protect,
    permissionController.deletePermission
);

// ============================================================
// Exports
// ============================================================

module.exports = router;