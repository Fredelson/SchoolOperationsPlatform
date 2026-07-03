/* =========================================================
   Feature Flag Controller
   Purpose:
   Handles HTTP request/response for Feature Flag Manager.

   Architecture:
   Repository → Service → Controller → Routes
========================================================= */

const featureFlagService = require("../services/featureFlagService");

/* =========================================================
   GET FEATURE FLAGS
   Route: GET /api/feature-flags
========================================================= */
const getFeatureFlags = async (req, res) => {
  try {
    const result = await featureFlagService.getFeatureFlags(req.query);

    return res.status(200).json({
      success: true,
      message: "Feature flags loaded successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Get Feature Flags Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load feature flags.",
    });
  }
};

/* =========================================================
   GET FEATURE FLAG BY ID
   Route: GET /api/feature-flags/:id
========================================================= */
const getFeatureFlagById = async (req, res) => {
  try {
    const featureFlag = await featureFlagService.getFeatureFlagById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Feature flag loaded successfully.",
      data: featureFlag,
    });
  } catch (error) {
    console.error("Get Feature Flag By ID Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load feature flag.",
    });
  }
};

/* =========================================================
   CREATE FEATURE FLAG
   Route: POST /api/feature-flags
========================================================= */
const createFeatureFlag = async (req, res) => {
  try {
    const featureFlag = await featureFlagService.createFeatureFlag(req.body);

    return res.status(201).json({
      success: true,
      message: "Feature flag created successfully.",
      data: featureFlag,
    });
  } catch (error) {
    console.error("Create Feature Flag Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create feature flag.",
    });
  }
};

/* =========================================================
   UPDATE FEATURE FLAG
   Route: PUT /api/feature-flags/:id
========================================================= */
const updateFeatureFlag = async (req, res) => {
  try {
    const featureFlag = await featureFlagService.updateFeatureFlag(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Feature flag updated successfully.",
      data: featureFlag,
    });
  } catch (error) {
    console.error("Update Feature Flag Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update feature flag.",
    });
  }
};

/* =========================================================
   DELETE FEATURE FLAG
   Route: DELETE /api/feature-flags/:id
========================================================= */
const deleteFeatureFlag = async (req, res) => {
  try {
    const featureFlag = await featureFlagService.deleteFeatureFlag(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Feature flag deleted successfully.",
      data: featureFlag,
    });
  } catch (error) {
    console.error("Delete Feature Flag Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete feature flag.",
    });
  }
};

/* =========================================================
   GET FEATURE FLAG LOOKUPS
   Route: GET /api/feature-flags/lookups
========================================================= */
const getFeatureFlagLookups = async (req, res) => {
  try {
    const lookups = await featureFlagService.getFeatureFlagLookups();

    return res.status(200).json({
      success: true,
      message: "Feature flag lookups loaded successfully.",
      data: lookups,
    });
  } catch (error) {
    console.error("Get Feature Flag Lookups Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load feature flag lookups.",
    });
  }
};

/* =========================================================
   EXPORT CONTROLLER FUNCTIONS
========================================================= */
module.exports = {
  getFeatureFlags,
  getFeatureFlagById,
  createFeatureFlag,
  updateFeatureFlag,
  deleteFeatureFlag,
  getFeatureFlagLookups,
};