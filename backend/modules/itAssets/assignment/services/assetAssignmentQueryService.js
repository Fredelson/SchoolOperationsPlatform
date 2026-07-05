/* =========================================================
   IT Asset Assignment Query Service
========================================================= */

const repository = require("../repositories/assetAssignmentRepository");

const getAssignmentHistory = async (assetId) => {
  const asset = await repository.getAssetById(assetId);

  if (!asset) {
    const error = new Error("IT asset not found.");
    error.statusCode = 404;
    throw error;
  }

  return await repository.getAssignmentHistory(assetId);
};

module.exports = {
  getAssignmentHistory,
};