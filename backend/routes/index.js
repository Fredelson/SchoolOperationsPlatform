// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Central API Route Registry
//
// Purpose:
// - Register all API endpoints
// - Keep app.js clean
// - Organize modules by feature
// ============================================

const express = require("express");
const router = express.Router();

// ============================================
// Authentication
// ============================================

router.use("/auth", require("./auth/authRoutes"));

// ============================================
// User Management
// ============================================

router.use("/users", require("./users/userRoutes"));
router.use("/admin", require("./users/userImportRoutes"));

// ============================================
// Request Workflow
// Teacher → HOD → HOS → Printing
// ============================================

router.use("/requests", require("./requests/requestRoutes"));
router.use("/hod", require("./requests/hodRoutes"));
router.use("/hos", require("./requests/hosRoutes"));
router.use("/limits", require("./requests/limitRoutes"));
router.use("/distributions", require("./requests/distributionRoutes"));

// ============================================
// Teacher Module
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
// Printing Module
// ============================================

router.use("/printing", require("./printing/printingRoutes"));
router.use("/paper-stock", require("./printing/paperStockRoutes"));
router.use("/purchases", require("./printing/purchaseRoutes"));

// ============================================
// Uploads
// ============================================

router.use("/uploads", require("./uploads/uploadRoutes"));

// ============================================
// Master Data
// ============================================

router.use("/master", require("./master/masterRoutes"));
router.use("/lookups", require("./lookups/lookupRoutes"));
router.use("/access-levels", require("./security/accessLevelRoutes"));

// ============================================
// Super Admin
// ============================================

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
// Export Router
// ============================================

module.exports = router;