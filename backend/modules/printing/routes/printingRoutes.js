const express = require("express");

const { protect } = require("../../../middleware/authMiddleware");
const {
  requirePrintingCapability,
} = require("../middleware/printingAccess");
const { CAPABILITIES } = require("../services/printingAccessService");
const {
  validatePrintingRequestId,
  validateOptionalRemarks,
  validateCompletePrinting,
} = require("../validators/printingValidator");
const controller = require("../controllers/printingController");

const router = express.Router();

router.use(protect);

router.get(
  "/dashboard",
  requirePrintingCapability(CAPABILITIES.MANAGE_QUEUE),
  controller.getPrintingDashboard
);
router.get(
  "/queue",
  requirePrintingCapability(CAPABILITIES.MANAGE_QUEUE),
  controller.getPrintingQueue
);
router.get(
  "/queue/:id",
  requirePrintingCapability(CAPABILITIES.MANAGE_QUEUE),
  validatePrintingRequestId,
  controller.getPrintingRequestById
);
router.put(
  "/queue/:id/claim",
  requirePrintingCapability(CAPABILITIES.MANAGE_QUEUE),
  validatePrintingRequestId,
  controller.claimPrinting
);
router.put(
  "/queue/:id/start",
  requirePrintingCapability(CAPABILITIES.MANAGE_QUEUE),
  validatePrintingRequestId,
  controller.startPrinting
);
router.put(
  "/queue/:id/hold",
  requirePrintingCapability(CAPABILITIES.MANAGE_QUEUE),
  validatePrintingRequestId,
  validateOptionalRemarks,
  controller.holdPrinting
);
router.put(
  "/queue/:id/resume",
  requirePrintingCapability(CAPABILITIES.MANAGE_QUEUE),
  validatePrintingRequestId,
  controller.resumePrinting
);
router.put(
  "/queue/:id/cancel",
  requirePrintingCapability(CAPABILITIES.MANAGE_QUEUE),
  validatePrintingRequestId,
  validateOptionalRemarks,
  controller.cancelPrinting
);
router.put(
  "/queue/:id/complete",
  requirePrintingCapability(CAPABILITIES.MANAGE_QUEUE),
  validatePrintingRequestId,
  validateCompletePrinting,
  controller.completePrinting
);

router.get(
  "/managed-requests",
  requirePrintingCapability(CAPABILITIES.MANAGE_QUEUE),
  controller.listManagedRequests
);
router.get(
  "/history",
  requirePrintingCapability(CAPABILITIES.VIEW_REPORTS),
  controller.getPrintingHistory
);
router.get(
  "/reports",
  requirePrintingCapability(CAPABILITIES.VIEW_REPORTS),
  controller.getPrintingReport
);

module.exports = router;
