// ============================================
// ARAB UNITY SCHOOL
// Super Admin Dashboard Controller
// Executive Dashboard API
// ============================================

const { poolPromise } = require("../../config/db");

// ============================================
// @desc    Get Super Admin Dashboard Data
// @route   GET /api/superadmin/dashboard
// @access  SuperAdmin
// ============================================

const getDashboard = async (req, res) => {
  try {
    const pool = await poolPromise;

    // ============================================
    // Total Users
    // ============================================

    const totalUsersResult = await pool.request().query(`
      SELECT COUNT(*) AS TotalUsers
      FROM Users
      WHERE IsActive = 1
    `);

    // ============================================
    // Modules
    // ============================================

    const modulesResult = await pool.request().query(`
      SELECT
        COUNT(*) AS TotalModules,
        SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveModules
      FROM Modules
    `);

    // ============================================
    // Permissions
    // ============================================

    const permissionsResult = await pool.request().query(`
      SELECT COUNT(*) AS TotalPermissions
      FROM Permissions
    `);

    // ============================================
    // Roles
    // ============================================

    const rolesResult = await pool.request().query(`
      SELECT COUNT(*) AS TotalRoles
      FROM Roles
      WHERE IsActive = 1
    `);

    // ============================================
    // Feature Flags
    // ============================================

    const featureFlagsResult = await pool.request().query(`
      SELECT
        COUNT(*) AS TotalFeatureFlags,
        SUM(CASE WHEN IsEnabled = 1 THEN 1 ELSE 0 END) AS EnabledFeatureFlags
      FROM FeatureFlags
    `);

    // ============================================
    // Menus
    // ============================================

    const menusResult = await pool.request().query(`
      SELECT COUNT(*) AS TotalMenus
      FROM Menus
      WHERE IsActive = 1
    `);

    // ============================================
    // Widgets
    // ============================================

    const widgetsResult = await pool.request().query(`
      SELECT COUNT(*) AS TotalWidgets
      FROM Widgets
      WHERE IsActive = 1
    `);

    // ============================================
    // Audit Logs
    // ============================================

    const auditLogsResult = await pool.request().query(`
      SELECT TOP 10
        AuditId,
        Action,
        ModuleKey,
        CreatedAt
      FROM AuditLogs
      ORDER BY CreatedAt DESC
    `);

    // ============================================
    // Recent Modules
    // ============================================

    const recentModulesResult = await pool.request().query(`
      SELECT TOP 10
        ModuleName,
        Status,
        CreatedAt
      FROM Modules
      ORDER BY CreatedAt DESC
    `);

    return res.status(200).json({
      kpis: {
        totalUsers:
          totalUsersResult.recordset[0]?.TotalUsers || 0,

        totalModules:
          modulesResult.recordset[0]?.TotalModules || 0,

        activeModules:
          modulesResult.recordset[0]?.ActiveModules || 0,

        totalPermissions:
          permissionsResult.recordset[0]?.TotalPermissions || 0,

        totalRoles:
          rolesResult.recordset[0]?.TotalRoles || 0,

        totalMenus:
          menusResult.recordset[0]?.TotalMenus || 0,

        totalWidgets:
          widgetsResult.recordset[0]?.TotalWidgets || 0,

        totalFeatureFlags:
          featureFlagsResult.recordset[0]?.TotalFeatureFlags || 0,

        enabledFeatureFlags:
          featureFlagsResult.recordset[0]?.EnabledFeatureFlags || 0,
      },

      recentAuditLogs: auditLogsResult.recordset,

      recentModules: recentModulesResult.recordset,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);

    return res.status(500).json({
      message: "Failed to load dashboard.",
    });
  }
};

module.exports = {
  getDashboard,
};
