// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget Routes
// ============================================

const express = require("express");
const widgetController = require("../controllers/widgetController");

const router = express.Router();
const { platformAdministrationAccess } = require("../../../middleware/platformAdministrationMiddleware");

router.use(...platformAdministrationAccess);

router.get("/", widgetController.getWidgets);
router.get("/lookups", widgetController.getWidgetLookups);
router.get("/:widgetId", widgetController.getWidgetById);
router.post("/", widgetController.createWidget);
router.put("/:widgetId", widgetController.updateWidget);
router.delete("/:widgetId", widgetController.deleteWidget);

module.exports = router;
