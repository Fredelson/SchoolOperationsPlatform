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

router.get("/:assetId/history", protect, controller.getAssignmentHistory);

router.post(
  "/assign",
  protect,
  validateAssignPayload,
  controller.assignAsset
);

router.put(
  "/:assetId/return",
  protect,
  validateReturnPayload,
  controller.returnAsset
);

module.exports = router;