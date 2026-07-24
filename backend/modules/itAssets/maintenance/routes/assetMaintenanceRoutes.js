/* =========================================================
   IT Asset Maintenance Routes
========================================================= */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetMaintenanceController");
const validator = require("../validators/assetMaintenanceValidator");
const { protect } = require("../../../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../../../middleware/permissionMiddleware");

router.use(protect, requireActiveWorkspace);

router.post("/", validator.validateCreateMaintenance, controller.createMaintenanceLog);
router.put("/:maintenanceLogId/complete", controller.completeMaintenance);
router.post("/:maintenanceLogId/reopen", controller.reopenMaintenance);
router.post("/:assetId/parts/receive", controller.receiveMaintenanceParts);

router.get("/", controller.getMaintenanceLogs);
router.get("/due", controller.getMaintenanceDue);
router.get("/asset/:assetId", controller.getMaintenanceLogs);

module.exports = router;
