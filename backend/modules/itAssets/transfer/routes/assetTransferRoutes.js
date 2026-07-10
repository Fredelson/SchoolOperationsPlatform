const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetTransferController");
const validator = require("../validators/assetTransferValidator");
const { protect } = require("../../../../middleware/authMiddleware");
const requirePermission = require("../../../permissionResolver/middleware/requirePermission");

router.use(protect, requirePermission("it_assets.transfer.manage"));

router.get("/", controller.getTransfers);
router.get("/asset/:assetId", controller.getTransfersByAssetId);
router.post("/", validator.validateDirectTransfer, controller.transferAsset);

module.exports = router;
