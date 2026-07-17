/* =========================================================
   IT Asset Assignment Validation Service
========================================================= */

const repository = require("../repositories/assetAssignmentRepository");
const {
  validateReturnParts,
} = require("../../shared/constants/assetParts");

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

  const currentStatus = String(asset.StatusKey || asset.StatusName || "")
    .replace(/[\s_-]/g, "")
    .toUpperCase();

  if (["UNDERREPAIR", "UNDERMAINTENANCE", "MAINTENANCE"].includes(currentStatus)) {
    throw Object.assign(
      new Error("This asset is under repair and cannot be returned."),
      { statusCode: 400 }
    );
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

  if (conditionName === "fair") {
    throw Object.assign(
      new Error("Fair is no longer an available return condition."),
      { statusCode: 400 }
    );
  }

  const requiredParts = validateReturnParts({
    asset,
    returnCondition,
    requiredPartKeys: payload.requiredPartKeys,
  });

  // Assets returned in Need Maintenance or Need Parts condition go to
  // Under Repair. Beyond Repair goes to Ready for Disposal.
  // Assets returned in Excellent or Good condition go back to Available.
  let statusKey = "Available";

  if (conditionName === "beyond repair") {
    statusKey = "ReadyForDisposal";
  } else if (
    conditionName === "need maintenance" ||
    conditionName === "need parts"
  ) {
    statusKey = "UnderRepair";
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
    requiredParts,
  };
};

module.exports = {
  validateAssignAsset,
  validateReturnAsset,
};
