// ============================================
// ARAB UNITY SCHOOL
// Central API Route Registry
//
// Purpose:
// - Register all API routes in one place
// - Keep app.js clean
// - Make future modules easier to add
// ============================================

const express = require("express");
const router = express.Router();

// Core routes
router.use("/auth", require("./auth/authRoutes"));
router.use("/requests", require("./requestRoutes"));
router.use("/hod", require("./hodRoutes"));
router.use("/hos", require("./hosRoutes"));
router.use("/lookups", require("./lookups/lookupRoutes"));
router.use("/users", require("./users/userRoutes"));

// Teacher routes
router.use("/teacher/dashboard", require("./teacherDashboardRoutes"));
router.use("/teacher/reports", require("./teacherReportRoutes"));

// Printing routes
router.use("/printing", require("./printingRoutes"));
router.use("/distributions", require("./distributionRoutes"));
router.use("/admin", require("./userImportRoutes"));
router.use("/limits", require("./limitRoutes"));
router.use("/paper-stock", require("./paperStockRoutes"));
router.use("/purchases", require("./purchaseRoutes"));
router.use("/uploads", require("./uploadRoutes"));
router.use("/master", require("./master/masterRoutes"));
router.use("/access-levels", require("./accessLevelRoutes"));

// Super Admin routes
router.use(
  "/superadmin/permissions",
  require("./superadmin/permissionRoutes")
);

router.use(
  "/superadmin/menus",
  require("./superadmin/menuRoutes")
);

router.use(
  "/superadmin/modules",
  require("./superadmin/moduleRoutes")
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
  "/superadmin/widgets",
  require("./superadmin/widgetRoutes")
);

router.use(
  "/superadmin/audit-logs",
  require("./superadmin/auditLogRoutes")
);

router.use(
  "/superadmin/dashboard",
  require("./superadmin/dashboardRoutes")
);

router.use(
  "/superadmin/roles",
  require("./superadmin/roleRoutes")
);

router.use(
  "/superadmin/user-overrides",
  require("./superadmin/userPermissionOverrideRoutes")
);

router.use(
  "/superadmin/buttons",
  require("./superadmin/buttonRoutes")
);

module.exports = router;