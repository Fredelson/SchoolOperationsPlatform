// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Authentication & Role Middleware
//
// Purpose:
// - Protect private API routes using JWT
// - Attach logged-in user payload to req.user
// - Restrict routes by allowed roles
//
// Important:
// We keep the names `protect` and `authorizeRoles`
// so existing route files continue working.
// ============================================


const { verifyToken } = require("../shared/security/jwt");

// ============================================
// Protect Private Routes
// ============================================

const protect = (req, res, next) => {
  try {
    // Read Authorization header from request
    const authHeader = req.headers.authorization;

    // Require Bearer token format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // Verify token using centralized JWT helper
    const decoded = verifyToken(token);

    // Store decoded user data for controllers/routes
    req.user = decoded;

    // Continue to next middleware/controller
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

// ============================================
// Role-Based Authorization
// ============================================

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Safety check: protect middleware must run first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. User not found in request.",
      });
    }

    // Check user role against allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission.",
      });
    }

    // User has required role
    next();
  };
};

// ============================================
// Exports
// ============================================

module.exports = {
  protect,
  authorizeRoles,
};