// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Validator
// ============================================

function normalizeButtonPayload(payload = {}) {
  return {
    moduleId: payload.moduleId ?? payload.ModuleId,
    buttonKey: payload.buttonKey ?? payload.ButtonKey,
    buttonName: payload.buttonName ?? payload.ButtonName,
    permissionId: payload.permissionId ?? payload.PermissionId ?? null,
    featureFlagId: payload.featureFlagId ?? payload.FeatureFlagId ?? null,
    visibilityStatusId:
      payload.visibilityStatusId ?? payload.VisibilityStatusId ?? 1,
  };
}

function validateButtonPayload(payload = {}, options = {}) {
  const errors = [];
  const normalized = normalizeButtonPayload(payload);
  const isUpdate = options.isUpdate === true;

  if (!isUpdate || normalized.moduleId !== undefined) {
    if (!normalized.moduleId || Number.isNaN(Number(normalized.moduleId))) {
      errors.push("Module is required.");
    }
  }

  if (!isUpdate || normalized.buttonKey !== undefined) {
    if (!normalized.buttonKey || String(normalized.buttonKey).trim() === "") {
      errors.push("Button key is required.");
    } else if (String(normalized.buttonKey).length > 100) {
      errors.push("Button key must not exceed 100 characters.");
    }
  }

  if (!isUpdate || normalized.buttonName !== undefined) {
    if (!normalized.buttonName || String(normalized.buttonName).trim() === "") {
      errors.push("Button name is required.");
    } else if (String(normalized.buttonName).length > 150) {
      errors.push("Button name must not exceed 150 characters.");
    }
  }

  if (
    normalized.permissionId !== null &&
    normalized.permissionId !== undefined &&
    Number.isNaN(Number(normalized.permissionId))
  ) {
    errors.push("Permission must be a valid number.");
  }

  if (
    normalized.featureFlagId !== null &&
    normalized.featureFlagId !== undefined &&
    Number.isNaN(Number(normalized.featureFlagId))
  ) {
    errors.push("Feature flag must be a valid number.");
  }

  if (
    !normalized.visibilityStatusId ||
    Number.isNaN(Number(normalized.visibilityStatusId))
  ) {
    errors.push("Visibility status is required.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      moduleId: Number(normalized.moduleId),
      buttonKey: normalized.buttonKey
        ? String(normalized.buttonKey).trim()
        : undefined,
      buttonName: normalized.buttonName
        ? String(normalized.buttonName).trim()
        : undefined,
      permissionId:
        normalized.permissionId === null ||
        normalized.permissionId === undefined ||
        normalized.permissionId === ""
          ? null
          : Number(normalized.permissionId),
      featureFlagId:
        normalized.featureFlagId === null ||
        normalized.featureFlagId === undefined ||
        normalized.featureFlagId === ""
          ? null
          : Number(normalized.featureFlagId),
      visibilityStatusId: Number(normalized.visibilityStatusId),
    },
  };
}

module.exports = {
  normalizeButtonPayload,
  validateButtonPayload,
};