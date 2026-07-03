/* =========================================================
   Feature Flag Service
   Purpose:
   Handles business rules and validation for Feature Flag Manager.

   Architecture:
   Repository → Service → Controller → Routes
========================================================= */

const featureFlagRepository = require("../repositories/featureFlagRepository");

/* =========================================================
   GET FEATURE FLAGS
========================================================= */
const getFeatureFlags = async (query) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

  const filters = {
    search: query.search || "",
    moduleId: query.moduleId ? Number(query.moduleId) : null,
    visibilityStatusId: query.visibilityStatusId
      ? Number(query.visibilityStatusId)
      : null,
    isEnabled:
      query.isEnabled === "true"
        ? true
        : query.isEnabled === "false"
        ? false
        : null,
    page,
    limit,
  };

  const result = await featureFlagRepository.getFeatureFlags(filters);

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
};

/* =========================================================
   GET FEATURE FLAG BY ID
========================================================= */
const getFeatureFlagById = async (featureFlagId) => {
  const featureFlag = await featureFlagRepository.getFeatureFlagById(
    Number(featureFlagId)
  );

  if (!featureFlag) {
    const error = new Error("Feature flag not found.");
    error.statusCode = 404;
    throw error;
  }

  return featureFlag;
};

/* =========================================================
   CREATE FEATURE FLAG
========================================================= */
const createFeatureFlag = async (body) => {
  const featureKey = body.featureKey?.trim();
  const featureName = body.featureName?.trim();

  if (
    !featureKey ||
    !featureName ||
    !body.moduleId ||
    !body.visibilityStatusId
  ) {
    const error = new Error(
      "Feature key, feature name, module, and visibility status are required."
    );
    error.statusCode = 400;
    throw error;
  }

  const existing = await featureFlagRepository.getFeatureFlagByKey(featureKey);

  if (existing) {
    const error = new Error("Feature key already exists.");
    error.statusCode = 409;
    throw error;
  }

  return await featureFlagRepository.createFeatureFlag({
    featureKey,
    featureName,
    description: body.description?.trim() || null,
    moduleId: Number(body.moduleId),
    visibilityStatusId: Number(body.visibilityStatusId),
    isEnabled: Boolean(body.isEnabled),
  });
};

/* =========================================================
   UPDATE FEATURE FLAG
========================================================= */
const updateFeatureFlag = async (featureFlagId, body) => {
  const id = Number(featureFlagId);

  const current = await featureFlagRepository.getFeatureFlagById(id);

  if (!current) {
    const error = new Error("Feature flag not found.");
    error.statusCode = 404;
    throw error;
  }

  const featureKey = body.featureKey?.trim();
  const featureName = body.featureName?.trim();

  if (
    !featureKey ||
    !featureName ||
    !body.moduleId ||
    !body.visibilityStatusId
  ) {
    const error = new Error(
      "Feature key, feature name, module, and visibility status are required."
    );
    error.statusCode = 400;
    throw error;
  }

  const duplicate = await featureFlagRepository.getFeatureFlagByKey(featureKey);

  if (duplicate && duplicate.FeatureFlagId !== id) {
    const error = new Error("Feature key already exists.");
    error.statusCode = 409;
    throw error;
  }

  return await featureFlagRepository.updateFeatureFlag(id, {
    featureKey,
    featureName,
    description: body.description?.trim() || null,
    moduleId: Number(body.moduleId),
    visibilityStatusId: Number(body.visibilityStatusId),
    isEnabled: Boolean(body.isEnabled),
  });
};

/* =========================================================
   DELETE FEATURE FLAG
========================================================= */
const deleteFeatureFlag = async (featureFlagId) => {
  const id = Number(featureFlagId);

  const current = await featureFlagRepository.getFeatureFlagById(id);

  if (!current) {
    const error = new Error("Feature flag not found.");
    error.statusCode = 404;
    throw error;
  }

  return await featureFlagRepository.deleteFeatureFlag(id);
};

/* =========================================================
   GET LOOKUPS
========================================================= */
const getFeatureFlagLookups = async () => {
  return await featureFlagRepository.getFeatureFlagLookups();
};

/* =========================================================
   EXPORT SERVICE
========================================================= */

module.exports = {
  getFeatureFlags,
  getFeatureFlagById,
  createFeatureFlag,
  updateFeatureFlag,
  deleteFeatureFlag,
  getFeatureFlagLookups,
};