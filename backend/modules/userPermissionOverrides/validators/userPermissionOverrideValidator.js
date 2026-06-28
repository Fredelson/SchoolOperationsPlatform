// ============================================================
// Arab Unity School Operations Platform
// User Permission Override Validator
// ============================================================
//
// Purpose:
// Validates incoming request payloads for user permission
// overrides before service-layer business rules run.
//
// Architecture:
// Validator Layer
//
// Rules:
// - No SQL
// - No HTTP handling
// - Returns validation error arrays
// ============================================================

const {
  required,
  isInteger,
  maxLength,
  collectErrors,
} = require("../../../shared/helpers/validationHelper");

// ============================================================
// Validate Create / Update Payload
// ============================================================

function validatePayload(payload) {
  const { userId, permissionId, isAllowed, reason } = payload;

  return collectErrors([
    required(userId, "User ID"),
    isInteger(userId, "User ID"),

    required(permissionId, "Permission ID"),
    isInteger(permissionId, "Permission ID"),

    isAllowed === undefined || isAllowed === null
      ? "IsAllowed is required."
      : null,

    typeof isAllowed !== "boolean" && isAllowed !== 0 && isAllowed !== 1
      ? "IsAllowed must be true, false, 1, or 0."
      : null,

    maxLength(reason, "Reason", 255),
  ]);
}

module.exports = {
  validatePayload,
};