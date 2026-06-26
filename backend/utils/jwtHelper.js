// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// JWT Helper
// ============================================

const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT.SECRET, {
    expiresIn: env.JWT.EXPIRES_IN,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, env.JWT.SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};