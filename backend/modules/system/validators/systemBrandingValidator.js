// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// System Branding Validator
// ============================================
//
// Purpose:
// Validates school profile, branding colors,
// and branding file uploads.
// ============================================

// ============================================================
// COLOR VALIDATION
// ============================================================

const validateHexColor = (value, fieldName) => {
  if (!value) return;

  const isValid = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);

  if (!isValid) {
    const error = new Error(`${fieldName} must be a valid hex color.`);
    error.statusCode = 400;
    throw error;
  }
};

// ============================================================
// SCHOOL PROFILE VALIDATION
// ============================================================

const validateOrganizationPayload = (payload) => {
  if (!payload.schoolName || !payload.schoolName.trim()) {
    const error = new Error("School name is required.");
    error.statusCode = 400;
    throw error;
  }

  if (payload.email && !/^\S+@\S+\.\S+$/.test(payload.email)) {
    const error = new Error("School email is invalid.");
    error.statusCode = 400;
    throw error;
  }
};

// ============================================================
// BRANDING VALIDATION
// ============================================================

const validateBrandingPayload = (payload = {}) => {
  validateHexColor(payload.primaryColor, "Primary color");
  validateHexColor(payload.secondaryColor, "Secondary color");
  validateHexColor(payload.accentColor, "Accent color");
  validateHexColor(payload.sidebarColor, "Sidebar color");
  validateHexColor(payload.topbarColor, "Topbar color");
  validateHexColor(payload.loginCardColor, "Login card color");

  if (payload.supportEmail && !/^\S+@\S+\.\S+$/.test(payload.supportEmail)) {
    const error = new Error("Support email is invalid.");
    error.statusCode = 400;
    throw error;
  }
};

// ============================================================
// FILE UPLOAD VALIDATION
// ============================================================

const validateUploadedFile = (file) => {
  if (!file) {
    const error = new Error("File upload is required.");
    error.statusCode = 400;
    throw error;
  }

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/x-icon",
    "image/vnd.microsoft.icon",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Only PNG, JPG, WEBP, and ICO files are allowed.");
    error.statusCode = 400;
    throw error;
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  validateOrganizationPayload,
  validateBrandingPayload,
  validateUploadedFile,
};