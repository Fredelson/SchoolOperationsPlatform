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

const { protect, authorizeRoles } = require("../../middleware/authMiddleware");
const SCHOOL_CONFIGURATION_ROLES = ["PlatformAdmin", "SuperAdmin"];
const PRINTING_MASTER_DATA_ROLES = [
  "PrintingAdmin",
  "PlatformAdmin",
  "SuperAdmin",
];

const authorizeMasterType = (req, res, next) => {
  const allowedRoles =
    req.params.type === "purposes"
      ? PRINTING_MASTER_DATA_ROLES
      : SCHOOL_CONFIGURATION_ROLES;

  return authorizeRoles(...allowedRoles)(req, res, next);
};

// GET /api/master/:type
router.get("/:type", protect, authorizeMasterType, getMasterData);

// POST /api/master/:type
router.post("/:type", protect, authorizeMasterType, createMasterData);

// PUT /api/master/:type/:id
router.put("/:type/:id", protect, authorizeMasterType, updateMasterData);

// PATCH /api/master/:type/:id/status
router.patch("/:type/:id/status", protect, authorizeMasterType, updateMasterStatus);

module.exports = router;
