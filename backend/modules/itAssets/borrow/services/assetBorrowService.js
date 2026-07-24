/* =========================================================
   IT Asset Borrow Service
========================================================= */

const repository = require("../repositories/assetBorrowRepository");
const {
  validateReturnParts,
} = require("../../shared/constants/assetParts");
const { createMaintenanceLog } = require("../../maintenance/services/assetMaintenanceService");

const borrowAsset = async ({ payload, user, ipAddress }) => {
  const asset = await repository.getAssetById(payload.assetId);
  if (!asset) {
    const error = new Error("IT asset not found.");
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = String(asset.StatusKey || asset.StatusName || "")
    .replace(/[\s_-]/g, "")
    .toUpperCase();

  if (["UNDERREPAIR", "UNDERMAINTENANCE", "MAINTENANCE"].includes(currentStatus)) {
    const error = new Error("This asset is under repair and cannot be borrowed.");
    error.statusCode = 400;
    throw error;
  }

  const activeBorrow = await repository.getActiveBorrowByAssetId(payload.assetId);
  if (activeBorrow) {
    const error = new Error("This asset is already borrowed.");
    error.statusCode = 400;
    throw error;
  }

  const borrowedStatus = await repository.getStatusByKey("Borrowed");
  if (!borrowedStatus) {
    const error = new Error("Borrowed status is missing in ITAssetStatuses.");
    error.statusCode = 400;
    throw error;
  }

  const borrower = payload.borrowedByUserId
    ? await repository.getUserById(payload.borrowedByUserId)
    : null;

  if (payload.borrowedByUserId && !borrower) {
    const error = new Error("Borrower user not found.");
    error.statusCode = 404;
    throw error;
  }

  return repository.borrowAsset({
    asset,
    borrower,
    payload,
    borrowedStatusId: borrowedStatus.ITAssetStatusId,
    actionByUserId: user?.id || user?.UserId || null,
    ipAddress,
  });
};

const returnBorrowedAsset = async ({ payload, user, ipAddress }) => {
  const asset = await repository.getAssetById(payload.assetId);
  if (!asset) {
    const error = new Error("IT asset not found.");
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = String(asset.StatusKey || asset.StatusName || "")
    .replace(/[\s_-]/g, "")
    .toUpperCase();

  if (["UNDERREPAIR", "UNDERMAINTENANCE", "MAINTENANCE"].includes(currentStatus)) {
    const error = new Error("This asset is under repair and cannot be returned.");
    error.statusCode = 400;
    throw error;
  }

  const activeBorrow = await repository.getActiveBorrowByAssetId(payload.assetId);
  if (!activeBorrow) {
    const error = new Error("This asset is not currently borrowed.");
    error.statusCode = 400;
    throw error;
  }

  const returnCondition = await repository.getConditionById(payload.returnConditionId);
  if (!returnCondition) {
    const error = new Error("Valid return condition is required.");
    error.statusCode = 400;
    throw error;
  }

  const conditionName = String(returnCondition.ConditionName || "").toLowerCase();
  if (conditionName === "fair") {
    const error = new Error("Fair is no longer an available return condition.");
    error.statusCode = 400;
    throw error;
  }

  const requiredParts = validateReturnParts({
    asset,
    returnCondition,
    requiredPartKeys: payload.requiredPartKeys,
  });

  const targetStatusKey = conditionName === "beyond repair"
    ? "ReadyForDisposal"
    : conditionName === "need maintenance" || conditionName === "need parts"
      ? "UnderRepair"
      : "Available";
  const targetStatus = await repository.getStatusByKey(targetStatusKey);
  if (!targetStatus) {
    const error = new Error(`${targetStatusKey} status is missing in ITAssetStatuses.`);
    error.statusCode = 400;
    throw error;
  }

  const result = await repository.returnBorrowedAsset({
    asset,
    activeBorrow,
    targetStatusId: targetStatus.ITAssetStatusId,
    actionByUserId: user?.id || user?.UserId || null,
    returnNotes: payload.returnNotes || payload.notes || null,
    returnCondition,
    returnConditionId: returnCondition.ITAssetConditionId,
    requiredParts,
    ipAddress,
  });

  if (conditionName === "need maintenance" || conditionName === "need parts") {
    try {
      await createMaintenanceLog({
        payload: {
          assetId: asset.AssetId,
          maintenanceType: returnCondition.ConditionName,
          description: payload.notes || `Asset returned with condition: ${returnCondition.ConditionName}.`,
        },
        user,
        ipAddress,
      });
    } catch (maintenanceError) {
      console.error(
        "Failed to create maintenance log for returned asset:",
        maintenanceError.message
      );
    }
  }

  return result;
};

const getBorrowHistory = async ({ assetId = null, page = 1, limit = 20 }) => {
  return repository.getBorrowHistory({ assetId, page, limit });
};

const getActiveBorrows = async () => {
  return repository.getActiveBorrows();
};

const getOverdueBorrows = async () => {
  return repository.getOverdueBorrows();
};

module.exports = {
  borrowAsset,
  returnBorrowedAsset,
  getBorrowHistory,
  getActiveBorrows,
  getOverdueBorrows,
};
