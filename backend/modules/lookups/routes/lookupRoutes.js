// backend/modules/lookups/routes/lookupRoutes.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Lookup Routes
 * ============================================================
 *
 * Final API paths:
 * GET /api/lookups/departments
 * GET /api/lookups/sections
 * GET /api/lookups/subjects
 * GET /api/lookups/purposes
 * GET /api/lookups/roles
 * GET /api/lookups/access-levels
 * GET /api/lookups/hods?departmentId=1
 * ============================================================
 */

const express = require("express");
const router = express.Router();

const {
  getDepartments,
  getSections,
  getSubjects,
  getPurposes,
  getRoles,
  getAccessLevels,
  getHods,
} = require("../controllers/lookupController");

const { protect } = require("../../../middleware/authMiddleware");

router.use(protect);

router.get("/departments", getDepartments);
router.get("/sections", getSections);
router.get("/subjects", getSubjects);
router.get("/purposes", getPurposes);
router.get("/roles", getRoles);
router.get("/access-levels", getAccessLevels);
router.get("/hods", getHods);

module.exports = router;