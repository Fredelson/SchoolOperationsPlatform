const serviceError = require("../../../shared/helpers/serviceError");

function validate(payload) {
  const accessLevelKey = String(payload.accessLevelKey || "").trim();
  const accessLevelName = String(payload.accessLevelName || "").trim();
  const displayName = String(payload.displayName || "").trim();
  if (!accessLevelKey || !/^[A-Za-z0-9_-]+$/.test(accessLevelKey)) throw serviceError.badRequest("A valid access level key is required.");
  if (!accessLevelName || !displayName) throw serviceError.badRequest("Access level name and display name are required.");
  return { accessLevelKey, accessLevelName, displayName, description: String(payload.description || "").trim() || null,
    sortOrder: Number(payload.sortOrder) || 0, isActive: payload.isActive !== false };
}
module.exports = { validate };
