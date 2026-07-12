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

const { protect } = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

// ============================================
// Get all modules
// GET /api/superadmin/modules
// ============================================

router.get(
  "/",
  protect,
  requirePermission("Module.View"),
  getAllModules
);

// ============================================
// Update module
// PUT /api/superadmin/modules/:id
// ============================================

router.put(
  "/:id",
  protect,
  requirePermission("Module.Edit"),
  updateModule
);

module.exports = router;
