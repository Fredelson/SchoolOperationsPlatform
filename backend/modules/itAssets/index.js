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

router.use("/borrow", assetBorrowRoutes);
router.use("/lookups", itAssetLookupRoutes);
router.use("/assignments", assetAssignmentRoutes);
router.use("/assignments", assetAssignmentHistoryRoutes);
router.use("/", itAssetRoutes);

module.exports = router;