// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Asset Tag Branding Service
// ============================================================

const repository = require("./repository");
const systemBrandingService = require("../system/services/systemBrandingService");
const activityLogger = require("../audit/services/activityLogger");

const {
  cloneDefaultSettings,
} = require("./constants");

const {
  validateBrandingType,
  validateAssetTagBrandingPayload,
} = require("./validators");

function getUserId(user) {
  return user?.UserId || user?.userId || user?.id || null;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, override) {
  const merged = { ...base };

  Object.entries(override || {}).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(base[key])) {
      merged[key] = deepMerge(base[key], value);
      return;
    }

    merged[key] = value;
  });

  return merged;
}

function normalizeColors(settings) {
  if (!settings.colors) return settings;

  return {
    ...settings,
    colors: Object.fromEntries(
      Object.entries(settings.colors).map(([key, value]) => [
        key,
        String(value || "").trim().toUpperCase(),
      ])
    ),
  };
}

function normalizeNumericPrintSettings(settings) {
  if (!settings.print) return settings;

  const next = {
    ...settings,
    print: { ...settings.print },
  };

  [
    "labelDiameter",
    "marginTop",
    "marginBottom",
    "marginLeft",
    "marginRight",
    "horizontalOffset",
    "verticalOffset",
    "printScale",
    "rows",
    "columns",
    "gapHorizontal",
    "gapVertical",
  ].forEach((key) => {
    if (next.print[key] !== undefined && next.print[key] !== null && next.print[key] !== "") {
      next.print[key] = Number(next.print[key]);
    }
  });

  return next;
}

function parseStoredSettings(row, type) {
  if (!row?.SettingsJson) {
    return cloneDefaultSettings(type);
  }

  try {
    return JSON.parse(row.SettingsJson);
  } catch (error) {
    console.error("Invalid stored asset tag branding JSON:", error);
    return cloneDefaultSettings(type);
  }
}

function buildSettings(type, payload = {}) {
  const defaults = cloneDefaultSettings(type);
  const merged = normalizeNumericPrintSettings(
    normalizeColors(deepMerge(defaults, payload))
  );

  validateAssetTagBrandingPayload(type, merged);

  return merged;
}

async function getAssetTagBranding(type) {
  validateBrandingType(type);

  const [row, organization] = await Promise.all([
    repository.getByType(type),
    systemBrandingService.getSystemBranding(),
  ]);

  const stored = parseStoredSettings(row, type);
  const settings = buildSettings(type, stored);

  return {
    type,
    settings,
    defaults: cloneDefaultSettings(type),
    organization,
    metadata: row
      ? {
          assetTagBrandingId: row.AssetTagBrandingId,
          createdAt: row.CreatedAt,
          updatedAt: row.UpdatedAt,
          createdBy: row.CreatedBy,
          updatedBy: row.UpdatedBy,
        }
      : null,
  };
}

async function saveAssetTagBranding(type, payload, user, ipAddress) {
  validateBrandingType(type);

  const existing = await repository.getByType(type);
  const oldSettings = buildSettings(type, parseStoredSettings(existing, type));
  const settings = buildSettings(type, payload);

  const row = await repository.upsert(
    type,
    JSON.stringify(settings),
    getUserId(user)
  );

  await activityLogger.log({
    moduleKey: "IT_ASSETS",
    actionType: "ASSET_TAG_BRANDING_UPDATED",
    entityType: "AssetTagBranding",
    entityId: row?.AssetTagBrandingId || type,
    title: "Asset Tag Branding Updated",
    description: `${type} asset tag branding settings were updated.`,
    oldValue: oldSettings,
    newValue: settings,
    user,
    ipAddress,
  });

  return getAssetTagBranding(type);
}

module.exports = {
  getAssetTagBranding,
  saveAssetTagBranding,
};
