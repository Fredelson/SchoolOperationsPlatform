/* =========================================================
   Personalized Notification Feed Service
   ========================================================= */

const navigationService = require("../../navigation/services/navigationService");
const serviceError = require("../../../shared/helpers/serviceError");
const repository = require("../repositories/notificationFeedRepository");

const MODULE_ACCESS_CACHE_TTL_MS = 60 * 1000;
const moduleAccessCache = new Map();

const getModuleAccess = async (userId, user) => {
  const cached = moduleAccessCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.access;
  }

  const access = await navigationService.getMyModuleAccess(user);
  moduleAccessCache.set(userId, {
    access,
    expiresAt: Date.now() + MODULE_ACCESS_CACHE_TTL_MS,
  });
  return access;
};

const getNotificationFeed = async (user, options = {}) => {
  const userId = Number(user?.UserId || user?.userId || user?.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw serviceError.unauthorized("A valid authenticated user is required.");
  }

  const requestedLimit = Number(options.limit);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 50)
    : 20;
  const access = await getModuleAccess(userId, user);

  return repository.getNotificationFeed({
    moduleKeys: access.moduleKeys,
    includeAll: access.isSuperAdmin,
    limit,
  });
};

module.exports = {
  getNotificationFeed,
};
