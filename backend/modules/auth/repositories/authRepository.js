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
      u.DefaultWorkspaceId,
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
      u.DefaultWorkspaceId,
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

module.exports = {
  findActiveUserByEmployeeId,
  findActiveUserById,
  markLoginSuccess,
};