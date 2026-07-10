/* =========================================================
   IT Asset Audit Routes
========================================================= */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetAuditController");

router.get("/:assetId", controller.getAuditByAssetId);

module.exports = router;