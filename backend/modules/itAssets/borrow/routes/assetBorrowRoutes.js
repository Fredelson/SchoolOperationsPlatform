/* =========================================================
   IT Asset Borrow Routes
========================================================= */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetBorrowController");
const validator = require("../validators/assetBorrowValidator");
const requirePermission = require("../../../permissionResolver/middleware/requirePermission");

router.use(requirePermission("it_assets.borrow.manage"));

router.post("/", validator.validateBorrowAsset, controller.borrowAsset);
router.post("/return", validator.validateReturnBorrowedAsset, controller.returnBorrowedAsset);

router.get("/history", controller.getBorrowHistory);
router.get("/history/:assetId", controller.getBorrowHistory);
router.get("/active", controller.getActiveBorrows);
router.get("/overdue", controller.getOverdueBorrows);

module.exports = router;
