// ============================================
// Notification Read State Controller
// ============================================

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");
const notificationReadService = require("../services/notificationReadService");

// GET /api/notifications/read-at
const getNotificationReadAt = asyncHandler(async (req, res) => {
  const result = await notificationReadService.getNotificationReadAt(req.user);
  return sendSuccess(res, "Notification read state loaded.", { readAt: result });
});

// POST /api/notifications/mark-all-read
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const result = await notificationReadService.markAllNotificationsAsRead(req.user);
  return sendSuccess(res, "All notifications marked as read.", result);
});

module.exports = {
  getNotificationReadAt,
  markAllNotificationsAsRead,
};
