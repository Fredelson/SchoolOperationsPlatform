const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetTransferController");
const validator = require("../validators/assetTransferValidator");
const { protect, authorizeRoles } = require("../../../../middleware/authMiddleware");

router.use(protect, authorizeRoles("SuperAdmin", "PlatformAdmin"));

router.get("/", controller.getTransfers);
router.get("/asset/:assetId", controller.getTransfersByAssetId);
router.post("/", validator.validateDirectTransfer, controller.transferAsset);

module.exports = router;
