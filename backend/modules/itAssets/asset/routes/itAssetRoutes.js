/* =========================================================
   IT Asset Routes
========================================================= */

const express = require("express");
const router = express.Router();

const itAssetController = require("../controllers/itAssetController");
const { validateAssetPayload } = require("../validators/itAssetValidator");

router.get("/", itAssetController.getAssets);
router.get("/export", itAssetController.exportAssets);
router.get("/:id", itAssetController.getAssetById);
router.post("/", validateAssetPayload, itAssetController.createAsset);
router.put("/:id", validateAssetPayload, itAssetController.updateAsset);
router.delete("/:id", itAssetController.deleteAsset);

module.exports = router;