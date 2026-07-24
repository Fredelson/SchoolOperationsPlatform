// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Module Routes
// Module Manager
// ============================================

const express = require("express");
const router = express.Router();

const {
  getAllModules,
  updateModule,
} = require("../../controllers/superadmin/moduleController");

const { protect, authorizeRoles } = require("../../middleware/authMiddleware");


// ============================================
// Get all modules
// GET /api/superadmin/modules
// ============================================

router.get(
  "/",
  protect,
  authorizeRoles("SuperAdmin", "PlatformAdmin"),
  getAllModules
);

// ============================================
// Update module
// PUT /api/superadmin/modules/:id
// ============================================

router.put(
  "/:id",
  protect,
  authorizeRoles("SuperAdmin", "PlatformAdmin"),
  updateModule
);

module.exports = router;
