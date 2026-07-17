/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Transfer Service
========================================================= */

const repository = require("../repositories/assetTransferRepository");

/**
 * Safely resolves the authenticated user ID.
 * Supports different auth middleware payload formats.
 */
const userId = (user) =>
  user?.id ||
  user?.userId ||
  user?.UserId ||
  user?.UserID ||
  null;

const getAssignedStatusIdForTarget = async ({ userId: targetUserId, roomId }) => {
  if (!targetUserId && !roomId) return null;

  const assignedStatus = await repository.getStatusByKey("Assigned");
  if (!assignedStatus) {
    throw Object.assign(new Error("Assigned status is missing."), { statusCode: 400 });
  }

  return assignedStatus.ITAssetStatusId;
};

const transferAsset = async ({ payload, user, ipAddress }) => {
  const asset = await repository.getAssetById(payload.assetId);
  if (!asset) {
    throw Object.assign(new Error("IT asset not found."), { statusCode: 404 });
  }

  const currentStatus = String(asset.StatusKey || asset.StatusName || "")
    .replace(/[\s_-]/g, "")
    .toUpperCase();

  if (["UNDERREPAIR", "UNDERMAINTENANCE", "MAINTENANCE"].includes(currentStatus)) {
    throw Object.assign(
      new Error("This asset is under repair and cannot be transferred."),
      { statusCode: 400 }
    );
  }

  const actionByUserId = userId(user);
  if (!actionByUserId) {
    throw Object.assign(new Error("Authenticated user is required."), { statusCode: 401 });
  }

  const unchanged =
    Number(payload.toUserId || 0) === Number(asset.CurrentAssignedUserId || 0) &&
    Number(payload.toRoomId || 0) === Number(asset.CurrentRoomId || 0) &&
    Number(payload.toDepartmentId || 0) === Number(asset.CurrentDepartmentId || 0) &&
    Number(payload.toLocationId || 0) === Number(asset.CurrentLocationId || 0);

  if (unchanged) {
    throw Object.assign(new Error("Choose a different user, room, department, or location."), {
      statusCode: 400,
    });
  }

  const assignedStatusId = await getAssignedStatusIdForTarget({
    userId: payload.toUserId,
    roomId: payload.toRoomId,
  });

  return repository.transferAsset({
    asset,
    payload,
    actionByUserId,
    assignedStatusId,
    ipAddress,
  });
};

const createTransferRequest = async ({ payload, user }) => {
  const asset = await repository.getAssetById(payload.assetId);

  if (!asset) {
    throw Object.assign(new Error("IT asset not found."), {
      statusCode: 404,
    });
  }

  const requestedBy = userId(user) || payload.requestedBy;

  if (!requestedBy) {
    throw Object.assign(new Error("Requested by user is required."), {
      statusCode: 400,
    });
  }

  return repository.createTransferRequest({
    payload: {
      ...payload,
      fromUserId: payload.fromUserId ?? asset.CurrentAssignedUserId,
      fromRoomId: payload.fromRoomId ?? asset.CurrentRoomId,
      fromDepartmentId: payload.fromDepartmentId ?? asset.CurrentDepartmentId,
      fromLocationId: payload.fromLocationId ?? asset.CurrentLocationId,
    },
    requestedBy,
  });
};

const approveTransfer = async ({ payload, user }) => {
  const approvedBy = userId(user) || payload.approvedBy;

  if (!approvedBy) {
    throw Object.assign(new Error("Approved by user is required."), {
      statusCode: 400,
    });
  }

  const transfer = await repository.approveTransfer({
    transferRequestId: payload.transferRequestId,
    approvedBy,
  });

  if (!transfer) {
    throw Object.assign(new Error("Transfer request not found or not pending."), {
      statusCode: 404,
    });
  }

  return transfer;
};

const rejectTransfer = async ({ payload }) => {
  const transfer = await repository.rejectTransfer({
    transferRequestId: payload.transferRequestId,
  });

  if (!transfer) {
    throw Object.assign(new Error("Transfer request not found or not pending."), {
      statusCode: 404,
    });
  }

  return transfer;
};

const completeTransfer = async ({ payload, user, ipAddress }) => {
  const transfer = await repository.getTransferById(payload.transferRequestId);

  if (!transfer) {
    throw Object.assign(new Error("Transfer request not found."), {
      statusCode: 404,
    });
  }

  if (transfer.TransferStatus !== "APPROVED") {
    throw Object.assign(
      new Error("Transfer request must be approved before completion."),
      { statusCode: 400 }
    );
  }

  const asset = await repository.getAssetById(transfer.AssetId);

  if (!asset) {
    throw Object.assign(new Error("IT asset not found."), {
      statusCode: 404,
    });
  }

  const assignedStatusId = await getAssignedStatusIdForTarget({
    userId: transfer.ToUserId,
    roomId: transfer.ToRoomId,
  });

  return repository.completeTransfer({
    transfer,
    asset,
    actionByUserId: userId(user) || payload.completedBy || payload.approvedBy || null,
    assignedStatusId,
    ipAddress,
  });
};

module.exports = {
  transferAsset,
  createTransferRequest,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
  getTransfers: repository.getTransfers,
  getTransfersByAssetId: repository.getTransfersByAssetId,
};
