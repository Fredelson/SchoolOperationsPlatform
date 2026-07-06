/* =========================================================
   IT Asset Notes Routes
========================================================= */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/assetNoteController");
const validator = require("../validators/assetNoteValidator");

router.get("/", controller.getNotes);
router.get("/asset/:assetId", controller.getNotes);

router.post("/", validator.validateCreateNote, controller.createNote);

router.delete("/:assetNoteId", controller.deleteNote);

module.exports = router;