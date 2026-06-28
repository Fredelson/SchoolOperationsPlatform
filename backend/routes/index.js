// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Central API Route Registry
// ============================================
//
// Purpose:
// - Register all platform API endpoints.
// - Keep app.js clean.
// - Separate modern feature modules from
//   legacy routes still awaiting migration.
//
// Architecture:
//
// server.js
//      ↓
// app.js
//      ↓
// routes/index.js
//      ↓
// Feature Modules / Legacy Routes
//
// Rules:
// - Register routers only.
// - No SQL.
// - No business logic.
// - No middleware logic.
// ============================================

const express = require("express");

const router = express.Router();

// ============================================================
// MODERN FEATURE MODULES (Repository → Service → Controller)
// ============================================================
//
// These modules have already been migrated to the new
// enterprise architecture.
// ============================================================

router.use("/auth", require("../modules/auth"));
router.use("/users", require("../modules/users"));
router.use("/lookups", require("../modules/lookups"));
router.use("/assignments", require("../modules/assignments"));
router.use("/roles", require("../modules/roles"));
router.use("/permissions", require("../modules/permissions"));

// ============================================================
// SECURITY MODULES
// ============================================================
//
// These will gradually migrate into modules/security.
// ============================================================

router.use("/access-levels", require("./security/accessLevelRoutes"));

// ============================================================
// USER IMPORT
// ============================================================
//
// Temporary legacy endpoint.
//
// Planned Migration:
// modules/users/import
// ============================================================

router.use("/admin", require("./users/userImportRoutes"));

// ============================================================
// REQUEST WORKFLOW (Legacy)
// ============================================================
//
// Teacher
//      ↓
// HOD
//      ↓
// HOS
//      ↓
// Printing
//
// Planned Migration:
//
// modules/requests
// ============================================================

router.use("/requests", require("./requests/requestRoutes"));
router.use("/hod", require("./requests/hodRoutes"));
router.use("/hos", require("./requests/hosRoutes"));
router.use("/limits", require("./requests/limitRoutes"));
router.use("/distributions", require("./requests/distributionRoutes"));

// ============================================================
// TEACHER MODULE (Legacy)
// ============================================================
//
// Planned Migration:
//
// modules/teacher
// ============================================================

router.use(
    "/teacher/dashboard",
    require("./teacher/teacherDashboardRoutes")
);

router.use(
    "/teacher/reports",
    require("./teacher/teacherReportRoutes")
);

// ============================================================
// PRINTING MODULE (Legacy)
// ============================================================
//
// Planned Migration:
//
// modules/printing
// ============================================================

router.use("/printing", require("./printing/printingRoutes"));
router.use("/paper-stock", require("./printing/paperStockRoutes"));
router.use("/purchases", require("./printing/purchaseRoutes"));

// ============================================================
// FILE UPLOADS
// ============================================================

router.use("/uploads", require("./uploads/uploadRoutes"));

// ============================================================
// MASTER DATA (Legacy)
// ============================================================
//
// Planned Migration:
//
// modules/master
// ============================================================

router.use("/master", require("./master/masterRoutes"));

// ============================================================
// SUPER ADMIN FOUNDATION (Legacy)
// ============================================================
//
// Planned Migration:
//
// modules/super-admin
//
// Important:
// The new modern /api/permissions route is already registered above.
// The legacy /api/superadmin/permissions route remains untouched
// to avoid breaking existing frontend pages.
// ============================================================

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

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;