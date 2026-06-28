// backend/modules/roles/validators/roleValidator.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Role Validator
 * ============================================================
 *
 * Purpose:
 * Validates incoming Role payloads before the Service layer
 * performs business validation and database checks.
 *
 * Rules:
 * - No SQL
 * - No business logic
 * - Normalize incoming data
 * - Throw BadRequestError for invalid payloads
 * ============================================================
 */

const { BadRequestError } = require("../../../shared/errors");

/**
 * ------------------------------------------------------------
 * Converts empty strings to null.
 * Removes leading and trailing spaces.
 * ------------------------------------------------------------
 */
function normalizeNullableString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text === "" ? null : text;
}

/**
 * ------------------------------------------------------------
 * Converts nullable numeric values.
 * ------------------------------------------------------------
 */
function normalizeNullableNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

/**
 * ------------------------------------------------------------
 * Converts any truthy/falsy value into a Boolean.
 * ------------------------------------------------------------
 */
function normalizeBoolean(value) {
  return Boolean(value);
}

/**
 * ------------------------------------------------------------
 * Normalizes a Role Key.
 *
 * Example:
 *
 * Platform Admin
 *      ↓
 * PLATFORM_ADMIN
 *
 * This keeps RoleKey consistent throughout the platform.
 * ------------------------------------------------------------
 */
function normalizeRoleKey(value) {
  const text = normalizeNullableString(value);

  if (!text) {
    return null;
  }

  return text
    .toUpperCase()
    .replace(/\s+/g, "_");
}

/**
 * ------------------------------------------------------------
 * Validates Role payload.
 *
 * Required:
 * - roleKey
 * - roleName
 * - displayName
 * - accessLevelId
 *
 * Optional:
 * - description
 * - isSystemRole
 * - isProtected
 * ------------------------------------------------------------
 */
function validateRolePayload(payload = {}) {
  const roleKey = normalizeRoleKey(payload.roleKey);
  const roleName = normalizeNullableString(payload.roleName);
  const displayName = normalizeNullableString(payload.displayName);
  const accessLevelId = normalizeNullableNumber(payload.accessLevelId);

  if (!roleKey) {
    throw new BadRequestError("Role key is required.");
  }

  if (!roleName) {
    throw new BadRequestError("Role name is required.");
  }

  if (!displayName) {
    throw new BadRequestError("Display name is required.");
  }

  if (!accessLevelId) {
    throw new BadRequestError("Access level is required.");
  }

  return {
    roleKey,
    roleName,
    displayName,
    accessLevelId,
    description: normalizeNullableString(payload.description),
    isSystemRole: normalizeBoolean(payload.isSystemRole),
    isProtected: normalizeBoolean(payload.isProtected),
  };
}

/**
 * ============================================================
 * Exports
 * ============================================================
 */

module.exports = {
  validateRolePayload,
};