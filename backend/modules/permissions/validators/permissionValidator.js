/* =========================================================
   Permission Validator
   Purpose:
   Validates Permission Manager request payloads before service logic.
========================================================= */

const validatePermissionPayload = (body = {}) => {
  const errors = [];

  if (!body.permissionKey || !String(body.permissionKey).trim()) {
    errors.push("Permission key is required.");
  }

  if (!body.permissionName || !String(body.permissionName).trim()) {
    errors.push("Permission name is required.");
  }

  if (!body.moduleId || Number.isNaN(Number(body.moduleId))) {
    errors.push("Module is required.");
  }

  if (
    body.permissionGroupId &&
    Number.isNaN(Number(body.permissionGroupId))
  ) {
    errors.push("Permission group is invalid.");
  }

  if (
    body.isActive !== undefined &&
    typeof body.isActive !== "boolean"
  ) {
    errors.push("Status must be true or false.");
  }

  return errors;
};

module.exports = {
  validatePermissionPayload,
};