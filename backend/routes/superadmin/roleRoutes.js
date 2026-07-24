// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Role Routes
// Role and role permission management
// ============================================

const express = require("express");
const router = express.Router();

const {
  getRoles,
} = require("../../controllers/superadmin/roleController");

const { protect, authorizeRoles } = require("../../middleware/authMiddleware");

router.get(
  "/",
  protect,
  authorizeRoles("SuperAdmin", "PlatformAdmin"),
  getRoles
);

module.exports = router;
