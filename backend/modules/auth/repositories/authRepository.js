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
 * Finds an active, non-deleted user by employee ID, school email, or
 * personal email.
 *
 * Used by:
 * POST /api/auth/login
 *
 * @param {string} identifier - ID number or email entered by user.
 * @returns {Promise<object|null>} User auth record or null.
 */
async function findActiveUserByIdentifier(identifier) {
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
      COALESCE(assignmentWorkspace.WorkspaceId, roleWorkspace.WorkspaceId) AS DefaultWorkspaceId,
      COALESCE(assignmentWorkspace.WorkspaceName, roleWorkspace.WorkspaceName) AS DefaultWorkspaceName,
      COALESCE(assignmentWorkspace.DefaultRoute, roleWorkspace.DefaultRoute) AS DefaultWorkspaceRoute,
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
    OUTER APPLY (
      SELECT TOP 1
        w.WorkspaceId,
        w.WorkspaceName,
        w.DefaultRoute
      FROM dbo.UserAssignments ua
      INNER JOIN dbo.AssignmentTypes at
        ON at.AssignmentTypeId = ua.AssignmentTypeId
        AND at.IsActive = 1
      INNER JOIN dbo.AssignmentTypeWorkspaces atw
        ON atw.AssignmentTypeId = ua.AssignmentTypeId
        AND atw.IsActive = 1
      INNER JOIN dbo.Workspaces w
        ON w.WorkspaceId = atw.WorkspaceId
        AND w.IsActive = 1
      WHERE ua.UserId = u.UserId
        AND ua.IsActive = 1
        AND ua.IsPrimary = 1
        AND (ua.StartDate IS NULL OR ua.StartDate <= CAST(GETDATE() AS date))
        AND (ua.EndDate IS NULL OR ua.EndDate >= CAST(GETDATE() AS date))
      ORDER BY ua.UpdatedAt DESC, ua.CreatedAt DESC, ua.UserAssignmentId DESC
    ) assignmentWorkspace
    OUTER APPLY (
      SELECT TOP 1
        w.WorkspaceId,
        w.WorkspaceName,
        w.DefaultRoute
      FROM dbo.WorkspaceRoles wr
      INNER JOIN dbo.Workspaces w
        ON w.WorkspaceId = wr.WorkspaceId
        AND w.IsActive = 1
      WHERE wr.RoleId = u.RoleId
      ORDER BY wr.IsDefault DESC, w.SortOrder, w.WorkspaceId
    ) roleWorkspace
    WHERE (
        LTRIM(RTRIM(u.EmployeeId)) = LTRIM(RTRIM(@Identifier))
        OR LOWER(LTRIM(RTRIM(u.SchoolEmail))) = LOWER(LTRIM(RTRIM(@Identifier)))
        OR LOWER(LTRIM(RTRIM(u.PersonalEmail))) = LOWER(LTRIM(RTRIM(@Identifier)))
      )
      AND u.IsActive = 1
      AND ISNULL(u.IsDeleted, 0) = 0
      AND r.IsActive = 1
    `,
    [
      {
        name: "Identifier",
        type: sql.NVarChar,
        value: identifier,
      },
    ]
  );

  // Never select an arbitrary account if a bad import created an ambiguous
  // identifier across active users.
  return result.recordset.length === 1 ? result.recordset[0] : null;
}

// Keep the old repository name available for existing internal callers.
const findActiveUserByEmployeeId = findActiveUserByIdentifier;

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
      COALESCE(assignmentWorkspace.WorkspaceId, roleWorkspace.WorkspaceId) AS DefaultWorkspaceId,
      COALESCE(assignmentWorkspace.WorkspaceName, roleWorkspace.WorkspaceName) AS DefaultWorkspaceName,
      COALESCE(assignmentWorkspace.DefaultRoute, roleWorkspace.DefaultRoute) AS DefaultWorkspaceRoute,
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
    OUTER APPLY (
      SELECT TOP 1
        w.WorkspaceId,
        w.WorkspaceName,
        w.DefaultRoute
      FROM dbo.UserAssignments ua
      INNER JOIN dbo.AssignmentTypes at
        ON at.AssignmentTypeId = ua.AssignmentTypeId
        AND at.IsActive = 1
      INNER JOIN dbo.AssignmentTypeWorkspaces atw
        ON atw.AssignmentTypeId = ua.AssignmentTypeId
        AND atw.IsActive = 1
      INNER JOIN dbo.Workspaces w
        ON w.WorkspaceId = atw.WorkspaceId
        AND w.IsActive = 1
      WHERE ua.UserId = u.UserId
        AND ua.IsActive = 1
        AND ua.IsPrimary = 1
        AND (ua.StartDate IS NULL OR ua.StartDate <= CAST(GETDATE() AS date))
        AND (ua.EndDate IS NULL OR ua.EndDate >= CAST(GETDATE() AS date))
      ORDER BY ua.UpdatedAt DESC, ua.CreatedAt DESC, ua.UserAssignmentId DESC
    ) assignmentWorkspace
    OUTER APPLY (
      SELECT TOP 1
        w.WorkspaceId,
        w.WorkspaceName,
        w.DefaultRoute
      FROM dbo.WorkspaceRoles wr
      INNER JOIN dbo.Workspaces w
        ON w.WorkspaceId = wr.WorkspaceId
        AND w.IsActive = 1
      WHERE wr.RoleId = u.RoleId
      ORDER BY wr.IsDefault DESC, w.SortOrder, w.WorkspaceId
    ) roleWorkspace
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
async function getActiveAssignmentScopes(userId){const result=await query(`SELECT ua.UserAssignmentId,at.AssignmentKey,at.AssignmentName,ua.IsPrimary,s.ScopeType,s.ScopeEntityId,CASE s.ScopeType WHEN 'School' THEN sch.SchoolName WHEN 'Department' THEN d.DepartmentName WHEN 'Section' THEN sec.SectionName WHEN 'YearGroup' THEN yl.YearLevelName WHEN 'Subject' THEN sub.SubjectName WHEN 'Location' THEN l.LocationName WHEN 'Class' THEN c.ClassName WHEN 'Room' THEN rm.RoomName END ScopeName FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypes at ON at.AssignmentTypeId=ua.AssignmentTypeId AND at.IsActive=1 LEFT JOIN dbo.UserAssignmentScopes s ON s.UserAssignmentId=ua.UserAssignmentId AND s.IsActive=1 LEFT JOIN dbo.Schools sch ON s.ScopeType='School' AND sch.SchoolId=s.ScopeEntityId LEFT JOIN dbo.Departments d ON s.ScopeType='Department' AND d.DepartmentId=s.ScopeEntityId LEFT JOIN dbo.Sections sec ON s.ScopeType='Section' AND sec.SectionId=s.ScopeEntityId LEFT JOIN dbo.YearLevels yl ON s.ScopeType='YearGroup' AND yl.YearLevelId=s.ScopeEntityId LEFT JOIN dbo.Subjects sub ON s.ScopeType='Subject' AND sub.SubjectId=s.ScopeEntityId LEFT JOIN dbo.Locations l ON s.ScopeType='Location' AND l.LocationId=s.ScopeEntityId LEFT JOIN dbo.Classes c ON s.ScopeType='Class' AND c.ClassId=s.ScopeEntityId LEFT JOIN dbo.Rooms rm ON s.ScopeType='Room' AND rm.RoomId=s.ScopeEntityId WHERE ua.UserId=@UserId AND ua.IsActive=1 AND (ua.StartDate IS NULL OR ua.StartDate<=CAST(GETDATE() AS date)) AND (ua.EndDate IS NULL OR ua.EndDate>=CAST(GETDATE() AS date)) ORDER BY ua.IsPrimary DESC,ua.CreatedAt,s.ScopeType;`,[{name:"UserId",type:sql.Int,value:userId}]);return result.recordset;}
async function getAccessibleWorkspaces(userId) {
  const result = await query(
    `
    SELECT DISTINCT
      workspace.WorkspaceId,
      workspace.WorkspaceKey,
      workspace.WorkspaceName,
      workspace.DefaultRoute,
      workspace.SortOrder
    FROM dbo.Workspaces workspace
    JOIN dbo.Users userRecord ON userRecord.UserId = @UserId
    WHERE workspace.IsActive = 1
      AND (
        workspace.WorkspaceId = userRecord.DefaultWorkspaceId
        OR EXISTS (
          SELECT 1
          FROM dbo.WorkspaceRoles workspaceRole
          WHERE workspaceRole.WorkspaceId = workspace.WorkspaceId
            AND workspaceRole.RoleId = userRecord.RoleId
        )
        OR EXISTS (
          SELECT 1
          FROM dbo.UserAssignments assignment
          JOIN dbo.AssignmentTypes assignmentType
            ON assignmentType.AssignmentTypeId = assignment.AssignmentTypeId
           AND assignmentType.IsActive = 1
          JOIN dbo.AssignmentTypeWorkspaces assignmentWorkspace
            ON assignmentWorkspace.AssignmentTypeId = assignment.AssignmentTypeId
           AND assignmentWorkspace.WorkspaceId = workspace.WorkspaceId
           AND assignmentWorkspace.IsActive = 1
          WHERE assignment.UserId = userRecord.UserId
            AND assignment.IsActive = 1
            AND (
              assignment.StartDate IS NULL
              OR assignment.StartDate <= CAST(GETDATE() AS date)
            )
            AND (
              assignment.EndDate IS NULL
              OR assignment.EndDate >= CAST(GETDATE() AS date)
            )
        )
      )
    ORDER BY workspace.SortOrder, workspace.WorkspaceId;
    `,
    [{ name: "UserId", type: sql.Int, value: userId }]
  );
  return result.recordset;
}
async function getPasswordHash(userId){const result=await query(`SELECT PasswordHash FROM dbo.Users WHERE UserId=@UserId AND IsActive=1 AND ISNULL(IsDeleted,0)=0;`,[{name:"UserId",type:sql.Int,value:userId}]);return result.recordset[0]?.PasswordHash||null;}
async function updatePassword(userId,passwordHash){await query(`UPDATE dbo.Users SET PasswordHash=@PasswordHash,MustChangePassword=0,UpdatedAt=GETDATE() WHERE UserId=@UserId;`,[{name:"UserId",type:sql.Int,value:userId},{name:"PasswordHash",type:sql.NVarChar,value:passwordHash}]);}

module.exports = {
  findActiveUserByIdentifier,
  findActiveUserByEmployeeId,
  findActiveUserById,
  markLoginSuccess,
  getActiveAssignmentScopes,
  getAccessibleWorkspaces,
  getPasswordHash,
  updatePassword,
};
