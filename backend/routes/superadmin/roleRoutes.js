// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Role Routes
// Role and role permission management
// ============================================

const express = require("express");
const router = express.Router();

const {
  getRoles,
  getRolePermissions,
  updateRolePermission,
} = require("../../controllers/superadmin/roleController");

const { protect } = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

// GET /api/superadmin/roles
router.get(
  "/",
  protect,
  requirePermission("Role.View"),
  getRoles
);

// GET /api/superadmin/roles/:id/permissions
router.get(
  "/:id/permissions",
  protect,
  requirePermission("Role.View"),
  getRolePermissions
);

// PUT /api/superadmin/roles/:roleId/permissions/:permissionId
router.put(
  "/:roleId/permissions/:permissionId",
  protect,
  requirePermission("Permission.Assign"),
  updateRolePermission
);

module.exports = router;
