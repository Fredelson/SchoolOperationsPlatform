// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Central API Route Registry
// ============================================
//
// Purpose:
// - Register all API endpoints.
// - Keep app.js clean.
// - Organize routes by feature/module.
// - Provide one central place for API registration.
//
// Architecture:
//
// app.js
//    │
//    ▼
// routes/index.js
//    │
//    ├── Auth
//    ├── Users
//    ├── Requests
//    ├── Printing
//    ├── Teacher
//    ├── Master Data
//    ├── Lookups
//    ├── Super Admin
//    └── Uploads
//
// Notes:
// - Do NOT place business logic here.
// - Only register routers.
// ============================================

const express = require("express");
const router = express.Router();

// ============================================
// AUTH MODULE
// ============================================
//
// Handles:
//
// POST   /api/auth/login
// GET    /api/auth/me
//
// This module has already been migrated to the
// new feature-based architecture.
//

const authRoutes = require("../modules/auth");

/**
 * Register Auth Module
 *
 * Final endpoints:
 *
 * POST /api/auth/login
 * GET  /api/auth/me
 */
router.use("/auth", authRoutes);

// ============================================
// USER MANAGEMENT
// ============================================
//
// Legacy routes.
// These will be migrated later into:
// modules/users
//

router.use("/users", require("./users/userRoutes"));
router.use("/admin", require("./users/userImportRoutes"));

// ============================================
// REQUEST WORKFLOW
// ============================================
//
// Teacher
//      ↓
// HOD
//      ↓
// HOS
//      ↓
// Printing
//

router.use("/requests", require("./requests/requestRoutes"));
router.use("/hod", require("./requests/hodRoutes"));
router.use("/hos", require("./requests/hosRoutes"));
router.use("/limits", require("./requests/limitRoutes"));
router.use("/distributions", require("./requests/distributionRoutes"));

// ============================================
// TEACHER MODULE
// ============================================

router.use(
  "/teacher/dashboard",
  require("./teacher/teacherDashboardRoutes")
);

router.use(
  "/teacher/reports",
  require("./teacher/teacherReportRoutes")
);

// ============================================
// PRINTING MODULE
// ============================================

router.use("/printing", require("./printing/printingRoutes"));
router.use("/paper-stock", require("./printing/paperStockRoutes"));
router.use("/purchases", require("./printing/purchaseRoutes"));

// ============================================
// FILE UPLOADS
// ============================================

router.use("/uploads", require("./uploads/uploadRoutes"));

// ============================================
// MASTER DATA
// ============================================

router.use("/master", require("./master/masterRoutes"));
router.use("/lookups", require("./lookups/lookupRoutes"));
router.use("/access-levels", require("./security/accessLevelRoutes"));

// ============================================
// SUPER ADMIN
// ============================================
//
// Foundation module for the platform.
//

router.use(
  "/superadmin/dashboard",
  require("./superadmin/dashboardRoutes")
);

router.use(
  "/superadmin/modules",
  require("./superadmin/moduleRoutes")
);

router.use(
  "/superadmin/permissions",
  require("./superadmin/permissionRoutes")
);

router.use(
  "/superadmin/user-overrides",
  require("./superadmin/userPermissionOverrideRoutes")
);

router.use(
  "/superadmin/roles",
  require("./superadmin/roleRoutes")
);

router.use(
  "/superadmin/menus",
  require("./superadmin/menuRoutes")
);

router.use(
  "/superadmin/buttons",
  require("./superadmin/buttonRoutes")
);

router.use(
  "/superadmin/widgets",
  require("./superadmin/widgetRoutes")
);

router.use(
  "/superadmin/feature-flags",
  require("./superadmin/featureFlagRoutes")
);

router.use(
  "/superadmin/system-settings",
  require("./superadmin/systemSettingsRoutes")
);

router.use(
  "/superadmin/audit-logs",
  require("./superadmin/auditLogRoutes")
);

// ============================================
// EXPORT ROUTER
// ============================================

module.exports = router;