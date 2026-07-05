/* =========================================================
   IT Assets Module Entry Point
========================================================= */

const express = require("express");
const router = express.Router();

const itAssetLookupRoutes = require("./lookup/routes/itAssetLookupRoutes");
const itAssetRoutes = require("./asset/routes/itAssetRoutes");

router.use("/lookups", itAssetLookupRoutes);
router.use("/", itAssetRoutes);

module.exports = router;