/* =========================================================
   Feature Flag Routes
   Purpose:
   Defines all API endpoints for Feature Flag Manager.
========================================================= */

const express = require("express");
const router = express.Router();

const featureFlagController = require("../controllers/featureFlagController");

router.get("/lookups", featureFlagController.getFeatureFlagLookups);
router.get("/", featureFlagController.getFeatureFlags);
router.get("/:id", featureFlagController.getFeatureFlagById);
router.post("/", featureFlagController.createFeatureFlag);
router.put("/:id", featureFlagController.updateFeatureFlag);
router.delete("/:id", featureFlagController.deleteFeatureFlag);

module.exports = router;