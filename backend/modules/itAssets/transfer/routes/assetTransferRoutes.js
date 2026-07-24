const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetTransferController");
const validator = require("../validators/assetTransferValidator");
const { protect } = require("../../../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../../../middleware/permissionMiddleware");

router.use(protect, requireActiveWorkspace);

router.get("/", controller.getTransfers);
router.get("/asset/:assetId", controller.getTransfersByAssetId);
router.post("/", validator.validateDirectTransfer, controller.transferAsset);

module.exports = router;
