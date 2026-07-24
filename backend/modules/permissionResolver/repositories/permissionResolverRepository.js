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

async function getActiveAssignmentPermissions(userId) {
  const result = await executeQuery(
    `
      WITH ActiveAssignments AS (
        SELECT
          ua.AssignmentTypeId,
          at.AssignmentKey,
          CASE at.AssignmentKey
            WHEN 'TEACHING_ASSISTANT' THEN 'Teacher'
            WHEN 'IT_COORDINATOR' THEN 'ITAdmin'
            WHEN 'PRINTING_COORDINATOR' THEN 'PrintingAdmin'
            ELSE at.AssignmentKey
          END AS CompatibilityRoleKey
        FROM dbo.UserAssignments ua
        INNER JOIN dbo.AssignmentTypes at
          ON at.AssignmentTypeId = ua.AssignmentTypeId
          AND at.IsActive = 1
        WHERE ua.UserId = @UserId
          AND ua.IsActive = 1
          AND (ua.StartDate IS NULL OR ua.StartDate <= CAST(GETDATE() AS date))
          AND (ua.EndDate IS NULL OR ua.EndDate >= CAST(GETDATE() AS date))
      )
      SELECT DISTINCT
        p.PermissionId,
        p.PermissionKey,
        p.PermissionName,
        p.ModuleId,
        assignment.AssignmentKey,
        r.RoleKey AS CompatibilityRoleKey
      FROM ActiveAssignments assignment
      INNER JOIN dbo.Roles r
        ON REPLACE(REPLACE(REPLACE(LOWER(r.RoleKey), '-', ''), '_', ''), ' ', '') =
           REPLACE(REPLACE(REPLACE(LOWER(assignment.CompatibilityRoleKey), '-', ''), '_', ''), ' ', '')
        AND r.IsActive = 1
      INNER JOIN dbo.RolePermissions rp
        ON rp.RoleId = r.RoleId
        AND rp.IsAllowed = 1
      INNER JOIN dbo.Permissions p
        ON p.PermissionId = rp.PermissionId
        AND p.IsActive = 1

      UNION

      SELECT DISTINCT
        p.PermissionId,
        p.PermissionKey,
        p.PermissionName,
        p.ModuleId,
        assignment.AssignmentKey,
        NULL AS CompatibilityRoleKey
      FROM ActiveAssignments assignment
      INNER JOIN dbo.AssignmentTypeWorkspaces atw
        ON atw.AssignmentTypeId = assignment.AssignmentTypeId
        AND atw.IsActive = 1
      INNER JOIN dbo.Workspaces w
        ON w.WorkspaceId = atw.WorkspaceId
        AND w.IsActive = 1
      INNER JOIN dbo.Menus m
        ON m.Route = w.DefaultRoute
      INNER JOIN dbo.Permissions p
        ON p.PermissionId = m.PermissionId
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

async function getActiveAssignmentScopes(userId) {
  const result = await executeQuery(`SELECT ua.UserAssignmentId,ua.AssignmentTypeId,at.AssignmentKey,at.AssignmentName,ua.IsPrimary,s.ScopeType,s.ScopeEntityId FROM dbo.UserAssignments ua INNER JOIN dbo.AssignmentTypes at ON at.AssignmentTypeId=ua.AssignmentTypeId AND at.IsActive=1 INNER JOIN dbo.UserAssignmentScopes s ON s.UserAssignmentId=ua.UserAssignmentId AND s.IsActive=1 WHERE ua.UserId=@UserId AND ua.IsActive=1 AND (ua.StartDate IS NULL OR ua.StartDate<=CAST(GETDATE() AS date)) AND (ua.EndDate IS NULL OR ua.EndDate>=CAST(GETDATE() AS date)) ORDER BY ua.IsPrimary DESC,ua.UserAssignmentId,s.ScopeType,s.ScopeEntityId;`, [{name:"UserId",type:sql.Int,value:userId}]);
  return rows(result);
}

// ============================================================
// Export Repository Functions
// ============================================================

module.exports = {
  getUserSecurityProfile,
  getRolePermissions,
  getUserPermissionOverrides,
  getActiveAssignmentPermissions,
  getActiveAssignmentScopes,
};
