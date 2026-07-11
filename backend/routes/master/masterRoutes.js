// ============================================
// ARAB UNITY SCHOOL
// Master Data Routes
//
// Handles:
// - Subjects
// - Departments
// - Purposes
// - Roles
// - Access Levels
//
// No hard delete:
// Records are activated/deactivated only
// ============================================

const express = require("express");
const router = express.Router();

const {
  getMasterData,
  createMasterData,
  updateMasterData,
  updateMasterStatus,
} = require("../../controllers/master/masterController");

const { protect, authorizeRoles } = require("../../middleware/authMiddleware");
const MASTER_DATA_ROLES = ["PrintingAdmin", "PlatformAdmin", "SuperAdmin"];

// GET /api/master/:type
router.get("/:type", protect, authorizeRoles(...MASTER_DATA_ROLES), getMasterData);

// POST /api/master/:type
router.post("/:type", protect, authorizeRoles(...MASTER_DATA_ROLES), createMasterData);

// PUT /api/master/:type/:id
router.put("/:type/:id", protect, authorizeRoles(...MASTER_DATA_ROLES), updateMasterData);

// PATCH /api/master/:type/:id/status
router.patch("/:type/:id/status", protect, authorizeRoles(...MASTER_DATA_ROLES), updateMasterStatus);

module.exports = router;
