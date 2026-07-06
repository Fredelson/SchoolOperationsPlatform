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

module.exports = {
  createMaintenanceLog,
  getMaintenanceLogs,
  getMaintenanceDue,
};