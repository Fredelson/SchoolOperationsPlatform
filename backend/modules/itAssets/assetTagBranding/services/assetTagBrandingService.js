const repository = require("../repositories/assetTagBrandingRepository");

const TEMPLATE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const requireRoundedType = (type) => {
  const normalizedType = repository.normalizeType(type);

  if (normalizedType !== "rounded") {
    throw createError("Artwork templates are only available for rounded asset tags.");
  }

  return normalizedType;
};

const getBranding = (type) => repository.getAssetTagBranding(type);

const saveBranding = ({ type, settings, userId }) => {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    throw createError("Asset tag branding settings are required.");
  }

  return repository.saveAssetTagBranding({ type, settings, userId });
};

const uploadTemplate = async ({ type, file, userId }) => {
  const normalizedType = requireRoundedType(type);

  if (!file) {
    throw createError("Choose a PNG, JPG, or WEBP template before uploading.");
  }

  if (!TEMPLATE_MIME_TYPES.has(file.mimetype)) {
    throw createError("Rounded tag templates must be PNG, JPG, or WEBP images.");
  }

  const current = await repository.getAssetTagBranding(normalizedType);
  const prepared = await repository.saveAssetTagBranding({
    type: normalizedType,
    settings: current.settings,
    userId,
  });
  const fileId = await repository.insertTemplateFile({
    file,
    assetTagBrandingId: prepared.brandingId,
    userId,
  });

  if (!fileId) {
    throw createError("The template was uploaded but could not be recorded.", 500);
  }

  return repository.saveAssetTagBranding({
    type: normalizedType,
    settings: {
      ...prepared.settings,
      template: {
        fileId,
        fileName: file.originalname,
        filePath: `/${String(file.path || "").replaceAll("\\", "/").replace(/^\/+/, "")}`,
        mimeType: file.mimetype,
      },
    },
    userId,
  });
};

const removeTemplate = async ({ type, userId }) => {
  const normalizedType = requireRoundedType(type);
  const current = await repository.getAssetTagBranding(normalizedType);

  return repository.saveAssetTagBranding({
    type: normalizedType,
    settings: {
      ...current.settings,
      template: null,
    },
    userId,
  });
};

module.exports = {
  getBranding,
  removeTemplate,
  saveBranding,
  uploadTemplate,
};
