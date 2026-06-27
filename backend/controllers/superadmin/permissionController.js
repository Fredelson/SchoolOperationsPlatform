// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Permission Controller
// Handles current user permissions,
// grouped permissions, and role permission data
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../../config/db");

// ============================================
// @desc    Get logged-in user's final permissions
// @route   GET /api/superadmin/permissions/me
// @access  Logged-in users
// ============================================

const getMyPermissions = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized. User not found.",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT
          p.PermissionKey,
          p.PermissionName,
          p.ModuleKey,
          pg.GroupName,
          CASE
            WHEN upo.IsAllowed IS NOT NULL THEN upo.IsAllowed
            WHEN rp.IsAllowed IS NOT NULL THEN rp.IsAllowed
            ELSE 0
          END AS IsAllowed
        FROM Users u
        INNER JOIN Roles r
          ON r.RoleKey = u.Role
        CROSS JOIN Permissions p
        LEFT JOIN RolePermissions rp
          ON rp.RoleId = r.RoleId
         AND rp.PermissionId = p.PermissionId
        LEFT JOIN UserPermissionOverrides upo
          ON upo.UserId = u.UserId
         AND upo.PermissionId = p.PermissionId
        LEFT JOIN PermissionGroups pg
          ON pg.PermissionGroupId = p.PermissionGroupId
        WHERE u.UserId = @UserId
          AND u.IsActive = 1
          AND p.IsActive = 1
        ORDER BY pg.SortOrder, p.PermissionKey;
      `);

    return res.status(200).json({
      permissions: result.recordset,
    });
  } catch (error) {
    console.error("Get my permissions error:", error);
    return res.status(500).json({
      message: "Failed to load permissions.",
    });
  }
};

// ============================================
// @desc    Get all permissions grouped
// @route   GET /api/superadmin/permissions
// @access  SuperAdmin
// ============================================

const getAllPermissionsGrouped = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        pg.PermissionGroupId,
        pg.GroupKey,
        pg.GroupName,
        pg.SortOrder,
        p.PermissionId,
        p.PermissionKey,
        p.PermissionName,
        p.ModuleKey,
        p.Description,
        p.IsActive
      FROM PermissionGroups pg
      LEFT JOIN Permissions p
        ON p.PermissionGroupId = pg.PermissionGroupId
      ORDER BY pg.SortOrder, p.PermissionKey;
    `);

    return res.status(200).json({
      permissions: result.recordset,
    });
  } catch (error) {
    console.error("Get all permissions grouped error:", error);
    return res.status(500).json({
      message: "Failed to load grouped permissions.",
    });
  }
};

module.exports = {
  getMyPermissions,
  getAllPermissionsGrouped,
};
