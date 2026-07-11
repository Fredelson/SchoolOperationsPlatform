/* =========================================================
   IT Asset Maintenance Service
========================================================= */

const repository = require("../repositories/assetMaintenanceRepository");

const userId = (user) => user?.id || user?.UserId || null;

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
  const maintenance = await repository.getMaintenanceLogById(maintenanceLogId);
  if (!maintenance) throw Object.assign(new Error("Maintenance record not found."), { statusCode: 404 });
  const asset = await repository.getAssetById(maintenance.AssetId);
  const status = String(asset?.StatusKey || asset?.StatusName || "").replace(/[\s_-]/g, "").toUpperCase();
  if (!asset || !["UNDERREPAIR", "UNDERMAINTENANCE", "MAINTENANCE"].includes(status)) {
    throw Object.assign(new Error("This maintenance is already finished."), { statusCode: 400 });
  }
  const availableStatus = await repository.getStatusByKey("Available");
  if (!availableStatus) throw Object.assign(new Error("Available status is missing."), { statusCode: 400 });
  return repository.completeMaintenance({ maintenance, asset,
    availableStatusId: availableStatus.ITAssetStatusId, actionByUserId: userId(user) });
};

module.exports = {
  createMaintenanceLog,
  getMaintenanceLogs,
  getMaintenanceDue,
  completeMaintenance,
};
