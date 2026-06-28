// ============================================================
// Arab Unity School Operations Platform
// Permission Resolver Repository
// ============================================================
//
// Purpose:
// Reads permission data required to calculate a user's effective
// permissions.
//
// Architecture:
// Repository Layer
//
// Rules:
// - SQL only
// - No business logic
// - No validation
// - No HTTP handling
//
// Source of Truth:
// OperationsPlatformDB
//
// Tables Used:
// - dbo.Users
// - dbo.Roles
// - dbo.Permissions
// - dbo.RolePermissions
// - dbo.UserPermissionOverrides
// ============================================================

const {
  sql,
  executeQuery,
  rows,
  firstOrNull,
} = require("../../../shared/database");

// ============================================================
// Get User Security Profile
// ============================================================
//
// Purpose:
// Returns the user's role and active status.
// This is the starting point for permission resolution.
// ============================================================

async function getUserSecurityProfile(userId) {
  const result = await executeQuery(
    `
      SELECT
        u.UserId,
        u.FullName,
        u.EmployeeId,
        u.SchoolEmail,
        u.RoleId,
        r.RoleKey,
        r.RoleName,
        u.IsActive,
        u.IsLocked
      FROM dbo.Users u
      INNER JOIN dbo.Roles r
        ON u.RoleId = r.RoleId
      WHERE u.UserId = @UserId;
    `,
    [
      {
        name: "UserId",
        type: sql.Int,
        value: userId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Get Role Permissions By Role
// ============================================================
//
// Purpose:
// Returns all active permissions assigned to the user's role.
// ============================================================

async function getRolePermissions(roleId) {
  const result = await executeQuery(
    `
      SELECT
        p.PermissionId,
        p.PermissionKey,
        p.PermissionName,
        p.ModuleId,
        p.PermissionGroupId,
        rp.IsAllowed
      FROM dbo.RolePermissions rp
      INNER JOIN dbo.Permissions p
        ON rp.PermissionId = p.PermissionId
      WHERE rp.RoleId = @RoleId
        AND p.IsActive = 1;
    `,
    [
      {
        name: "RoleId",
        type: sql.Int,
        value: roleId,
      },
    ]
  );

  return rows(result);
}

// ============================================================
// Get User Permission Overrides
// ============================================================
//
// Purpose:
// Returns user-specific allow/deny overrides.
// These override the role permission result.
// ============================================================

async function getUserPermissionOverrides(userId) {
  const result = await executeQuery(
    `
      SELECT
        p.PermissionId,
        p.PermissionKey,
        p.PermissionName,
        p.ModuleId,
        p.PermissionGroupId,
        upo.IsAllowed,
        upo.Reason,
        upo.CreatedAt
      FROM dbo.UserPermissionOverrides upo
      INNER JOIN dbo.Permissions p
        ON upo.PermissionId = p.PermissionId
      WHERE upo.UserId = @UserId
        AND p.IsActive = 1;
    `,
    [
      {
        name: "UserId",
        type: sql.Int,
        value: userId,
      },
    ]
  );

  return rows(result);
}

// ============================================================
// Export Repository Functions
// ============================================================

module.exports = {
  getUserSecurityProfile,
  getRolePermissions,
  getUserPermissionOverrides,
};