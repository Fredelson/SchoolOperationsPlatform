/* =========================================================
   IT Asset Assignment Validation Service
========================================================= */

const repository = require("../repositories/assetAssignmentRepository");

const validateAssignAsset = async (payload) => {
  if (!payload.assetId || Number(payload.assetId) <= 0) {
    const error = new Error("Asset is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!payload.assignedToUserId && !payload.assignedToName) {
    const error = new Error("Assigned user or assigned name is required.");
    error.statusCode = 400;
    throw error;
  }

  const asset = await repository.getAssetById(payload.assetId);

  if (!asset) {
    const error = new Error("IT asset not found.");
    error.statusCode = 404;
    throw error;
  }

  const activeAssignment = await repository.getActiveAssignment(payload.assetId);

  if (activeAssignment) {
    const error = new Error("This asset is already assigned. Return it first before assigning again.");
    error.statusCode = 409;
    throw error;
  }

  let assignedToUser = null;

  if (payload.assignedToUserId) {
    assignedToUser = await repository.getUserById(payload.assignedToUserId);

    if (!assignedToUser) {
      const error = new Error("Assigned user not found.");
      error.statusCode = 404;
      throw error;
    }
  }

  const assignedStatus = await repository.getStatusByKey("ASSIGNED");

  if (!assignedStatus) {
    const error = new Error("ASSIGNED asset status is missing in ITAssetStatuses.");
    error.statusCode = 500;
    throw error;
  }

  return {
    asset,
    assignedToUser,
    assignedStatus,
  };
};

const validateReturnAsset = async (assetId) => {
  if (!assetId || Number(assetId) <= 0) {
    const error = new Error("Asset is required.");
    error.statusCode = 400;
    throw error;
  }

  const asset = await repository.getAssetById(assetId);

  if (!asset) {
    const error = new Error("IT asset not found.");
    error.statusCode = 404;
    throw error;
  }

  const activeAssignment = await repository.getActiveAssignment(assetId);

  if (!activeAssignment) {
    const error = new Error("This asset has no active assignment to return.");
    error.statusCode = 409;
    throw error;
  }

  const availableStatus = await repository.getStatusByKey("AVAILABLE");

  if (!availableStatus) {
    const error = new Error("AVAILABLE asset status is missing in ITAssetStatuses.");
    error.statusCode = 500;
    throw error;
  }

  return {
    asset,
    activeAssignment,
    availableStatus,
  };
};

module.exports = {
  validateAssignAsset,
  validateReturnAsset,
};