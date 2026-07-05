/* =========================================================
   IT Asset Validator

   Purpose:
   Validates request body before controller calls the service.

   Rules:
   - No SQL
   - No business processing
   - Only request validation
========================================================= */

const validateAssetPayload = (req, res, next) => {
  const errors = [];

  const {
    assetTag,
    itAssetCategoryId,
    itAssetStatusId,
    itAssetModelId,
    itAssetConditionId,
    currentAssignedUserId,
    currentRoomId,
    currentDepartmentId,
    currentLocationId,
    schoolId,
  } = req.body;

  if (!assetTag || String(assetTag).trim() === "") {
    errors.push("Asset tag is required.");
  }

  if (!itAssetCategoryId || Number(itAssetCategoryId) <= 0) {
    errors.push("Asset category is required.");
  }

  if (!itAssetStatusId || Number(itAssetStatusId) <= 0) {
    errors.push("Asset status is required.");
  }

  const optionalNumberFields = {
    itAssetModelId,
    itAssetConditionId,
    currentAssignedUserId,
    currentRoomId,
    currentDepartmentId,
    currentLocationId,
    schoolId,
  };

  Object.entries(optionalNumberFields).forEach(([field, value]) => {
    if (value !== undefined && value !== null && value !== "" && Number(value) <= 0) {
      errors.push(`${field} must be a valid ID.`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors,
    });
  }

  return next();
};

module.exports = {
  validateAssetPayload,
};