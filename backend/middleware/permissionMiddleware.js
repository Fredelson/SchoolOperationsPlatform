// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Permission Middleware
//
// Purpose:
// - Check if the logged-in user has a specific permission
// - Support role-based permissions
// - Support user-level permission overrides
//
// Example Usage:
// router.get(
//   "/users",
//   protect,
//   requirePermission("User.View"),
//   controller.getUsers
// );
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../config/db");

// ============================================
// Middleware: Require Permission
// ============================================

const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      // User ID comes from authMiddleware after JWT verification
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. User not found in token.",
        });
      }

      // Connect to SQL Server
      const pool = await poolPromise;

      // Check permission from:
      // 1. UserPermissionOverrides first
      // 2. RolePermissions second
      // 3. Deny access if neither exists
      const result = await pool
        .request()
        .input("UserId", sql.Int, userId)
        .input("PermissionKey", sql.NVarChar(100), permissionKey)
        .query(`
          SELECT TOP 1
            CASE
              WHEN upo.IsAllowed IS NOT NULL THEN upo.IsAllowed
              WHEN rp.IsAllowed IS NOT NULL THEN rp.IsAllowed
              ELSE 0
            END AS HasPermission
          FROM Users u
          LEFT JOIN Roles r
            ON r.RoleKey = u.Role
          LEFT JOIN Permissions p
            ON p.PermissionKey = @PermissionKey
          LEFT JOIN RolePermissions rp
            ON rp.RoleId = r.RoleId
           AND rp.PermissionId = p.PermissionId
          LEFT JOIN UserPermissionOverrides upo
            ON upo.UserId = u.UserId
           AND upo.PermissionId = p.PermissionId
          WHERE u.UserId = @UserId
            AND u.IsActive = 1
        `);

      // SQL bit may return true/false or 1/0 depending on driver behavior
      const hasPermission =
        result.recordset[0]?.HasPermission === true ||
        result.recordset[0]?.HasPermission === 1;

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Missing permission.",
          requiredPermission: permissionKey,
        });
      }

      // Permission granted
      next();
    } catch (error) {
      console.error("Permission middleware error:", error);

      return res.status(500).json({
        success: false,
        message: "Permission check failed.",
      });
    }
  };
};

// ============================================
// Exports
// ============================================

module.exports = {
  requirePermission,
};