/* =========================================================
   IT Asset Assignment History Routes
========================================================= */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetAssignmentHistoryController");
const { protect } = require("../../../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../../../middleware/permissionMiddleware");

router.use(protect, requireActiveWorkspace);

// All assignment history
router.get("/history", controller.getAssignmentHistory);

// Assignment history by asset
router.get("/history/:assetId", controller.getAssignmentHistory);

// Current active assignments
router.get("/active", controller.getActiveAssignments);

// All status history
router.get("/status-history", controller.getStatusHistory);

// Status history by asset
router.get("/status-history/:assetId", controller.getStatusHistory);

module.exports = router;
