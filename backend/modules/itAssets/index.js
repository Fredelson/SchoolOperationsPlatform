/* =========================================================
   IT Assets Module Entry Point
========================================================= */

const express = require("express");
const router = express.Router();

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
const assetImportRoutes = require("./import/routes/itAssetImportRoutes");

/* Dashboard */
router.use("/dashboard", assetDashboardRoutes);

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
router.use("/", itAssetRoutes);

module.exports = router;