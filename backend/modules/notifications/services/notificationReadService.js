/* =========================================================
   Notification Read State Service
   ========================================================= */

const repository = require("../repositories/notificationReadRepository");
const serviceError = require("../../../shared/helpers/serviceError");

const getAuthenticatedUserId = (user) => {
  const userId = Number(user?.UserId || user?.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw serviceError.unauthorized("A valid authenticated user is required.");
  }
  return userId;
};

const getNotificationReadAt = async (user) => {
  const userId = getAuthenticatedUserId(user);
  return repository.getUserReadAt(userId);
};

const markAllNotificationsAsRead = async (user) => {
  const userId = getAuthenticatedUserId(user);
  const readAt = await repository.upsertUserReadAt(userId);
  if (!readAt) {
    throw serviceError.create("Notification read state could not be saved.");
  }
  return { readAt };
};

module.exports = {
  getNotificationReadAt,
  markAllNotificationsAsRead,
};
