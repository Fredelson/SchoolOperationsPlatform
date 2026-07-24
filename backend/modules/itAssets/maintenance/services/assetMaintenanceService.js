/* =========================================================
   IT Asset Maintenance Service
========================================================= */

const repository = require("../repositories/assetMaintenanceRepository");

const userId = (user) => user?.id || user?.UserId || null;

const requestDisposal = async ({ assetId, user, reason }) => {
  const disposalService = require("../../disposal/services/assetDisposalService");
  return disposalService.requestDisposal({
    payload: { assetId, reason },
    user,
  });
};

const createMaintenanceLog = async ({ payload, user, ipAddress }) => {
  const asset = await repository.getAssetById(payload.assetId);

  if (!asset) {
    throw Object.assign(new Error("IT asset not found."), { statusCode: 404 });
  }

  const maintenanceStatus =
    (await repository.getStatusByKey("UnderRepair")) ||
    (await repository.getStatusByKey("Under Repair"));

  if (!maintenanceStatus) {
    throw Object.assign(new Error("Under repair status is missing."), { statusCode: 400 });
  }

  return repository.createMaintenanceLog({
    asset,
    payload,
    maintenanceStatusId: maintenanceStatus.ITAssetStatusId,
    actionByUserId: userId(user),
    ipAddress,
  });
};

const getMaintenanceLogs = async ({ assetId = null }) => {
  return repository.getMaintenanceLogs({ assetId });
};

const getMaintenanceDue = async () => {
  return repository.getMaintenanceDue();
};

const completeMaintenance = async ({ maintenanceLogId, user }) => {
  const logId = Number(maintenanceLogId);
  const syntheticAssetId = Number.isInteger(logId) && logId < 0 ? Math.abs(logId) : null;
  const maintenance = syntheticAssetId
    ? { AssetId: syntheticAssetId, MaintenanceType: "Maintenance Review" }
    : await repository.getMaintenanceLogById(maintenanceLogId);

  if (!maintenance) throw Object.assign(new Error("Maintenance record not found."), { statusCode: 404 });

  const asset = await repository.getAssetById(maintenance.AssetId);
  if (!asset) {
    throw Object.assign(new Error("IT asset not found."), { statusCode: 404 });
  }

  const pendingParts = await repository.getPendingPartRequirementCount(asset.AssetId);
  if (pendingParts > 0) {
    throw Object.assign(
      new Error(`Cannot finish maintenance: ${pendingParts} part requirement(s) are still pending delivery.`),
      { statusCode: 400 }
    );
  }

  const hasActiveAssignment = Boolean(
    asset.CurrentAssignedUserId ||
    asset.CurrentAssignedName ||
    asset.CurrentAssignedEmployeeCode ||
    asset.CurrentAssignedEmail ||
    asset.CurrentRoomId ||
    asset.CurrentDepartmentId ||
    asset.CurrentLocationId
  );

  const targetStatusKey = hasActiveAssignment ? "Assigned" : "Available";
  const targetStatus = await repository.getStatusByKey(targetStatusKey);
  if (!targetStatus) {
    throw Object.assign(new Error(`${targetStatusKey} status is missing.`), { statusCode: 400 });
  }

  return repository.completeMaintenance({ maintenance, asset,
    targetStatusId: targetStatus.ITAssetStatusId, actionByUserId: userId(user) });
};

const reopenMaintenance = async ({ maintenanceLogId, user }) => {
  const logId = Number(maintenanceLogId);
  const syntheticAssetId = Number.isInteger(logId) && logId < 0 ? Math.abs(logId) : null;
  const maintenance = syntheticAssetId
    ? { AssetId: syntheticAssetId, MaintenanceType: "Maintenance Review" }
    : await repository.getMaintenanceLogById(maintenanceLogId);
  if (!maintenance) {
    throw Object.assign(new Error("Maintenance record not found."), { statusCode: 404 });
  }

  return repository.reopenMaintenance({
    assetId: maintenance.AssetId,
    actionByUserId: userId(user),
  });
};

const receiveMaintenanceParts = async ({ assetId, user }) => {
  return repository.receiveMaintenanceParts({
    assetId,
    actionByUserId: userId(user),
  });
};

module.exports = {
  createMaintenanceLog,
  getMaintenanceLogs,
  getMaintenanceDue,
  completeMaintenance,
  reopenMaintenance,
  receiveMaintenanceParts,
  requestDisposal,
};
