// ============================================
// ARAB UNITY SCHOOL
// Super Admin - System Settings Routes
// ============================================

const express = require("express");
const router = express.Router();

const {
  getSystemSettings,
  updateSystemSetting,
} = require("../../controllers/superadmin/systemSettingsController");

const { protect, authorizeRoles } = require("../../middleware/authMiddleware");


// GET /api/superadmin/system-settings
router.get(
  "/",
  protect,
  authorizeRoles("SuperAdmin", "PlatformAdmin"),
  getSystemSettings
);

// PUT /api/superadmin/system-settings/:id
router.put(
  "/:id",
  protect,
  authorizeRoles("SuperAdmin", "PlatformAdmin"),
  updateSystemSetting
);

module.exports = router;
