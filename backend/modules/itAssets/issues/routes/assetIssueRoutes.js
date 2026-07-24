const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetIssueController");
const validator = require("../validators/assetIssueValidator");
const { protect } = require("../../../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../../../middleware/permissionMiddleware");

router.use(protect, requireActiveWorkspace);

router.get("/", controller.getIssues);
router.get("/open", controller.getOpenIssues);
router.get("/resolved", controller.getResolvedIssues);
router.get("/asset/:assetId", controller.getIssuesByAsset);

router.post("/", validator.validateReportIssue, controller.reportIssue);
router.put("/assign", validator.validateAssignIssue, controller.assignIssue);
router.put("/resolve", validator.validateResolveIssue, controller.resolveIssue);

module.exports = router;
