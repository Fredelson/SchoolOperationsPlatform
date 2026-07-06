/* =========================================================
   IT Asset Assignment History Controller
========================================================= */

const service = require("../services/assetAssignmentHistoryService");

const getAssignmentHistory = async (req, res) => {
  try {
    const result = await service.getAssignmentHistory({
      assetId: req.query.assetId || req.params.assetId || null,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveAssignments = async (req, res) => {
  try {
    const result = await service.getActiveAssignments({
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getStatusHistory = async (req, res) => {
  try {
    const result = await service.getStatusHistory({
      assetId: req.query.assetId || req.params.assetId || null,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAssignmentHistory,
  getActiveAssignments,
  getStatusHistory,
};