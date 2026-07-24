/* =========================================================
   IT Asset Assignment Command Service
========================================================= */

const repository = require("../repositories/assetAssignmentRepository");
const validationService = require("./assetAssignmentValidationService");
const borrowService = require("../../borrow/services/assetBorrowService");
const { validateReturnParts } = require("../../shared/constants/assetParts");
const { createMaintenanceLog } = require("../../maintenance/services/assetMaintenanceService");

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

    const result = await repository.returnAsset({
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

    if (
      targetStatus.StatusKey === "UnderRepair" ||
      targetStatus.StatusKey === "Under Repair"
    ) {
      try {
        await createMaintenanceLog({
          payload: {
            assetId: asset.AssetId,
            maintenanceType: returnCondition.ConditionName,
            description:
              payload?.notes ||
              `Asset returned with condition: ${returnCondition.ConditionName}.`,
          },
          user: currentUser,
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
  } catch (assignmentError) {
    if (assignmentError.message !== "This asset has no active assignment to return.") {
      throw assignmentError;
    }

    try {
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
    } catch (borrowError) {
      if (borrowError.message !== "This asset is not currently borrowed.") {
        throw borrowError;
      }

      const asset = await repository.getAssetById(assetId);

      const hasAssignmentInAsset =
        asset.CurrentAssignedUserId ||
        asset.CurrentAssignedName ||
        asset.CurrentAssignedEmployeeCode ||
        asset.CurrentAssignedEmail ||
        asset.CurrentRoomId ||
        asset.CurrentDepartmentId ||
        asset.CurrentLocationId;

      if (!hasAssignmentInAsset) {
        throw borrowError;
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
        requiredPartKeys: payload.requiredPartKeys || [],
      });

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

      const result = await repository.returnAsset({
        asset,
        activeAssignment: null,
        returnedStatusId: targetStatus.ITAssetStatusId,
        changedByUserId: getCurrentUserId(currentUser),
        notes: payload?.notes || null,
        returnCondition,
        returnConditionId: payload?.returnConditionId || null,
        requiredParts,
        ipAddress,
      });

      if (
        targetStatus.StatusKey === "UnderRepair" ||
        targetStatus.StatusKey === "Under Repair"
      ) {
        try {
          await createMaintenanceLog({
            payload: {
              assetId: asset.AssetId,
              maintenanceType: returnCondition.ConditionName,
              description:
                payload?.notes ||
                `Asset returned with condition: ${returnCondition.ConditionName}.`,
            },
            user: currentUser,
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
    }
  }
};

module.exports = {
  assignAsset,
  returnAsset,
};
