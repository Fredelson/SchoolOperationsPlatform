// ============================================
// ARAB UNITY SCHOOL
// Upload Routes
// Handles attachment upload and page counting
// ============================================

const express = require("express");
const router = express.Router();

const upload = require("../../middleware/uploadMiddleware");
const uploadController = require("../../controllers/uploads/uploadController");
const { protect } = require("../../middleware/authMiddleware");

// ============================================
// Count uploaded file pages before request submit
// POST /api/uploads/count-pages
// Used when user selects a file in Create Request page
// ============================================

router.post(
  "/count-pages",
  protect,
  upload.single("file"),
  uploadController.countUploadedPages
);

// ============================================
// Upload final request attachment
// POST /api/uploads/request-attachment
// Saves uploaded file into RequestAttachments table
// ============================================

router.post(
  "/request-attachment",
  protect,
  upload.single("file"),
  uploadController.uploadRequestAttachment
);

module.exports = router;