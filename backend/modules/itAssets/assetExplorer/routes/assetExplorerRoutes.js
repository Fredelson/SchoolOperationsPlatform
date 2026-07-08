/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Explorer Routes

   Base mount target:
   /api/it-assets/explorer
========================================================= */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetExplorerController");

router.get("/categories", controller.getCategories);

router.get(
  "/categories/:categoryId/brands",
  controller.getBrandsByCategory
);

router.get(
  "/categories/:categoryId/brands/:brandId/models",
  controller.getModelsByBrand
);

router.get("/assets", controller.getExplorerAssets);

module.exports = router;