/* =========================================================
   IT Asset Assignment Service Facade
========================================================= */

const queryService = require("./assetAssignmentQueryService");
const commandService = require("./assetAssignmentCommandService");

module.exports = {
  getAssignmentHistory: queryService.getAssignmentHistory,
  assignAsset: commandService.assignAsset,
  returnAsset: commandService.returnAsset,
};