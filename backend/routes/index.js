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
//
// Migrated modules using:
// Repository → Service → Controller → Routes
// ============================================================

router.use("/auth", require("../modules/auth"));
router.use("/users", require("../modules/users"));
router.use("/lookups", require("../modules/lookups"));
router.use("/assignments", require("../modules/assignments"));
router.use("/roles", require("../modules/roles"));
router.use("/permissions", require("../modules/permissions"));
router.use("/role-permissions", require("../modules/rolePermissions"));
router.use("/navigation", require("../modules/navigation"));

router.use(
  "/user-permission-overrides",
  require("../modules/userPermissionOverrides/routes/userPermissionOverrideRoutes")
);

router.use(
  "/permission-resolver",
  require("../modules/permissionResolver/routes/permissionResolverRoutes")
);

// ============================================================
// PLATFORM FOUNDATION
// ============================================================
//
// Shared system services used by all modules.
// Current: Organization + Branding
// Future: Themes, Settings, Notifications, File Storage
// ============================================================

router.use("/system", require("../modules/system"));


// ============================================================
// SECURITY MODULES
// ============================================================
//
// Temporary legacy routes.
// Planned migration: modules/security
// ============================================================

router.use("/access-levels", require("./security/accessLevelRoutes"));

// ============================================================
// USER IMPORT
// ============================================================
//
// Temporary legacy endpoint.
// Planned migration: modules/users/import
// ============================================================

router.use("/admin", require("./users/userImportRoutes"));

// ============================================================
// REQUEST WORKFLOW
// ============================================================
//
// Temporary legacy routes for:
// Teacher → HOD → HOS → Printing
//
// Planned migration: modules/requests
// ============================================================

router.use("/requests", require("./requests/requestRoutes"));
router.use("/hod", require("./requests/hodRoutes"));
router.use("/hos", require("./requests/hosRoutes"));
router.use("/limits", require("./requests/limitRoutes"));
router.use("/distributions", require("./requests/distributionRoutes"));

// ============================================================
// TEACHER MODULE
// ============================================================
//
// Temporary legacy teacher routes.
// Planned migration: modules/teacher
// ============================================================

router.use("/teacher/dashboard", require("./teacher/teacherDashboardRoutes"));
router.use("/teacher/reports", require("./teacher/teacherReportRoutes"));

// ============================================================
// PRINTING MODULE
// ============================================================
//
// Modern printing route is active.
// Some paper stock and purchase routes remain legacy.
// ============================================================

router.use("/printing", require("../modules/printing/routes/printingRoutes"));

// Legacy routes still active until fully migrated
router.use("/paper-stock", require("./printing/paperStockRoutes"));
router.use("/purchases", require("./printing/purchaseRoutes"));

// ============================================================
// FILE UPLOADS
// ============================================================

router.use("/uploads", require("./uploads/uploadRoutes"));

// ============================================================
// MASTER DATA
// ============================================================
//
// Temporary legacy route.
// Planned migration: modules/master
// ============================================================

router.use("/master", require("./master/masterRoutes"));

// ============================================================
// SUPER ADMIN FOUNDATION
// ============================================================
//
// Temporary legacy Super Admin routes.
// These remain untouched to avoid breaking existing frontend pages.
// ============================================================

router.use("/superadmin/dashboard", require("./superadmin/dashboardRoutes"));
router.use("/superadmin/modules", require("./superadmin/moduleRoutes"));
router.use("/superadmin/permissions", require("./superadmin/permissionRoutes"));
router.use(
  "/superadmin/user-overrides",
  require("./superadmin/userPermissionOverrideRoutes")
);
router.use("/superadmin/roles", require("./superadmin/roleRoutes"));
router.use("/superadmin/menus", require("./superadmin/menuRoutes"));
router.use("/superadmin/buttons", require("./superadmin/buttonRoutes"));
router.use("/superadmin/widgets", require("./superadmin/widgetRoutes"));
router.use("/superadmin/feature-flags", require("./superadmin/featureFlagRoutes"));
router.use(
  "/superadmin/system-settings",
  require("./superadmin/systemSettingsRoutes")
);
router.use("/superadmin/audit-logs", require("./superadmin/auditLogRoutes"));

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;