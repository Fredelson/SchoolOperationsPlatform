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
router.use("/assignments", require("../modules/assignments"));

router.use("/roles", require("../modules/roles"));
router.use("/permissions", require("../modules/permissions"));
router.use("/permission-groups", require("../modules/permissionGroups"));
router.use("/role-permissions", require("../modules/rolePermissions"));
router.use(
  "/user-permission-overrides",
  require("../modules/userPermissionOverrides")
);
router.use(
  "/permission-resolver",
  require("../modules/permissionResolver")
);

router.use(
  "/navigation-manager",
  require("../modules/navigationManager")
);

router.use("/navigation", require("../modules/navigation"));
router.use("/modules", require("../modules/modules"));
router.use("/menus", require("../modules/menus"));
router.use("/buttons", require("../modules/buttons"));
router.use("/widgets", require("../modules/widgets"));
router.use(
  "/feature-flags",
  require("../modules/featureFlags/routes/featureFlagRoutes")
);

// ============================================================
// PLATFORM FOUNDATION
// ============================================================

router.use("/system", require("../modules/system"));

// ============================================================
// SECURITY MODULES
// ============================================================

router.use("/access-levels", require("./security/accessLevelRoutes"));

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

// ============================================================
// TEACHER MODULE
// ============================================================

router.use("/teacher/dashboard", require("./teacher/teacherDashboardRoutes"));
router.use("/teacher/reports", require("./teacher/teacherReportRoutes"));

// ============================================================
// PRINTING MODULE
// ============================================================

router.use("/printing", require("../modules/printing/routes/printingRoutes"));
router.use("/paper-stock", require("./printing/paperStockRoutes"));
router.use("/purchases", require("./printing/purchaseRoutes"));

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
router.use("/superadmin/permissions", require("./superadmin/permissionRoutes"));
router.use(
  "/superadmin/user-overrides",
  require("./superadmin/userPermissionOverrideRoutes")
);
router.use("/superadmin/roles", require("./superadmin/roleRoutes"));
router.use("/superadmin/buttons", require("./superadmin/buttonRoutes"));
router.use("/superadmin/widgets", require("./superadmin/widgetRoutes"));
router.use(
  "/superadmin/feature-flags",
  require("./superadmin/featureFlagRoutes")
);
router.use(
  "/superadmin/system-settings",
  require("./superadmin/systemSettingsRoutes")
);
router.use("/superadmin/audit-logs", require("./superadmin/auditLogRoutes"));

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;