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

const { protect } = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

// GET /api/superadmin/system-settings
router.get(
  "/",
  protect,
  requirePermission("SystemSettings.View"),
  getSystemSettings
);

// PUT /api/superadmin/system-settings/:id
router.put(
  "/:id",
  protect,
  requirePermission("SystemSettings.Edit"),
  updateSystemSetting
);

module.exports = router;
