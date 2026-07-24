// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Central API Route Registry
// ============================================
//
// Purpose:
// Registers all API route groups and keeps app.js clean.
//
// Flow:
// server.js → app.js → routes/index.js → modules/routes
//
// Rules:
// - Register routers only
// - No SQL
// - No business logic
// - No middleware logic
// ============================================

const express = require("express");

const router = express.Router();

// ============================================================
// MODERN FEATURE MODULES
// ============================================================

router.use("/auth", require("../modules/auth"));
router.use("/users", require("../modules/users"));
router.use("/lookups", require("../modules/lookups"));

router.use("/it-assets", require("../modules/itAssets"));

router.use("/library", require("../modules/library"));

router.use("/roles", require("../modules/roles"));
router.use("/assignments", require("../modules/assignments"));
router.use("/permission-resolver", require("../modules/permissionResolver"));
router.use("/user-permission-overrides", require("../modules/userPermissionOverrides"));

router.use(
  "/workspace-manager",
  require("../modules/workspaceManager")
);
router.use(
  "/dashboard-manager",
  require("../modules/dashboardManager")
);

router.use("/navigation", require("../modules/navigation"));
router.use("/modules", require("../modules/modules"));
router.use("/menus", require("../modules/menus"));

// ============================================================
// PLATFORM FOUNDATION
// ============================================================

router.use("/system", require("../modules/system"));

// ============================================================
// USER IMPORT
// ============================================================

router.use("/admin", require("./users/userImportRoutes"));

// ============================================================
// REQUEST WORKFLOW
// ============================================================

router.use("/requests", require("./requests/requestRoutes"));
router.use("/hod", require("./requests/hodRoutes"));
router.use("/hos", require("./requests/hosRoutes"));
router.use("/limits", require("./requests/limitRoutes"));
router.use("/distributions", require("./requests/distributionRoutes"));

// Printing Management owns request creation, approvals, queue, configuration,
// inventory, limits, purchases, distributions, and reporting.
router.use("/printing", require("../modules/printing"));

// ============================================================
// TEACHER MODULE
// ============================================================

router.use("/teacher/dashboard", require("./teacher/teacherDashboardRoutes"));
router.use("/teacher/reports", require("./teacher/teacherReportRoutes"));

// ============================================================
// FILE UPLOADS
// ============================================================

router.use("/uploads", require("./uploads/uploadRoutes"));

// ============================================================
// MASTER DATA
// ============================================================

router.use("/master", require("./master/masterRoutes"));

// ============================================================
// SUPER ADMIN FOUNDATION - LEGACY ROUTES
// ============================================================

router.use("/superadmin/dashboard", require("./superadmin/dashboardRoutes"));
router.use("/superadmin/modules", require("./superadmin/moduleRoutes"));
router.use("/superadmin/roles", require("./superadmin/roleRoutes"));
router.use(
  "/superadmin/system-settings",
  require("./superadmin/systemSettingsRoutes")
);
router.use("/superadmin/audit-logs", require("./superadmin/auditLogRoutes"));

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
