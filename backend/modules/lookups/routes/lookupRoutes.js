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
const requirePermission = require("../../permissionResolver/middleware/requirePermission");
const PERMISSIONS = require("../../../shared/permissions/permissionKeys");

router.use(protect);

router.get("/departments", requirePermission(PERMISSIONS.LOOKUPS.VIEW), getDepartments);
router.get("/sections", requirePermission(PERMISSIONS.LOOKUPS.VIEW), getSections);
router.get("/subjects", requirePermission(PERMISSIONS.LOOKUPS.VIEW), getSubjects);
router.get("/purposes", requirePermission(PERMISSIONS.LOOKUPS.VIEW), getPurposes);
// ============================================
// PLATFORM FOUNDATION
// ============================================

router.get(
  "/workspaces",
  requirePermission(PERMISSIONS.LOOKUPS.VIEW),
  getWorkspaces
);

router.get(
  "/modules",
  requirePermission(PERMISSIONS.LOOKUPS.VIEW),
  getModules
);

router.get(
  "/menus",
  requirePermission(PERMISSIONS.LOOKUPS.VIEW),
  getMenus
);

// ============================================
// SECURITY
// ============================================

router.get(
  "/permissions",
  requirePermission(PERMISSIONS.LOOKUPS.VIEW),
  getPermissions
);

router.get("/feature-flags", getFeatureFlags);
router.get("/visibility-statuses", getVisibilityStatuses);
router.get("/roles", requirePermission(PERMISSIONS.LOOKUPS.VIEW), getRoles);
router.get("/access-levels", requirePermission(PERMISSIONS.LOOKUPS.VIEW), getAccessLevels);
router.get("/hods", requirePermission(PERMISSIONS.LOOKUPS.VIEW), getHods);

module.exports = router;