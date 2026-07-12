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

const protect = async (req, res, next) => {
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

    if (decoded.liveMode && decoded.liveSessionId) {
      const workspaceRepository=require("../modules/workspaceManager/repositories/workspaceManagerRepository");
      const activeSession=await workspaceRepository.getActiveLiveSession(decoded.liveSessionId,decoded.actorUserId,decoded.id);
      if(!activeSession) return res.status(401).json({success:false,message:"Live Mode session has ended or is invalid."});
      req.liveMode = { sessionId:decoded.liveSessionId, actorUserId:decoded.actorUserId, targetUserId:decoded.id, reason:decoded.reason };
      res.on("finish", () => {
        const activityLogger=require("../modules/audit/services/activityLogger");
        workspaceRepository.touchLiveSession(decoded.liveSessionId,req.originalUrl).catch(()=>{});
        activityLogger.log({moduleKey:"PLATFORM_FOUNDATION",actionType:`LIVE_${req.method}`,entityType:"WorkspaceLiveRoute",entityId:decoded.liveSessionId,title:`Live Mode ${req.method} ${req.originalUrl}`,description:`HTTP ${res.statusCode}; target user ${decoded.id}; ${decoded.reason}`,user:{id:decoded.actorUserId},ipAddress:req.ip});
      });
    }

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
    const assignmentKeys = new Set((req.user.assignmentScopes || []).map((item) => item.AssignmentKey));
    const compatibilityAssignments = {
      HOD: "HOD",
      HOS: "HOS",
      Secretary: "SECRETARY",
      Librarian: "LIBRARIAN",
      LibraryAdmin: "LIBRARY_ADMIN",
      TeachingAssistant: "TEACHING_ASSISTANT",
    };
    const assignmentMatches = roles.some((role) => compatibilityAssignments[role] && assignmentKeys.has(compatibilityAssignments[role]));
    if (!roles.includes(req.user.role) && !assignmentMatches) {
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
