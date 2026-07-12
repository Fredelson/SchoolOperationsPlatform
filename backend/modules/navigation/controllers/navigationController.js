// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Navigation Controller
// ============================================

const navigationService = require("../services/navigationService");

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");

const getMySidebar = asyncHandler(async (req, res) => {
  const sidebar = await navigationService.getMySidebar(req.user);

  return sendSuccess(
    res,
    "Sidebar retrieved successfully.",
    sidebar
  );
});
const getMyRuntimeControls=asyncHandler(async(req,res)=>sendSuccess(res,"Runtime controls retrieved successfully.",await navigationService.getMyRuntimeControls(req.user)));

module.exports = {
  getMySidebar,
  getMyRuntimeControls,
};
