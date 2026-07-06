/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Timeline Controller
========================================================= */

const service = require("../services/assetTimelineService");

const getTimeline = async (req, res) => {
  try {
    const data = await service.getTimeline(req.params.assetId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTimelineSection = (section) => async (req, res) => {
  try {
    const data = await service.getTimelineSection(req.params.assetId, section);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTimeline,
  getAssignments: getTimelineSection("assignments"),
  getBorrows: getTimelineSection("borrows"),
  getTransfers: getTimelineSection("transfers"),
  getMaintenance: getTimelineSection("maintenance"),
  getIssues: getTimelineSection("issues"),
  getNotes: getTimelineSection("notes"),
  getDisposals: getTimelineSection("disposals"),
  getStatus: getTimelineSection("status"),
};