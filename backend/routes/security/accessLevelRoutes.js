// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Access Level Routes
//
// Purpose:
// - Manage platform access levels
// - Support role and permission foundation
// ============================================

const express = require("express");
const router = express.Router();

const {
  getAccessLevels,
  createAccessLevel,
  updateAccessLevel,
  deleteAccessLevel,
} = require("../../controllers/security/accessLevelController");

const { protect } = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

router.get("/", protect, requirePermission("access-levels.view"), getAccessLevels);
router.post("/", protect, requirePermission("access-levels.create"), createAccessLevel);
router.put("/:id", protect, requirePermission("access-levels.update"), updateAccessLevel);
router.delete("/:id", protect, requirePermission("access-levels.delete"), deleteAccessLevel);

module.exports = router;