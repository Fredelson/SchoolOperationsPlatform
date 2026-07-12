// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Asset Tag Branding Validators
// ============================================================

const {
  ASSET_TAG_BRANDING_TYPES,
  ASSET_TAG_BRANDING_DEFAULTS,
} = require("./constants");

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateBrandingType(type) {
  if (!ASSET_TAG_BRANDING_TYPES.includes(type)) {
    throw badRequest("Invalid asset tag branding type.");
  }
}

function validateHexColor(value, label) {
  if (!HEX_COLOR_PATTERN.test(String(value || ""))) {
    throw badRequest(`${label} must be a six-digit HEX color.`);
  }
}

function validateRequiredText(value, label) {
  if (!String(value || "").trim()) {
    throw badRequest(`${label} is required.`);
  }
}

function validateEstablishedYear(value) {
  const year = String(value || "").trim();

  if (!/^\d{4}$/.test(year)) {
    throw badRequest("Established year must contain four digits.");
  }

  const numericYear = Number(year);

  if (numericYear < 1800 || numericYear > 2200) {
    throw badRequest("Established year must be a reasonable four-digit year.");
  }
}

function validateOptionalUrl(value, label) {
  if (!value) return;

  if (!URL_PATTERN.test(String(value).trim())) {
    throw badRequest(`${label} must be a valid http or https URL.`);
  }
}

function validateBoolean(value, label) {
  if (typeof value !== "boolean") {
    throw badRequest(`${label} must be Boolean.`);
  }
}

function validateNumber(value, label, { min = 0, max = 1000 } = {}) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < min || number > max) {
    throw badRequest(`${label} must be between ${min} and ${max}.`);
  }
}

function validateObjectKeys(payload = {}, defaults = {}, groupLabel) {
  Object.keys(payload || {}).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(defaults, key)) {
      throw badRequest(`${groupLabel} contains an unsupported field: ${key}.`);
    }
  });
}

function validateRoundedSettings(data) {
  validateRequiredText(data.schoolTagline, "School tagline");
  validateRequiredText(data.departmentLabel, "Department label");
  validateRequiredText(data.propertyLabel, "Property label");
  validateRequiredText(data.websiteQrInstruction, "Website QR instruction");
  validateRequiredText(data.assetQrInstruction, "Asset QR instruction");
  validateEstablishedYear(data.establishedYear);

  validateObjectKeys(
    data.colors,
    ASSET_TAG_BRANDING_DEFAULTS.rounded.colors,
    "Rounded label colors"
  );

  Object.entries(data.colors || {}).forEach(([key, value]) => {
    validateHexColor(value, key);
  });

  validateObjectKeys(
    data.visibility,
    ASSET_TAG_BRANDING_DEFAULTS.rounded.visibility,
    "Rounded label visibility"
  );

  Object.entries(data.visibility || {}).forEach(([key, value]) => {
    validateBoolean(value, key);
  });

  validateObjectKeys(
    data.print,
    ASSET_TAG_BRANDING_DEFAULTS.rounded.print,
    "Rounded print settings"
  );

  if (data.print.pageSize !== "A4") {
    throw badRequest("Rounded print page size must be A4.");
  }

  if (!["portrait"].includes(data.print.orientation)) {
    throw badRequest("Rounded full-A4 printing currently supports portrait orientation.");
  }

  validateNumber(data.print.labelDiameter, "Label diameter", { min: 40, max: 205 });
  validateNumber(data.print.marginTop, "Top margin", { min: 0, max: 80 });
  validateNumber(data.print.marginBottom, "Bottom margin", { min: 0, max: 80 });
  validateNumber(data.print.marginLeft, "Left margin", { min: 0, max: 80 });
  validateNumber(data.print.marginRight, "Right margin", { min: 0, max: 80 });
  validateNumber(data.print.horizontalOffset, "Horizontal offset", { min: -50, max: 50 });
  validateNumber(data.print.verticalOffset, "Vertical offset", { min: -50, max: 50 });
  validateNumber(data.print.printScale, "Print scale", { min: 0.5, max: 1.5 });
}

function validateRectangularSettings(data) {
  validateRequiredText(data.contentLabel, "Rectangular content label");
  validateRequiredText(data.propertyLabel, "Rectangular property label");

  validateObjectKeys(
    data.colors,
    ASSET_TAG_BRANDING_DEFAULTS.rectangular.colors,
    "Rectangular label colors"
  );

  Object.entries(data.colors || {}).forEach(([key, value]) => {
    validateHexColor(value, key);
  });

  validateObjectKeys(
    data.visibility,
    ASSET_TAG_BRANDING_DEFAULTS.rectangular.visibility,
    "Rectangular label visibility"
  );

  Object.entries(data.visibility || {}).forEach(([key, value]) => {
    validateBoolean(value, key);
  });

  validateObjectKeys(
    data.print,
    ASSET_TAG_BRANDING_DEFAULTS.rectangular.print,
    "Rectangular print settings"
  );

  if (data.print.pageSize !== "A4") {
    throw badRequest("Rectangular print page size must be A4.");
  }

  validateNumber(data.print.printScale, "Print scale", { min: 0.5, max: 1.5 });
}

function validateAssetTagBrandingPayload(type, data = {}) {
  validateBrandingType(type);

  if (!isPlainObject(data)) {
    throw badRequest("Asset tag branding payload must be an object.");
  }

  if (type === "rounded") {
    validateRoundedSettings(data);
    return;
  }

  validateRectangularSettings(data);
}

module.exports = {
  validateBrandingType,
  validateAssetTagBrandingPayload,
  validateOptionalUrl,
};
