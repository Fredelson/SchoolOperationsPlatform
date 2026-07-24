/* =========================================================
   Notification Read State Service
   ========================================================= */

const repository = require("../repositories/notificationReadRepository");

const getNotificationReadAt = async (user) => {
  const userId = user?.UserId || user?.id;
  return repository.getUserReadAt(userId);
};

const markAllNotificationsAsRead = async (user) => {
  const userId = user?.UserId || user?.id;
  await repository.upsertUserReadAt(userId);
  return { success: true };
};

module.exports = {
  getNotificationReadAt,
  markAllNotificationsAsRead,
};
