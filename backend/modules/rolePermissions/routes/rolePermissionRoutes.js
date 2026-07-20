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
// Route
//      ↓
// JWT Protection
//      ↓
// Permission Middleware
//      ↓
// Controller
//
// Security:
// Uses database-driven permission keys instead of hard-coded
// role-name checks.
//
// ============================================================

const express = require("express");

const rolePermissionController = require("../controllers/rolePermissionController");
const { protect } = require("../../../middleware/authMiddleware");
const { platformAdministrationAccess } = require("../../../middleware/platformAdministrationMiddleware");
const requirePermission = require("../../permissionResolver/middleware/requirePermission");
const PERMISSIONS = require("../../../shared/permissions/permissionKeys");

// ============================================================
// Router Initialization
// ============================================================

const router = express.Router();

// ============================================================
// Lookups - accessible to any authenticated user
// ============================================================

router.get(
    "/lookups",
    protect,
    rolePermissionController.getRolePermissionLookups
);

// ============================================================
// Apply JWT Protection + Platform Admin Role Check
// ============================================================

router.use(...platformAdministrationAccess);

// ============================================================
// Role Permission CRUD Routes
// ============================================================

router.get(
    "/",
    requirePermission(PERMISSIONS.ROLE_PERMISSIONS.VIEW),
    rolePermissionController.getRolePermissions
);

router.get(
    "/:rolePermissionId",
    requirePermission(PERMISSIONS.ROLE_PERMISSIONS.VIEW),
    rolePermissionController.getRolePermissionById
);

router.post(
    "/",
    requirePermission(PERMISSIONS.ROLE_PERMISSIONS.CREATE),
    rolePermissionController.createRolePermission
);

router.put(
    "/:rolePermissionId",
    requirePermission(PERMISSIONS.ROLE_PERMISSIONS.UPDATE),
    rolePermissionController.updateRolePermission
);

router.delete(
    "/:rolePermissionId",
    requirePermission(PERMISSIONS.ROLE_PERMISSIONS.DELETE),
    rolePermissionController.deleteRolePermission
);

router.post(
    "/bulk-grant",
    requirePermission(PERMISSIONS.ROLE_PERMISSIONS.CREATE),
    rolePermissionController.bulkGrantModulePermissions
);

// ============================================================
// Exports
// ============================================================

module.exports = router;
