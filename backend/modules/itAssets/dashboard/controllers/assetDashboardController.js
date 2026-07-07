// backend/modules/itAssets/dashboard/controllers/assetDashboardController.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * IT Asset Dashboard Controller
 * ============================================================
 */

const asyncHandler = require("../../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../../shared/helpers/apiResponse");

const dashboardService = require("../services/assetDashboardService");

/**
 * GET /api/it-assets/dashboard
 */
const getDashboard = asyncHandler(async (req, res) => {
  const result = await dashboardService.getDashboard();

  return sendSuccess(
    res,
    "IT Asset dashboard loaded successfully.",
    result
  );
});

module.exports = {
  getDashboard,
};