/* =========================================================
   IT Asset Assignment Routes
========================================================= */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetAssignmentController");
const { validateAssignPayload } = require("../validators/assetAssignmentValidator");

router.get("/:assetId/history", controller.getAssignmentHistory);
router.post("/assign", validateAssignPayload, controller.assignAsset);
router.put("/:assetId/return", controller.returnAsset);

module.exports = router;