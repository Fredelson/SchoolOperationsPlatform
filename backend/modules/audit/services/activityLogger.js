/* =========================================================
   Enterprise Activity Logger
   Shared audit/activity logging service for the whole platform.

   Used by:
   - IT Assets
   - Users
   - Permissions
   - Printing
   - Inventory
   - Navigation
   - Future modules
========================================================= */

const auditRepository = require("../repositories/auditRepository");

/**
 * Safely extracts user information from req.user.
 */
const getUserId = (user) => {
  return user?.UserId || user?.userId || user?.id || null;
};

/**
 * Central enterprise logger.
 * Writes to both:
 * 1. AuditLogs        → technical old/new value audit
 * 2. ActivityTimeline → user-friendly timeline
 */
const log = async ({
  moduleKey,
  actionType,
  entityType,
  entityId,
  title,
  description,
  oldValue = null,
  newValue = null,
  user = null,
  ipAddress = null,
}) => {
  try {
    const userId = getUserId(user);

    await auditRepository.createAuditLog({
      userId,
      actionType,
      entityType,
      entityId,
      description: description || title,
      oldValue,
      newValue,
      ipAddress,
    });

    await auditRepository.createActivityTimeline({
      userId,
      moduleKey,
      entityType,
      entityId,
      activityType: actionType,
      activityTitle: title,
      activityDescription: description || title,
    });

    return true;
  } catch (error) {
    console.error("Enterprise Activity Logger Error:", error);

    // Important:
    // Logging failure should not crash the main business operation.
    return false;
  }
};

module.exports = {
  log,
};