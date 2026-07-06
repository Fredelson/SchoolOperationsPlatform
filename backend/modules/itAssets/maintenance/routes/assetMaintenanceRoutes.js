/* =========================================================
   IT Asset Maintenance Routes
========================================================= */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetMaintenanceController");
const validator = require("../validators/assetMaintenanceValidator");

router.post("/", validator.validateCreateMaintenance, controller.createMaintenanceLog);

router.get("/", controller.getMaintenanceLogs);
router.get("/due", controller.getMaintenanceDue);
router.get("/asset/:assetId", controller.getMaintenanceLogs);

module.exports = router;