// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// System Module
// ============================================
//
// Purpose:
// Registers all System module routes.
//
// Current Features:
// - Organization
// - Branding
//
// Future:
// - Themes
// - Settings
// - Notifications
// - File Storage
// ============================================

const express = require("express");

const router = express.Router();

// ============================================================
// SYSTEM ROUTES
// ============================================================

router.use("/", require("./routes/systemBrandingRoutes"));

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;