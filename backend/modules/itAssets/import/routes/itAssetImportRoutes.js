/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Import Routes
========================================================= */

const express = require("express");
const multer = require("multer");
const path = require("path");

const controller = require("../controllers/itAssetImportController");
const { protect } = require("../../../../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  dest: path.join(process.cwd(), "uploads", "it-asset-imports"),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post(
  "/preview",
  protect,
  upload.single("file"),
  controller.uploadPreview
);

router.post(
  "/:batchId/commit",
  protect,
  controller.commitImport
);

router.get(
  "/history",
  protect,
  controller.getImportHistory
);

module.exports = router;