// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Auth Routes
//
// Purpose:
// - Login route
// - Current logged-in user route
// ============================================

const express = require("express");
const router = express.Router();

const { login, getMe, changePassword } = require("../controllers/authController");
const { protect } = require("../../../middleware/authMiddleware");

// Public route
router.post("/login", login);

// Private route
router.get("/me", protect, getMe);
router.post("/change-password", protect, changePassword);

module.exports = router;
