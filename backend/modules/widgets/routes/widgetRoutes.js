// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget Routes
// ============================================

const express = require("express");
const widgetController = require("../controllers/widgetController");

const router = express.Router();
const { protect } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../../modules/permissionResolver/middleware/requirePermission");

router.use(protect);

router.get("/", requirePermission("Widget.View"), widgetController.getWidgets);
router.get("/lookups", requirePermission("Widget.View"), widgetController.getWidgetLookups);
router.get("/:widgetId", requirePermission("Widget.View"), widgetController.getWidgetById);
router.post("/", requirePermission("Widget.View"), widgetController.createWidget);
router.put("/:widgetId", requirePermission("Widget.View"), widgetController.updateWidget);
router.delete("/:widgetId", requirePermission("Widget.View"), widgetController.deleteWidget);

module.exports = router;
