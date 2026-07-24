// ============================================
// Notification Read State Routes
// ============================================

const express = require("express");
const router = express.Router();

const { getNotificationReadAt, markAllNotificationsAsRead } = require("../controllers/notificationReadController");
const { protect } = require("../../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../../middleware/permissionMiddleware");

router.use(protect);
router.use(requireActiveWorkspace);

// GET /api/notifications/read-at
router.get("/read-at", getNotificationReadAt);

// POST /api/notifications/mark-all-read
router.post("/mark-all-read", markAllNotificationsAsRead);

module.exports = router;
