// backend/modules/lookups/routes/lookupRoutes.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Lookup Routes
 * ============================================================
 *
 * Purpose:
 * Provides protected lookup/reference data endpoints.
 *
 * Final API paths:
 * GET /api/lookups/departments
 * GET /api/lookups/sections
 * GET /api/lookups/subjects
 * GET /api/lookups/purposes
 * GET /api/lookups/roles
 * GET /api/lookups/access-levels
 * GET /api/lookups/hods?departmentId=1
 *
 * Security:
 * Uses database-driven permission middleware.
 * ============================================================
 */

const express = require("express");
const router = express.Router();

const {
  getDepartments,
  getSections,
  getSubjects,
  getPurposes,

  // Platform
  getWorkspaces,
  getModules,
  getMenus,

  // Security
  getRoles,
  getPermissions,
  getAccessLevels,
  getFeatureFlags,
  getVisibilityStatuses,

  getHods,
} = require("../controllers/lookupController");

const { protect } = require("../../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../../middleware/permissionMiddleware");

router.use(protect);

router.get("/departments", requireActiveWorkspace, getDepartments);
router.get("/sections", requireActiveWorkspace, getSections);
router.get("/subjects", requireActiveWorkspace, getSubjects);
router.get("/purposes", requireActiveWorkspace, getPurposes);
// ============================================
// PLATFORM FOUNDATION
// ============================================

router.get(
  "/workspaces",
  requireActiveWorkspace,
  getWorkspaces
);

router.get(
  "/modules",
  requireActiveWorkspace,
  getModules
);

router.get(
  "/menus",
  requireActiveWorkspace,
  getMenus
);

// ============================================
// SECURITY
// ============================================

router.get(
  "/permissions",
  requireActiveWorkspace,
  getPermissions
);

router.get("/feature-flags", getFeatureFlags);
router.get("/visibility-statuses", getVisibilityStatuses);
router.get("/roles", requireActiveWorkspace, getRoles);
router.get("/access-levels", requireActiveWorkspace, getAccessLevels);
router.get("/hods", requireActiveWorkspace, getHods);

module.exports = router;