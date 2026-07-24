const express = require("express");

const { protect } = require("../../../middleware/authMiddleware");
const {
  requirePrintingCapability,
} = require("../middleware/printingAccess");
const { CAPABILITIES } = require("../services/printingAccessService");
const controller = require("../controllers/printingOperationsController");

const router = express.Router();

router.use(protect);

router.get(
  "/inventory",
  requirePrintingCapability(CAPABILITIES.VIEW_INVENTORY),
  controller.getInventory
);
router.put(
  "/inventory",
  requirePrintingCapability(CAPABILITIES.MANAGE_INVENTORY),
  controller.adjustInventory
);
router.get(
  "/inventory/transactions",
  requirePrintingCapability(CAPABILITIES.VIEW_INVENTORY),
  controller.getInventoryTransactions
);

router.get(
  "/purchases",
  requirePrintingCapability(CAPABILITIES.VIEW_INVENTORY),
  controller.getPurchases
);
router.post(
  "/purchases",
  requirePrintingCapability(CAPABILITIES.MANAGE_INVENTORY),
  controller.addPurchase
);

router.get(
  "/distributions/users/search",
  requirePrintingCapability(CAPABILITIES.MANAGE_INVENTORY),
  controller.searchDistributionUsers
);
router.get(
  "/distributions",
  requirePrintingCapability(CAPABILITIES.VIEW_INVENTORY),
  controller.getDistributions
);
router.post(
  "/distributions",
  requirePrintingCapability(CAPABILITIES.MANAGE_INVENTORY),
  controller.addDistribution
);

router.get(
  "/limits/departments",
  requirePrintingCapability(CAPABILITIES.MANAGE_LIMITS),
  controller.getDepartmentLimits
);
router.put(
  "/limits/departments/:departmentId",
  requirePrintingCapability(CAPABILITIES.MANAGE_LIMITS),
  controller.saveDepartmentLimit
);
router.get(
  "/limits/subjects",
  requirePrintingCapability(CAPABILITIES.MANAGE_LIMITS),
  controller.getSubjectLimits
);
router.put(
  "/limits/subjects/:subjectId",
  requirePrintingCapability(CAPABILITIES.MANAGE_LIMITS),
  controller.saveSubjectLimit
);

module.exports = router;
