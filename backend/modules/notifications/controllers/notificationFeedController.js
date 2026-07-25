// ============================================
// Personalized Notification Feed Controller
// ============================================

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");
const notificationFeedService = require("../services/notificationFeedService");

const getNotificationFeed = asyncHandler(async (req, res) => {
  const notifications = await notificationFeedService.getNotificationFeed(
    req.user,
    req.query
  );
  return sendSuccess(res, "Notifications loaded.", { notifications });
});

module.exports = {
  getNotificationFeed,
};
