/* =========================================================
   IT Asset Assignment Command Service
========================================================= */

const repository = require("../repositories/assetAssignmentRepository");
const validationService = require("./assetAssignmentValidationService");

const getCurrentUserId = (user) => {
  return user?.UserId || user?.userId || user?.id || null;
};

const assignAsset = async (payload, currentUser, ipAddress = null) => {
  const { asset, assignedToUser, assignedStatus } =
    await validationService.validateAssignAsset(payload);

  return repository.assignAsset({
    asset,
    assignedToUser,
    payload,
    assignedByUserId: getCurrentUserId(currentUser),
    assignedStatusId: assignedStatus.ITAssetStatusId,
    ipAddress,
  });
};

const returnAsset = async (assetId, payload, currentUser, ipAddress = null) => {
  const {
    asset,
    activeAssignment,
    returnCondition,
    targetStatus,
    requiredParts,
  } =
    await validationService.validateReturnAsset(assetId, payload);

  return repository.returnAsset({
    asset,
    activeAssignment,
    returnedStatusId: targetStatus.ITAssetStatusId,
    changedByUserId: getCurrentUserId(currentUser),
    notes: payload?.notes || null,
    returnCondition,
    returnConditionId: payload?.returnConditionId || null,
    requiredParts,
    ipAddress,
  });
};

module.exports = {
  assignAsset,
  returnAsset,
};
