/* =========================================================
   IT Asset Audit Controller
========================================================= */

const service = require("../services/assetAuditQueryService");

const getAuditByAssetId = async (req, res) => {
  try {
    const data = await service.getAuditByAssetId(req.params.assetId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load asset audit history.",
    });
  }
};

module.exports = {
  getAuditByAssetId,
};