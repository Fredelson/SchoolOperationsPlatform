/* =========================================================
   IT Asset Assignment Controller
========================================================= */

const service = require("../services/assetAssignmentService");

const getAssignmentHistory = async (req, res) => {
  try {
    const data = await service.getAssignmentHistory(req.params.assetId);

    return res.status(200).json({
      success: true,
      message: "Asset assignment history loaded successfully.",
      data,
    });
  } catch (error) {
    console.error("Get Assignment History Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load assignment history.",
    });
  }
};

const assignAsset = async (req, res) => {
  try {
    const result = await service.assignAsset(req.body, req.user, req.ip);

    return res.status(201).json({
      success: true,
      message: "Asset assigned successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Assign Asset Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to assign asset.",
    });
  }
};

const returnAsset = async (req, res) => {
  try {
    const result = await service.returnAsset(
      req.params.assetId,
      req.body,
      req.user,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "Asset returned successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Return Asset Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to return asset.",
    });
  }
};

module.exports = {
  getAssignmentHistory,
  assignAsset,
  returnAsset,
};