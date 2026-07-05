/* =========================================================
   IT Asset Service Facade
========================================================= */

const assetQueryService = require("./assetQueryService");
const assetCommandService = require("./assetCommandService");

module.exports = {
  getAssets: assetQueryService.getAssets,
  getAssetById: assetQueryService.getAssetById,
  createAsset: assetCommandService.createAsset,
  updateAsset: assetCommandService.updateAsset,
  softDeleteAsset: assetCommandService.softDeleteAsset,
};