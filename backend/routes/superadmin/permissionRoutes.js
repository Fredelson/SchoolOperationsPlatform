// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Permission Routes
// ============================================

const express = require("express");
const router = express.Router();

const {
  getMyPermissions,
  getAllPermissionsGrouped,
} = require("../../controllers/superadmin/permissionController");

const { protect } = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

// ============================================
// Get logged-in user's final permissions
// Any logged-in user can access this
// GET /api/superadmin/permissions/me
// ============================================

router.get("/me", protect, getMyPermissions);

// ============================================
// Get all grouped permissions
// Super Admin permission required
// GET /api/superadmin/permissions
// ============================================

router.get(
  "/",
  protect,
  requirePermission("Permission.View"),
  getAllPermissionsGrouped
);

module.exports = router;
