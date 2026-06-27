// ============================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// JWT Helper
//
// Purpose:
// - Generate JSON Web Tokens for authenticated users
// - Verify incoming JSON Web Tokens
// - Centralize JWT behavior for the platform
// ============================================

const jwt = require("jsonwebtoken");

// ============================================
// JWT Secret
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || "arabunityschool_secret_key_2026";

// ============================================
// Generate Token
// ============================================

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};

// ============================================
// Verify Token
// ============================================

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};