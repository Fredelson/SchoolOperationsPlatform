/* =========================================================
   IT Asset Assignment Command Service
========================================================= */

const repository = require("../repositories/assetAssignmentRepository");
const validationService = require("./assetAssignmentValidationService");
const borrowService = require("../../borrow/services/assetBorrowService");

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
  try {
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
  } catch (error) {
    if (error.message !== "This asset has no active assignment to return.") {
      throw error;
    }

    const borrowPayload = {
      assetId: String(assetId),
      returnConditionId: payload?.returnConditionId || null,
      requiredPartKeys: payload?.requiredPartKeys || [],
      notes: payload?.notes || null,
    };

    return borrowService.returnBorrowedAsset({
      payload: borrowPayload,
      user: currentUser,
      ipAddress,
    });
  }
};

module.exports = {
  assignAsset,
  returnAsset,
};
