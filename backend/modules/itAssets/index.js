/* =========================================================
   IT Assets Module Entry Point
========================================================= */

const express = require("express");
const router = express.Router();

const itAssetLookupRoutes = require("./lookup/routes/itAssetLookupRoutes");
const itAssetRoutes = require("./asset/routes/itAssetRoutes");
const assetAssignmentRoutes = require("./assignment/routes/assetAssignmentRoutes");

router.use("/lookups", itAssetLookupRoutes);
router.use("/assignments", assetAssignmentRoutes);
router.use("/", itAssetRoutes);

module.exports = router;