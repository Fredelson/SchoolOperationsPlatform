// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Feature Flag Routes
// ============================================

const express = require("express");
const router = express.Router();

const {
  getFeatureFlags,
  updateFeatureFlag,
} = require("../../controllers/superadmin/featureFlagController");

const { protect } = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

// GET /api/superadmin/feature-flags
router.get(
  "/",
  protect,
  requirePermission("FeatureFlag.View"),
  getFeatureFlags
);

// PUT /api/superadmin/feature-flags/:id
router.put(
  "/:id",
  protect,
  requirePermission("FeatureFlag.Edit"),
  updateFeatureFlag
);

module.exports = router;
