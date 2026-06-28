// ============================================================
// Arab Unity School Operations Platform
// User Permission Override Routes
// ============================================================
//
// Purpose:
// Defines secured API routes for managing user-level permission
// overrides.
//
// Architecture:
// Routes Layer
//
// Rules:
// - Route definitions only
// - Controller handles HTTP logic
// - Service handles business rules
// - Repository handles SQL
// ============================================================

const express = require("express");
const controller = require("../controllers/userPermissionOverrideController");
const { protect } = require("../../../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// Secured Routes
// ============================================================
//
// All routes require valid JWT authentication.
// Permission middleware will be added after the permission engine
// is completed.
// ============================================================

router.use(protect);

router.get("/", controller.getAllOverrides);
router.get("/user/:userId", controller.getOverridesByUserId);
router.get("/:id", controller.getOverrideById);
router.post("/", controller.createOverride);
router.put("/:id", controller.updateOverride);
router.delete("/:id", controller.deleteOverride);

module.exports = router;
