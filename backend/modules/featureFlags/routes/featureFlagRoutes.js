/* =========================================================
   Feature Flag Routes
   Purpose:
   Defines all API endpoints for Feature Flag Manager.
========================================================= */

const express = require("express");
const router = express.Router();

const featureFlagController = require("../controllers/featureFlagController");
const { protect } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../../modules/permissionResolver/middleware/requirePermission");

router.use(protect);

router.get("/lookups", requirePermission("FeatureFlag.View"), featureFlagController.getFeatureFlagLookups);
router.get("/", requirePermission("FeatureFlag.View"), featureFlagController.getFeatureFlags);
router.get("/:id", requirePermission("FeatureFlag.View"), featureFlagController.getFeatureFlagById);
router.post("/", requirePermission("FeatureFlag.View"), featureFlagController.createFeatureFlag);
router.put("/:id", requirePermission("FeatureFlag.View"), featureFlagController.updateFeatureFlag);
router.delete("/:id", requirePermission("FeatureFlag.View"), featureFlagController.deleteFeatureFlag);

module.exports = router;
