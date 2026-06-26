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

const {
  protect,
  authorizeRoles,
} = require("../../middleware/authMiddleware");

const ACCESS_LEVEL_MANAGERS = [
  "PlatformAdmin",
  "PrintingAdmin",
  "SuperAdmin",
];

router.get("/", protect, authorizeRoles(...ACCESS_LEVEL_MANAGERS), getAccessLevels);
router.post("/", protect, authorizeRoles(...ACCESS_LEVEL_MANAGERS), createAccessLevel);
router.put("/:id", protect, authorizeRoles(...ACCESS_LEVEL_MANAGERS), updateAccessLevel);
router.delete("/:id", protect, authorizeRoles(...ACCESS_LEVEL_MANAGERS), deleteAccessLevel);

module.exports = router;