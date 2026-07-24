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

const { protect, authorizeRoles } = require("../../middleware/authMiddleware");


router.get("/", protect, authorizeRoles("SuperAdmin", "PlatformAdmin", "Admin", "PrintingAdmin"), getAccessLevels);
router.post("/", protect, authorizeRoles("SuperAdmin", "PlatformAdmin", "Admin", "PrintingAdmin"), createAccessLevel);
router.put("/:id", protect, authorizeRoles("SuperAdmin", "PlatformAdmin", "Admin", "PrintingAdmin"), updateAccessLevel);
router.delete("/:id", protect, authorizeRoles("SuperAdmin", "PlatformAdmin", "Admin", "PrintingAdmin"), deleteAccessLevel);

module.exports = router;