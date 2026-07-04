// ============================================================
// Arab Unity School Operations Platform
// Role Permission Validator
// ============================================================
//
// Purpose:
// Validates and normalizes Role Permission payloads.
//
// Rules:
// - No SQL
// - No HTTP handling
// - No business logic
// - Only payload validation and normalization
//
// ============================================================

const { BadRequestError } = require("../../../shared/errors");

/**
 * Converts incoming value to a positive number.
 */
function normalizeRequiredId(value, fieldName) {
  const parsed = Number(value);

  if (!parsed || Number.isNaN(parsed)) {
    throw new BadRequestError(`${fieldName} is required.`);
  }

  return parsed;
}

/**
 * Converts incoming value to boolean.
 * Default is true because role permissions normally grant access.
 */
function normalizeIsAllowed(value) {
  if (value === undefined || value === null) {
    return true;
  }

  return value === true || value === "true" || value === 1 || value === "1";
}

/**
 * Validates create/update payload.
 */
function validateRolePermissionPayload(payload = {}) {
  return {
    roleId: normalizeRequiredId(payload.roleId, "Role ID"),
    permissionId: normalizeRequiredId(payload.permissionId, "Permission ID"),
    isAllowed: normalizeIsAllowed(payload.isAllowed),
  };
}

module.exports = {
  validateRolePermissionPayload,
};