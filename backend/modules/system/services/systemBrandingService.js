// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// System Branding Service
// ============================================
//
// Purpose:
// Handles business rules for organization,
// branding, and branding media uploads.
// ============================================

const systemBrandingRepository = require("../repositories/systemBrandingRepository");

const {
  validateOrganizationPayload,
  validateBrandingPayload,
  validateUploadedFile,
} = require("../validators/systemBrandingValidator");

const { mapBrandingResponse } = require("../helpers/brandingMapper");

// ============================================================
// GET SYSTEM BRANDING
// ============================================================

const getSystemBranding = async () => {
  const branding = await systemBrandingRepository.getActiveSchoolBranding();

  if (!branding) {
    const error = new Error("No active school profile found.");
    error.statusCode = 404;
    throw error;
  }

  return mapBrandingResponse(branding);
};

// ============================================================
// UPDATE SYSTEM BRANDING
// ============================================================

const updateSystemBranding = async (payload, userId) => {
  const current = await systemBrandingRepository.getActiveSchoolBranding();

  if (!current) {
    const error = new Error("No active school profile found.");
    error.statusCode = 404;
    throw error;
  }

  validateOrganizationPayload(payload.school || {});
  validateBrandingPayload(payload.branding || {});

  await systemBrandingRepository.updateSchoolProfile(
    current.SchoolId,
    payload.school
  );

  await systemBrandingRepository.upsertBranding(
    current.SchoolId,
    payload.branding || {},
    userId
  );

  return getSystemBranding();
};

// ============================================================
// UPLOAD BRANDING FILE
// ============================================================

const uploadBrandingFile = async ({ file, fileType, userId }) => {
  validateUploadedFile(file);

  const current = await systemBrandingRepository.getActiveSchoolBranding();

  if (!current) {
    const error = new Error("No active school profile found.");
    error.statusCode = 404;
    throw error;
  }

  const fileColumnMap = {
    logo: "LogoFileId",
    smallLogo: "SmallLogoFileId",
    darkLogo: "DarkLogoFileId",
    favicon: "FaviconFileId",
    loginBackground: "LoginBackgroundFileId",
  };

  const columnName = fileColumnMap[fileType];

  if (!columnName) {
    const error = new Error("Invalid branding file type.");
    error.statusCode = 400;
    throw error;
  }

  const fileId = await systemBrandingRepository.insertFileStorage({
    file,
    entityType: "Branding",
    entityId: current.BrandingId || null,
    uploadedBy: userId,
  });

  await systemBrandingRepository.updateBrandingFile(
    current.SchoolId,
    columnName,
    fileId,
    userId
  );

  return getSystemBranding();
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getSystemBranding,
  updateSystemBranding,
  uploadBrandingFile,
};