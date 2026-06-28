// ============================================================
// Arab Unity School Operations Platform
// Role Routes
// ============================================================
//
// Purpose:
// Defines all API endpoints related to Role Management.
//
// Architecture:
//
// Routes
//     ↓
// Controller
//     ↓
// Service
//
// Security:
// All routes require authentication.
//
// Future:
// Permission middleware will be added once the
// Permission Engine is completed.
//
// ============================================================

const express = require("express");

const router = express.Router();

const {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
} = require("../controllers/roleController");

const { protect } = require("../../../middleware/authMiddleware");

/**
 * ============================================================
 * Apply Authentication
 * ============================================================
 *
 * Every Role endpoint requires a valid JWT.
 *
 * Permission middleware will be added later:
 *
 * requirePermission("roles.view")
 * requirePermission("roles.create")
 * requirePermission("roles.update")
 * requirePermission("roles.delete")
 *
 * ============================================================
 */

router.use(protect);

/**
 * ============================================================
 * Role Routes
 * ============================================================
 */

router.get("/", getRoles);

router.get("/:roleId", getRoleById);

router.post("/", createRole);

router.put("/:roleId", updateRole);

router.delete("/:roleId", deleteRole);

/**
 * ============================================================
 * Export Router
 * ============================================================
 */

module.exports = router;