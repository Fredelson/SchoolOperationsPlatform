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
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. User not found in token.",
        });
      }

      const pool = await poolPromise;

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
// Middleware: Require Active Workspace
// ============================================
// For workspace users (teacher, hod, hos, library, etc.)
// Access is controlled by workspace assignment + IsVisible/IsEnabled
// NOT by module-specific permission keys.

const requireActiveWorkspace = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not found in token.",
      });
    }

    const pool = await poolPromise;

    const userResult = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT r.RoleKey
        FROM dbo.Users u
        JOIN dbo.Roles r ON r.RoleId = u.RoleId
        WHERE u.UserId = @UserId
      `);

    const roleKey = userResult.recordset[0]?.RoleKey || "";
    const normalizedRoleKey = String(roleKey)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/-/g, "")
      .replace(/_/g, "");

    if (normalizedRoleKey === "superadmin" || normalizedRoleKey === "platformadmin") {
      return next();
    }

    const result = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .query(`
        DECLARE @WorkspaceId int = COALESCE(
          (SELECT TOP 1 atw.WorkspaceId FROM dbo.UserAssignments ua 
           JOIN dbo.AssignmentTypes at ON at.AssignmentTypeId=ua.AssignmentTypeId AND at.IsActive=1 
           JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 
           JOIN dbo.Workspaces aw ON aw.WorkspaceId=atw.WorkspaceId AND aw.IsActive=1 
           WHERE ua.UserId=@UserId AND ua.IsActive=1 AND ua.IsPrimary=1 
           AND (ua.StartDate IS NULL OR ua.StartDate<=CAST(GETDATE() AS date)) 
           AND (ua.EndDate IS NULL OR ua.EndDate>=CAST(GETDATE() AS date)) 
           ORDER BY ua.UpdatedAt DESC,ua.CreatedAt DESC,ua.UserAssignmentId DESC),
          (SELECT TOP 1 wr.WorkspaceId FROM dbo.Users u 
           JOIN dbo.WorkspaceRoles wr ON wr.RoleId=u.RoleId
           JOIN dbo.Workspaces w ON w.WorkspaceId=wr.WorkspaceId AND w.IsActive=1
           WHERE u.UserId=@UserId ORDER BY wr.IsDefault DESC,w.SortOrder),
          (SELECT TOP 1 WorkspaceId FROM dbo.Workspaces WHERE IsDefault=1 AND IsActive=1)
        );

        SELECT @WorkspaceId AS WorkspaceId;
      `);

    const workspaceId = result.recordset[0]?.WorkspaceId;

    if (!workspaceId) {
      return res.status(403).json({
        success: false,
        message: "No active workspace assigned.",
      });
    }

    req.workspaceId = workspaceId;
    next();
  } catch (error) {
    console.error("Workspace middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Workspace check failed.",
    });
  }
};

// ============================================
// Exports
// ============================================

module.exports = {
  requirePermission,
  requireActiveWorkspace,
};