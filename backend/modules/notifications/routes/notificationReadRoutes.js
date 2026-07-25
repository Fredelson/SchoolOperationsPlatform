// ============================================
// Notification Read State Routes
// ============================================

const express = require("express");
const router = express.Router();

const { getNotificationReadAt, markAllNotificationsAsRead } = require("../controllers/notificationReadController");
const { getNotificationFeed } = require("../controllers/notificationFeedController");
const { protect } = require("../../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../../middleware/permissionMiddleware");

router.use(protect);
router.use(requireActiveWorkspace);

// GET /api/notifications/read-at
router.get("/read-at", getNotificationReadAt);

// GET /api/notifications/feed
router.get("/feed", getNotificationFeed);

// POST /api/notifications/mark-all-read
router.post("/mark-all-read", markAllNotificationsAsRead);

module.exports = router;
