// ============================================
// ARAB UNITY SCHOOL
// Super Admin - User Permission Override Routes
// Individual user permission control
// ============================================

const express = require("express");
const router = express.Router();

const {
  getUserPermissionOverrides,
  updateUserPermissionOverride,
  removeUserPermissionOverride,
} = require("../../controllers/superadmin/userPermissionOverrideController");

const { protect } = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

// GET /api/superadmin/user-overrides/:userId
router.get(
  "/:userId",
  protect,
  requirePermission("UserOverride.Manage"),
  getUserPermissionOverrides
);

// PUT /api/superadmin/user-overrides/:userId/:permissionId
router.put(
  "/:userId/:permissionId",
  protect,
  requirePermission("UserOverride.Manage"),
  updateUserPermissionOverride
);

// DELETE /api/superadmin/user-overrides/:userId/:permissionId
router.delete(
  "/:userId/:permissionId",
  protect,
  requirePermission("UserOverride.Manage"),
  removeUserPermissionOverride
);

module.exports = router;
