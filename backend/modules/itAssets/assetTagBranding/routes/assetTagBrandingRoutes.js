const express = require("express");
const router = express.Router();
const { getBranding, saveBranding } = require("../controllers/assetTagBrandingController");

router.get("/:type", getBranding);
router.put("/:type", saveBranding);

module.exports = router;