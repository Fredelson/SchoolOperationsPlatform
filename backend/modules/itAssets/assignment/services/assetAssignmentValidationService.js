/* =========================================================
   IT Asset Assignment Validation Service
========================================================= */

const repository = require("../repositories/assetAssignmentRepository");

const validateAssignAsset = async (payload) => {
  if (!payload.assetId) {
    throw Object.assign(new Error("Asset ID is required."), {
      statusCode: 400,
    });
  }

  const asset = await repository.getAssetById(payload.assetId);

  if (!asset) {
    throw Object.assign(new Error("IT asset not found."), {
      statusCode: 404,
    });
  }

  const currentStatus = String(asset.StatusKey || asset.StatusName || "")
    .replace(/[\s_-]/g, "")
    .toUpperCase();

  if (["UNDERREPAIR", "UNDERMAINTENANCE", "MAINTENANCE"].includes(currentStatus)) {
    throw Object.assign(
      new Error("This asset cannot be assigned until maintenance is marked finished."),
      { statusCode: 400 }
    );
  }

  const assignedStatus = await repository.getStatusByKey("Assigned");

  if (!assignedStatus) {
    throw Object.assign(new Error("Assigned status is missing."), {
      statusCode: 400,
    });
  }

  let assignedToUser = null;

  if (payload.assignedToUserId) {
    assignedToUser = await repository.getUserById(payload.assignedToUserId);

    if (!assignedToUser) {
      throw Object.assign(new Error("Assigned user not found."), {
        statusCode: 404,
      });
    }
  }

  return {
    asset,
    assignedToUser,
    assignedStatus,
  };
};

const validateReturnAsset = async (assetId, payload = {}) => {
  if (!assetId) {
    throw Object.assign(new Error("Asset ID is required."), {
      statusCode: 400,
    });
  }

  if (!payload.returnConditionId) {
    throw Object.assign(new Error("Return condition is required."), {
      statusCode: 400,
    });
  }

  const asset = await repository.getAssetById(assetId);

  if (!asset) {
    throw Object.assign(new Error("IT asset not found."), {
      statusCode: 404,
    });
  }

  const activeAssignment = await repository.getActiveAssignment(assetId);

  if (!activeAssignment) {
    throw Object.assign(
      new Error("This asset has no active assignment to return."),
      { statusCode: 400 }
    );
  }

  const returnCondition = await repository.getConditionById(
    payload.returnConditionId
  );

  if (!returnCondition) {
    throw Object.assign(new Error("Invalid return condition."), {
      statusCode: 400,
    });
  }

  const conditionName = String(returnCondition.ConditionName || "").toLowerCase();

  const requiresIssue = ["fair", "poor", "damaged", "beyond repair"].includes(
    conditionName
  );

  if (
    requiresIssue &&
    (!Array.isArray(payload.returnIssueTypeIds) ||
      payload.returnIssueTypeIds.length === 0)
  ) {
    throw Object.assign(
      new Error("At least one required action / issue is required."),
      { statusCode: 400 }
    );
  }

  // Every returned asset requires maintenance review before it can be
  // explicitly released back to Available inventory.
  let statusKey = "UnderRepair";

  if (conditionName === "beyond repair") {
    statusKey = "ReadyForDisposal";
  }

  const targetStatus = await repository.getStatusByKey(statusKey);

  if (!targetStatus) {
    throw Object.assign(
      new Error(`Asset status '${statusKey}' is missing.`),
      { statusCode: 400 }
    );
  }

  return {
    asset,
    activeAssignment,
    returnCondition,
    targetStatus,
  };
};

module.exports = {
  validateAssignAsset,
  validateReturnAsset,
};
