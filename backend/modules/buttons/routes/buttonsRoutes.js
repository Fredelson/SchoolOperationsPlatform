// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Routes
// ============================================

const express = require("express");
const buttonsController = require("../controllers/buttonsController");

const router = express.Router();
const { protect } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../../modules/permissionResolver/middleware/requirePermission");

router.use(protect);

router.get("/", requirePermission("Button.View"), buttonsController.getButtons);
router.get("/statistics", requirePermission("Button.View"), buttonsController.getButtonStatistics);
router.get("/lookups", requirePermission("Button.View"), buttonsController.getButtonLookups);
router.get("/:buttonId", requirePermission("Button.View"), buttonsController.getButtonById);

router.post("/", requirePermission("Button.View"), buttonsController.createButton);
router.put("/:buttonId", requirePermission("Button.View"), buttonsController.updateButton);
router.delete("/:buttonId", requirePermission("Button.View"), buttonsController.deleteButton);

module.exports = router;
