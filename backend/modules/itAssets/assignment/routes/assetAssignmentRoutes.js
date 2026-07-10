/* =========================================================
   IT Asset Assignment Routes
========================================================= */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetAssignmentController");

const {
  validateAssignPayload,
  validateReturnPayload,
} = require("../validators/assetAssignmentValidator");

const { protect } = require("../../../../middleware/authMiddleware");
const requirePermission = require("../../../permissionResolver/middleware/requirePermission");

router.get("/:assetId/history", protect, controller.getAssignmentHistory);

router.post(
  "/assign",
  protect,
  requirePermission("it_assets.assignment.manage"),
  validateAssignPayload,
  controller.assignAsset
);

router.put(
  "/:assetId/return",
  protect,
  requirePermission("it_assets.assignment.manage"),
  validateReturnPayload,
  controller.returnAsset
);

module.exports = router;
