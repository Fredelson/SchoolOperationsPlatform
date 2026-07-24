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
const { requireActiveWorkspace } = require("../../../../middleware/permissionMiddleware");

router.get("/:assetId/history", protect, controller.getAssignmentHistory);

router.post(
  "/assign",
  protect,
  requireActiveWorkspace,
  validateAssignPayload,
  controller.assignAsset
);

router.put(
  "/:assetId/return",
  protect,
  requireActiveWorkspace,
  validateReturnPayload,
  controller.returnAsset
);

module.exports = router;
