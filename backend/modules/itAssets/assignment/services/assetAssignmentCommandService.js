/* =========================================================
   IT Asset Assignment Command Service
========================================================= */

const repository = require("../repositories/assetAssignmentRepository");
const validationService = require("./assetAssignmentValidationService");
const assetAuditService = require("../../shared/services/assetAuditService");

const getCurrentUserId = (user) => {
  return user?.UserId || user?.userId || user?.id || null;
};

const assignAsset = async (payload, currentUser, ipAddress = null) => {
  const { asset, assignedToUser, assignedStatus } =
    await validationService.validateAssignAsset(payload);

  const assignedByUserId = getCurrentUserId(currentUser);

  const result = await repository.assignAsset({
  asset,
  assignedToUser,
  payload,
  assignedByUserId,
  assignedStatusId: assignedStatus.ITAssetStatusId,
  ipAddress,
});

  await assetAuditService.logAssetAssigned({
    asset: result.asset,
    assignment: result.assignment,
    user: currentUser,
    ipAddress,
  });

  return result;
};

const returnAsset = async (assetId, payload, currentUser, ipAddress = null) => {
  const { asset, activeAssignment, availableStatus } =
    await validationService.validateReturnAsset(assetId);

  const changedByUserId = getCurrentUserId(currentUser);

  const result = await repository.returnAsset({
  asset,
  activeAssignment,
  returnedStatusId: availableStatus.ITAssetStatusId,
  changedByUserId,
  notes: payload?.notes || null,
  ipAddress,
});

  await assetAuditService.logAssetReturned({
    asset: result.asset,
    assignment: result.assignment,
    user: currentUser,
    ipAddress,
  });

  return result;
};

module.exports = {
  assignAsset,
  returnAsset,
};