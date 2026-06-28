// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// System Branding Controller
// ============================================
//
// Purpose:
// Handles HTTP requests for organization,
// branding, and branding media.
// ============================================

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");

const systemBrandingService = require("../services/systemBrandingService");

// ============================================================
// GET /api/system/branding
// ============================================================

const getSystemBranding = asyncHandler(async (req, res) => {
  const data = await systemBrandingService.getSystemBranding();

  return sendSuccess(res, "System branding loaded successfully.", data);
});

// ============================================================
// PUT /api/system/branding
// ============================================================

const updateSystemBranding = asyncHandler(async (req, res) => {
  const data = await systemBrandingService.updateSystemBranding(
    req.body,
    req.user?.id || req.user?.UserId
  );

  return sendSuccess(res, "System branding updated successfully.", data);
});

// ============================================================
// POST /api/system/branding/:fileType
// ============================================================

const uploadBrandingFile = asyncHandler(async (req, res) => {
  const data = await systemBrandingService.uploadBrandingFile({
    file: req.file,
    fileType: req.params.fileType,
    userId: req.user?.id || req.user?.UserId,
  });

  return sendSuccess(res, "Branding file uploaded successfully.", data);
});

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getSystemBranding,
  updateSystemBranding,
  uploadBrandingFile,
};