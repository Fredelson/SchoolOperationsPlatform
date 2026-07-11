// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Routes
// ============================================

const express = require("express");
const buttonsController = require("../controllers/buttonsController");

const router = express.Router();
const { platformAdministrationAccess } = require("../../../middleware/platformAdministrationMiddleware");

router.use(...platformAdministrationAccess);

router.get("/", buttonsController.getButtons);
router.get("/statistics", buttonsController.getButtonStatistics);
router.get("/lookups", buttonsController.getButtonLookups);
router.get("/:buttonId", buttonsController.getButtonById);

router.post("/", buttonsController.createButton);
router.put("/:buttonId", buttonsController.updateButton);
router.delete("/:buttonId", buttonsController.deleteButton);

module.exports = router;
