// ============================================================
// Arab Unity School Operations Platform
// Permission Resolver Routes
// ============================================================
//
// Purpose:
// Provides secured endpoints for testing and consuming resolved
// user permissions.
//
// Architecture:
// Routes Layer
//
// Rules:
// - Route definitions only
// - Controller handles request/response
// - Service resolves permissions
// ============================================================

const express = require("express");
const controller = require("../controllers/permissionResolverController");
const { protect } = require("../../../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// Protected Resolver Routes
// ============================================================

router.use(protect);

router.get("/me", controller.getMyPermissions);
router.get("/me/check/:permissionKey", controller.checkMyPermission);
router.get("/users/:userId", controller.getUserPermissions);

module.exports = router;