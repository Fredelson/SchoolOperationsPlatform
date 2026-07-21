// ============================================
// ARAB UNITY SCHOOL
// Master Data Routes
//
// Handles:
// - Subjects
// - Departments
// - Sections
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

const { protect } = require("../../middleware/authMiddleware");

router.get("/:type", protect, getMasterData);
router.post("/:type", protect, createMasterData);
router.put("/:type/:id", protect, updateMasterData);
router.patch("/:type/:id/status", protect, updateMasterStatus);

module.exports = router;
