// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Asset Tag Branding Controller
// ============================================================

const asyncHandler = require("../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../shared/helpers/apiResponse");

const assetTagBrandingService = require("./service");

const getAssetTagBranding = asyncHandler(async (req, res) => {
  const data = await assetTagBrandingService.getAssetTagBranding(
    req.params.type
  );

  return sendSuccess(res, "Asset tag branding loaded successfully.", data);
});

const updateAssetTagBranding = asyncHandler(async (req, res) => {
  const data = await assetTagBrandingService.saveAssetTagBranding(
    req.params.type,
    req.body,
    req.user,
    req.ip
  );

  return sendSuccess(res, "Asset tag branding saved successfully.", data);
});

module.exports = {
  getAssetTagBranding,
  updateAssetTagBranding,
};
