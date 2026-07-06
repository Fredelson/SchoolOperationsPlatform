const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetTransferController");
const validator = require("../validators/assetTransferValidator");

router.get("/", controller.getTransfers);
router.get("/asset/:assetId", controller.getTransfersByAssetId);

router.post("/request", validator.validateTransferRequest, controller.createTransferRequest);
router.post("/approve", validator.validateTransferAction, controller.approveTransfer);
router.post("/reject", validator.validateTransferAction, controller.rejectTransfer);
router.post("/complete", validator.validateTransferAction, controller.completeTransfer);

module.exports = router;