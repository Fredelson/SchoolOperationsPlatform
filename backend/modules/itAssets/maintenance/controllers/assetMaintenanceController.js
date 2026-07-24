/* =========================================================
   IT Asset Maintenance Controller
========================================================= */

const service = require("../services/assetMaintenanceService");

const createMaintenanceLog = async (req, res) => {
  try {
    const data = await service.createMaintenanceLog({
      payload: req.body,
      user: req.user,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: "Asset maintenance recorded successfully.",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMaintenanceLogs = async (req, res) => {
  try {
    const data = await service.getMaintenanceLogs({
      assetId: req.params.assetId || req.query.assetId || null,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMaintenanceDue = async (req, res) => {
  try {
    const data = await service.getMaintenanceDue();

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const completeMaintenance = async (req, res) => {
  try {
    const data = await service.completeMaintenance({
      maintenanceLogId: req.params.maintenanceLogId,
      user: req.user,
    });
    return res.status(200).json({ success: true, message: "Maintenance marked finished.", data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const reopenMaintenance = async (req, res) => {
  try {
    const data = await service.reopenMaintenance({
      maintenanceLogId: req.params.maintenanceLogId,
      user: req.user,
    });
    return res.status(200).json({ success: true, message: "Maintenance reopened.", data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const receiveMaintenanceParts = async (req, res) => {
  try {
    const data = await service.receiveMaintenanceParts({
      assetId: req.params.assetId,
      user: req.user,
    });
    return res.status(200).json({ success: true, message: "Parts marked as received.", data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMaintenanceLog,
  getMaintenanceLogs,
  getMaintenanceDue,
  completeMaintenance,
  reopenMaintenance,
  receiveMaintenanceParts,
};
