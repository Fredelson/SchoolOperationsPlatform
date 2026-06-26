// ============================================
// ARAB UNITY SCHOOL
// Lookup Routes
// Used for frontend dropdowns
// ============================================

const express = require("express");

const {
  getDepartments,
  getSubjects,
  getPurposes,
  getRoles,
  getAccessLevels,
  getHods,
} = require("../../controllers/lookups/lookupController");

const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

// Department dropdown
router.get("/departments", protect, getDepartments);

// Subject dropdown
router.get("/subjects", protect, getSubjects);

// Purpose dropdown
router.get("/purposes", protect, getPurposes);

// Role dropdown
router.get("/roles", protect, getRoles);

// Access level dropdown
router.get("/access-levels", protect, getAccessLevels);

// HOD dropdown by department
router.get("/hods", protect, getHods);

module.exports = router;