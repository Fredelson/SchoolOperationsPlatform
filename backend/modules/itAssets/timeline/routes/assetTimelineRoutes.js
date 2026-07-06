/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Timeline Routes
========================================================= */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetTimelineController");

router.get("/:assetId", controller.getTimeline);
router.get("/:assetId/assignments", controller.getAssignments);
router.get("/:assetId/borrows", controller.getBorrows);
router.get("/:assetId/transfers", controller.getTransfers);
router.get("/:assetId/maintenance", controller.getMaintenance);
router.get("/:assetId/issues", controller.getIssues);
router.get("/:assetId/notes", controller.getNotes);
router.get("/:assetId/disposals", controller.getDisposals);
router.get("/:assetId/status", controller.getStatus);

module.exports = router;