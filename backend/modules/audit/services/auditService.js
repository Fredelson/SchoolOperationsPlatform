const auditRepository = require("../repositories/auditRepository");

/**
 * Shared Enterprise Audit Service
 * Reusable by IT Assets, Printing, Users, Permissions, Navigation, etc.
 */
const auditService = {
  async logAction(data) {
    const {
      userId,
      moduleKey,
      entityType,
      entityId,
      actionType,
      actionTitle,
      description,
      oldValue,
      newValue,
      ipAddress,
    } = data;

    await auditRepository.createAuditLog({
      userId,
      actionType,
      entityType,
      entityId,
      description: description || actionTitle,
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
      activityTitle: actionTitle,
      activityDescription: description || actionTitle,
    });

    return true;
  },
};

module.exports = auditService;