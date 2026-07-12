// backend/modules/auth/repositories/authRepository.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Auth Repository
 * ============================================================
 *
 * Purpose:
 * Handles database access for authentication.
 *
 * Source of Truth:
 * OperationsPlatformDB schema.
 *
 * Important Schema Notes:
 * - dbo.Users stores RoleId, not Role.
 * - dbo.Roles stores RoleKey, RoleName, DisplayName.
 * - Subjects are not stored directly in dbo.Users.
 * - Subject assignments belong to assignment tables and should not
 *   be queried inside basic login.
 * ============================================================
 */

const { query, sql } = require("../../../database");

/**
 * Finds an active, non-deleted user by Employee ID.
 *
 * Used by:
 * POST /api/auth/login
 *
 * @param {string} employeeId - Employee ID entered by user.
 * @returns {Promise<object|null>} User auth record or null.
 */
async function findActiveUserByEmployeeId(employeeId) {
  const result = await query(
    `
    SELECT
      u.UserId,
      u.EmployeeId,
      u.FullName,
      u.SchoolEmail,
      u.PersonalEmail,
      u.MobileNumber,
      u.PasswordHash,
      u.RoleId,
      r.RoleKey,
      r.RoleName,
      r.DisplayName AS RoleDisplayName,
      r.IsProtected AS IsProtectedRole,
      u.DepartmentId,
      d.DepartmentName,
      u.SectionId,
      s.SectionName,
      COALESCE((SELECT TOP 1 atw.WorkspaceId FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 WHERE ua.UserId=u.UserId AND ua.IsActive=1 AND ua.IsPrimary=1),u.DefaultWorkspaceId) DefaultWorkspaceId,
      COALESCE((SELECT TOP 1 w.DefaultRoute FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 JOIN dbo.Workspaces w ON w.WorkspaceId=atw.WorkspaceId WHERE ua.UserId=u.UserId AND ua.IsActive=1 AND ua.IsPrimary=1),(SELECT DefaultRoute FROM dbo.Workspaces WHERE WorkspaceId=u.DefaultWorkspaceId),(SELECT TOP 1 w.DefaultRoute FROM dbo.WorkspaceRoles wr JOIN dbo.Workspaces w ON w.WorkspaceId=wr.WorkspaceId WHERE wr.RoleId=u.RoleId AND w.IsActive=1 ORDER BY wr.IsDefault DESC,w.SortOrder)) AS DefaultWorkspaceRoute,
      u.LegacyRole,
      u.MustChangePassword,
      u.EmailVerified,
      u.IsRegistrationCompleted,
      u.IsActive,
      u.IsLocked,
      u.FailedLoginAttempts,
      u.LockedUntil,
      u.LastLoginAt
    FROM dbo.Users u
    INNER JOIN dbo.Roles r
      ON u.RoleId = r.RoleId
    LEFT JOIN dbo.Departments d
      ON u.DepartmentId = d.DepartmentId
    LEFT JOIN dbo.Sections s
      ON u.SectionId = s.SectionId
    WHERE u.EmployeeId = @EmployeeId
      AND u.IsActive = 1
      AND ISNULL(u.IsDeleted, 0) = 0
      AND r.IsActive = 1
    `,
    [
      {
        name: "EmployeeId",
        type: sql.NVarChar,
        value: employeeId,
      },
    ]
  );

  return result.recordset[0] || null;
}

/**
 * Finds an active, non-deleted user by User ID.
 *
 * Used by:
 * GET /api/auth/me
 *
 * @param {number} userId - User ID from verified JWT.
 * @returns {Promise<object|null>} User profile record or null.
 */
async function findActiveUserById(userId) {
  const result = await query(
    `
    SELECT
      u.UserId,
      u.EmployeeId,
      u.FullName,
      u.SchoolEmail,
      u.PersonalEmail,
      u.MobileNumber,
      u.RoleId,
      r.RoleKey,
      r.RoleName,
      r.DisplayName AS RoleDisplayName,
      r.IsProtected AS IsProtectedRole,
      u.DepartmentId,
      d.DepartmentName,
      u.SectionId,
      s.SectionName,
      COALESCE((SELECT TOP 1 atw.WorkspaceId FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 WHERE ua.UserId=u.UserId AND ua.IsActive=1 AND ua.IsPrimary=1),u.DefaultWorkspaceId) DefaultWorkspaceId,
      COALESCE((SELECT TOP 1 w.DefaultRoute FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 JOIN dbo.Workspaces w ON w.WorkspaceId=atw.WorkspaceId WHERE ua.UserId=u.UserId AND ua.IsActive=1 AND ua.IsPrimary=1),(SELECT DefaultRoute FROM dbo.Workspaces WHERE WorkspaceId=u.DefaultWorkspaceId),(SELECT TOP 1 w.DefaultRoute FROM dbo.WorkspaceRoles wr JOIN dbo.Workspaces w ON w.WorkspaceId=wr.WorkspaceId WHERE wr.RoleId=u.RoleId AND w.IsActive=1 ORDER BY wr.IsDefault DESC,w.SortOrder)) AS DefaultWorkspaceRoute,
      u.LegacyRole,
      u.MustChangePassword,
      u.EmailVerified,
      u.IsRegistrationCompleted,
      u.IsActive,
      u.IsLocked,
      u.FailedLoginAttempts,
      u.LockedUntil,
      u.LastLoginAt
    FROM dbo.Users u
    INNER JOIN dbo.Roles r
      ON u.RoleId = r.RoleId
    LEFT JOIN dbo.Departments d
      ON u.DepartmentId = d.DepartmentId
    LEFT JOIN dbo.Sections s
      ON u.SectionId = s.SectionId
    WHERE u.UserId = @UserId
      AND u.IsActive = 1
      AND ISNULL(u.IsDeleted, 0) = 0
      AND r.IsActive = 1
    `,
    [
      {
        name: "UserId",
        type: sql.Int,
        value: userId,
      },
    ]
  );

  return result.recordset[0] || null;
}

/**
 * Updates successful login tracking fields.
 *
 * Used after password validation succeeds.
 *
 * @param {number} userId - Authenticated user ID.
 * @returns {Promise<void>}
 */
async function markLoginSuccess(userId) {
  await query(
    `
    UPDATE dbo.Users
    SET
      LastLoginAt = GETDATE(),
      FailedLoginAttempts = 0,
      LockedUntil = NULL,
      UpdatedAt = GETDATE()
    WHERE UserId = @UserId
    `,
    [
      {
        name: "UserId",
        type: sql.Int,
        value: userId,
      },
    ]
  );
}
async function getActiveAssignmentScopes(userId){const result=await query(`SELECT ua.UserAssignmentId,at.AssignmentKey,at.AssignmentName,ua.IsPrimary,s.ScopeType,s.ScopeEntityId FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypes at ON at.AssignmentTypeId=ua.AssignmentTypeId LEFT JOIN dbo.UserAssignmentScopes s ON s.UserAssignmentId=ua.UserAssignmentId AND s.IsActive=1 WHERE ua.UserId=@UserId AND ua.IsActive=1 ORDER BY ua.IsPrimary DESC,ua.CreatedAt,s.ScopeType;`,[{name:"UserId",type:sql.Int,value:userId}]);return result.recordset;}

module.exports = {
  findActiveUserByEmployeeId,
  findActiveUserById,
  markLoginSuccess,
  getActiveAssignmentScopes,
};
