// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Dashboard Routes
// ============================================

const express = require("express");
const router = express.Router();

const {
  getDashboard,
} = require("../../controllers/superadmin/dashboardController");

const { protect, authorizeRoles } = require("../../middleware/authMiddleware");

router.get(
  "/",
  protect,
  authorizeRoles("SuperAdmin", "PlatformAdmin"),
  getDashboard
);

module.exports = router;
