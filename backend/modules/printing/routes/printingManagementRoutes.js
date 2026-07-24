const express = require("express");

const upload = require("../../../middleware/uploadMiddleware");
const { protect } = require("../../../middleware/authMiddleware");
const {
  requirePrintingCapability,
} = require("../middleware/printingAccess");
const {
  CAPABILITIES,
} = require("../services/printingAccessService");
const controller = require("../controllers/printingManagementController");

const router = express.Router();

router.use(protect);

router.get(
  "/settings",
  requirePrintingCapability(CAPABILITIES.MANAGE_SETTINGS),
  controller.getSettings
);
router.put(
  "/settings",
  requirePrintingCapability(CAPABILITIES.MANAGE_SETTINGS),
  controller.updateSettings
);

router.post(
  "/requests/drafts",
  requirePrintingCapability(CAPABILITIES.CREATE_REQUEST),
  controller.createDraft
);
router.get(
  "/requests/mine",
  requirePrintingCapability(CAPABILITIES.VIEW_OWN_REQUESTS),
  controller.listMyRequests
);
router.get(
  "/requests/attachments/mine",
  requirePrintingCapability(CAPABILITIES.VIEW_OWN_REQUESTS),
  controller.listMyAttachments
);
router.post(
  "/requests/:id/attachments",
  requirePrintingCapability(CAPABILITIES.CREATE_REQUEST),
  upload.single("file"),
  controller.uploadAttachment
);
router.post(
  "/requests/:id/submit",
  requirePrintingCapability(CAPABILITIES.CREATE_REQUEST),
  controller.submitRequest
);
router.put(
  "/requests/:id/cancel",
  requirePrintingCapability(CAPABILITIES.VIEW_OWN_REQUESTS),
  controller.cancelRequest
);
router.get(
  "/requests/:id",
  requirePrintingCapability(CAPABILITIES.VIEW_OWN_REQUESTS),
  controller.getRequestById
);

router.get(
  "/approvals/hod",
  requirePrintingCapability(CAPABILITIES.APPROVE_HOD),
  controller.listHodApprovals
);
router.get(
  "/approvals/hos",
  requirePrintingCapability(CAPABILITIES.APPROVE_HOS),
  controller.listHosApprovals
);
router.get(
  "/approvals/:role/history",
  requirePrintingCapability(CAPABILITIES.VIEW_OWN_REQUESTS),
  controller.listApprovalHistory
);
router.get(
  "/approvals/:role/summary",
  requirePrintingCapability(CAPABILITIES.VIEW_OWN_REQUESTS),
  controller.getApprovalSummary
);
router.put(
  "/approvals/:role/:id",
  requirePrintingCapability(CAPABILITIES.VIEW_OWN_REQUESTS),
  controller.decideApproval
);

module.exports = router;
