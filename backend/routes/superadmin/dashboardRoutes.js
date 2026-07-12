// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Dashboard Routes
// ============================================

const express = require("express");
const router = express.Router();

const {
  getDashboard,
} = require("../../controllers/superadmin/dashboardController");

const { protect,authorizeRoles } = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

// GET /api/superadmin/dashboard
router.get(
  "/",
  protect,
  authorizeRoles("SuperAdmin"),
  requirePermission("SuperAdmin.Dashboard.View"),
  getDashboard
);

module.exports = router;
