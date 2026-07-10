/* =========================================================
   IT Asset Maintenance Routes
========================================================= */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetMaintenanceController");
const validator = require("../validators/assetMaintenanceValidator");
const { protect, authorizeRoles } = require("../../../../middleware/authMiddleware");

router.use(protect, authorizeRoles("SuperAdmin", "PlatformAdmin"));

router.post("/", validator.validateCreateMaintenance, controller.createMaintenanceLog);

router.get("/", controller.getMaintenanceLogs);
router.get("/due", controller.getMaintenanceDue);
router.get("/asset/:assetId", controller.getMaintenanceLogs);

module.exports = router;
