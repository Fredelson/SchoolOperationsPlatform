/* =========================================================
   IT Asset Disposal Routes
========================================================= */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetDisposalController");
const validator = require("../validators/assetDisposalValidator");
const { protect, authorizeRoles } = require("../../../../middleware/authMiddleware");

router.use(protect, authorizeRoles("SuperAdmin", "PlatformAdmin"));

router.get("/", controller.getDisposals);
router.get("/pending", controller.getPendingDisposals);
router.get("/completed", controller.getCompletedDisposals);
router.get("/asset/:assetId", controller.getDisposalsByAsset);

router.post("/request", validator.validateRequestDisposal, controller.requestDisposal);

router.put("/approve", validator.validateDisposalAction, controller.approveDisposal);
router.put("/reject", validator.validateDisposalAction, controller.rejectDisposal);
router.put("/complete", validator.validateDisposalAction, controller.completeDisposal);

module.exports = router;
