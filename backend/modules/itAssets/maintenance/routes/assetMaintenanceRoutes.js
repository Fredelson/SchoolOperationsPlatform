/* =========================================================
   IT Asset Maintenance Routes
========================================================= */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetMaintenanceController");
const validator = require("../validators/assetMaintenanceValidator");
const { protect } = require("../../../../middleware/authMiddleware");
const requirePermission = require("../../../permissionResolver/middleware/requirePermission");

router.use(protect, requirePermission("it_assets.maintenance.manage"));

router.post("/", validator.validateCreateMaintenance, controller.createMaintenanceLog);
router.put("/:maintenanceLogId/complete", controller.completeMaintenance);

router.get("/", controller.getMaintenanceLogs);
router.get("/due", controller.getMaintenanceDue);
router.get("/asset/:assetId", controller.getMaintenanceLogs);

module.exports = router;
