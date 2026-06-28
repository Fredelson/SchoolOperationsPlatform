// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// System Branding Routes
// ============================================
//
// Purpose:
// Defines organization and branding endpoints.
//
// Base Path:
// /api/system
// ============================================

const express = require("express");

const router = express.Router();

const {
  getSystemBranding,
  updateSystemBranding,
  uploadBrandingFile,
} = require("../controllers/systemBrandingController");

const { protect } = require("../../../middleware/authMiddleware");
const upload = require("../../../middleware/uploadMiddleware");

// ============================================================
// BRANDING ROUTES
// ============================================================

router.get("/branding", protect, getSystemBranding);

router.put("/branding", protect, updateSystemBranding);

router.post(
  "/branding/:fileType",
  protect,
  upload.single("file"),
  uploadBrandingFile
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;