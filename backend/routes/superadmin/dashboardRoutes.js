// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Dashboard Routes
// ============================================

const express = require("express");
const router = express.Router();

const {
  getDashboard,
} = require("../../controllers/superadmin/dashboardController");

const { protect } = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

router.get(
  "/",
  protect,
  requirePermission("platform_admin.dashboard.view"),
  getDashboard
);

module.exports = router;
