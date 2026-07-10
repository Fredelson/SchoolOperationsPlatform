/* =========================================================
   IT Asset Audit Query Service
========================================================= */

const repository = require("../repositories/assetAuditRepository");

const getAuditByAssetId = async (assetId) => {
  if (!assetId) {
    throw Object.assign(new Error("Asset ID is required."), {
      statusCode: 400,
    });
  }

  return repository.getAuditByAssetId(assetId);
};

module.exports = {
  getAuditByAssetId,
};