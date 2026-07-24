/* =========================================================
   IT Assets Module Entry Point
========================================================= */

const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../middleware/permissionMiddleware");

const itAssetLookupRoutes = require("./lookup/routes/itAssetLookupRoutes");
const itAssetRoutes = require("./asset/routes/itAssetRoutes");
const assetAssignmentRoutes = require("./assignment/routes/assetAssignmentRoutes");
const assetAssignmentHistoryRoutes = require("./assignment/routes/assetAssignmentHistoryRoutes");
const assetBorrowRoutes = require("./borrow/routes/assetBorrowRoutes");
const assetTransferRoutes = require("./transfer/routes/assetTransferRoutes");
const assetMaintenanceRoutes = require("./maintenance/routes/assetMaintenanceRoutes");
const assetIssueRoutes = require("./issues/routes/assetIssueRoutes");
const assetNoteRoutes = require("./notes/routes/assetNoteRoutes");
const assetDisposalRoutes = require("./disposal/routes/assetDisposalRoutes");
const assetTimelineRoutes = require("./timeline/routes/assetTimelineRoutes");
const assetDashboardRoutes = require("./dashboard/routes/assetDashboardRoutes");
const assetExplorerRoutes = require("./assetExplorer/routes/assetExplorerRoutes");
const assetImportRoutes = require("./import/routes/itAssetImportRoutes");
const assetAuditRoutes = require("./audit/routes/assetAuditRoutes");
const assetTagBrandingRoutes = require("./assetTagBranding/routes/assetTagBrandingRoutes");

// Every IT Asset endpoint requires an authenticated platform session.
// Workflow-specific routes add their existing action authorization on top.
router.use(protect);
router.use(requireActiveWorkspace);

router.use("/audit", assetAuditRoutes);

/* Dashboard Routes */
router.use("/dashboard", assetDashboardRoutes);

/* Asset Explorer Routes */
router.use("/explorer", assetExplorerRoutes);

/* Lifecycle Routes */
router.use("/timeline", assetTimelineRoutes);
router.use("/disposals", assetDisposalRoutes);
router.use("/notes", assetNoteRoutes);
router.use("/issues", assetIssueRoutes);
router.use("/maintenance", assetMaintenanceRoutes);
router.use("/transfer", assetTransferRoutes);
router.use("/borrow", assetBorrowRoutes);

/* Import Routes */
router.use("/import", assetImportRoutes);

/* Core Routes */
router.use("/lookups", itAssetLookupRoutes);
router.use("/assignments", assetAssignmentRoutes);
router.use("/assignments", assetAssignmentHistoryRoutes);
router.use("/asset-tag-branding", assetTagBrandingRoutes);
router.use("/", itAssetRoutes);

module.exports = router;
