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

// GET /api/master/:type
router.get("/:type", protect, getMasterData);

// POST /api/master/:type
router.post("/:type", protect, createMasterData);

// PUT /api/master/:type/:id
router.put("/:type/:id", protect, updateMasterData);

// PATCH /api/master/:type/:id/status
router.patch("/:type/:id/status", protect, updateMasterStatus);

module.exports = router;