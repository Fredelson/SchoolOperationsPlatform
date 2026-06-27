// backend/modules/users/repositories/userRepository.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Users Repository
 * ============================================================
 *
 * Purpose:
 * Handles all direct database access for user management.
 *
 * Rules:
 * - No business logic here.
 * - No HTTP response logic here.
 * - No password policy logic here.
 * - Only SQL queries belong in this file.
 * ============================================================
 */

const { query, sql } = require("../../../database");

/**
 * Gets all users with role, department, and section details.
 */
async function findAllUsers() {
  const result = await query(`
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
      u.LastLoginAt,
      u.CreatedAt,
      u.UpdatedAt
    FROM dbo.Users u
    INNER JOIN dbo.Roles r
      ON u.RoleId = r.RoleId
    LEFT JOIN dbo.Departments d
      ON u.DepartmentId = d.DepartmentId
    LEFT JOIN dbo.Sections s
      ON u.SectionId = s.SectionId
    ORDER BY u.FullName;
  `);

  return result.recordset;
}

/**
 * Gets one user by UserId.
 */
async function findUserById(userId) {
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
      u.LastLoginAt,
      u.CreatedAt,
      u.UpdatedAt
    FROM dbo.Users u
    INNER JOIN dbo.Roles r
      ON u.RoleId = r.RoleId
    LEFT JOIN dbo.Departments d
      ON u.DepartmentId = d.DepartmentId
    LEFT JOIN dbo.Sections s
      ON u.SectionId = s.SectionId
    WHERE u.UserId = @UserId;
    `,
    [{ name: "UserId", type: sql.Int, value: userId }]
  );

  return result.recordset[0] || null;
}

/**
 * Finds role by role id or role key/name/display name.
 */
async function findRole(roleValue) {
  const roleId = Number(roleValue);

  const result = await query(
    `
    SELECT
      RoleId,
      RoleKey,
      RoleName,
      DisplayName,
      IsProtected,
      IsActive
    FROM dbo.Roles
    WHERE IsActive = 1
      AND (
        RoleId = @RoleId
        OR RoleKey = @RoleValue
        OR RoleName = @RoleValue
        OR DisplayName = @RoleValue
      );
    `,
    [
      {
        name: "RoleId",
        type: sql.Int,
        value: Number.isNaN(roleId) ? -1 : roleId,
      },
      {
        name: "RoleValue",
        type: sql.NVarChar,
        value: String(roleValue || "").trim(),
      },
    ]
  );

  return result.recordset[0] || null;
}

/**
 * Checks duplicate EmployeeId or SchoolEmail.
 */
async function findDuplicateUser(employeeId, schoolEmail, excludeUserId = null) {
  const result = await query(
    `
    SELECT
      UserId,
      EmployeeId,
      SchoolEmail
    FROM dbo.Users
    WHERE
      (
        EmployeeId = @EmployeeId
        OR SchoolEmail = @SchoolEmail
      )
      AND (@ExcludeUserId IS NULL OR UserId <> @ExcludeUserId);
    `,
    [
      { name: "EmployeeId", type: sql.NVarChar, value: employeeId },
      { name: "SchoolEmail", type: sql.NVarChar, value: schoolEmail },
      { name: "ExcludeUserId", type: sql.Int, value: excludeUserId },
    ]
  );

  return result.recordset[0] || null;
}

/**
 * Creates a user.
 */
async function createUser(data) {
  const result = await query(
    `
    INSERT INTO dbo.Users
    (
      EmployeeId,
      FullName,
      SchoolEmail,
      PersonalEmail,
      MobileNumber,
      PasswordHash,
      RoleId,
      DepartmentId,
      SectionId,
      DefaultWorkspaceId,
      LegacyRole,
      MustChangePassword,
      EmailVerified,
      IsRegistrationCompleted,
      IsActive,
      IsLocked,
      FailedLoginAttempts,
      CreatedAt,
      UpdatedAt
    )
    OUTPUT INSERTED.UserId
    VALUES
    (
      @EmployeeId,
      @FullName,
      @SchoolEmail,
      @PersonalEmail,
      @MobileNumber,
      @PasswordHash,
      @RoleId,
      @DepartmentId,
      @SectionId,
      @DefaultWorkspaceId,
      @LegacyRole,
      1,
      0,
      1,
      1,
      0,
      0,
      GETDATE(),
      GETDATE()
    );
    `,
    [
      { name: "EmployeeId", type: sql.NVarChar, value: data.employeeId },
      { name: "FullName", type: sql.NVarChar, value: data.fullName },
      { name: "SchoolEmail", type: sql.NVarChar, value: data.schoolEmail },
      { name: "PersonalEmail", type: sql.NVarChar, value: data.personalEmail || null },
      { name: "MobileNumber", type: sql.NVarChar, value: data.mobileNumber || null },
      { name: "PasswordHash", type: sql.NVarChar, value: data.passwordHash },
      { name: "RoleId", type: sql.Int, value: data.roleId },
      { name: "DepartmentId", type: sql.Int, value: data.departmentId || null },
      { name: "SectionId", type: sql.Int, value: data.sectionId || null },
      { name: "DefaultWorkspaceId", type: sql.Int, value: data.defaultWorkspaceId || null },
      { name: "LegacyRole", type: sql.NVarChar, value: data.legacyRole || null },
    ]
  );

  return result.recordset[0].UserId;
}

/**
 * Updates a user.
 */
async function updateUser(userId, data) {
  await query(
    `
    UPDATE dbo.Users
    SET
      FullName = @FullName,
      SchoolEmail = @SchoolEmail,
      PersonalEmail = @PersonalEmail,
      MobileNumber = @MobileNumber,
      RoleId = @RoleId,
      DepartmentId = @DepartmentId,
      SectionId = @SectionId,
      DefaultWorkspaceId = @DefaultWorkspaceId,
      LegacyRole = @LegacyRole,
      UpdatedAt = GETDATE()
    WHERE UserId = @UserId;
    `,
    [
      { name: "UserId", type: sql.Int, value: userId },
      { name: "FullName", type: sql.NVarChar, value: data.fullName },
      { name: "SchoolEmail", type: sql.NVarChar, value: data.schoolEmail },
      { name: "PersonalEmail", type: sql.NVarChar, value: data.personalEmail || null },
      { name: "MobileNumber", type: sql.NVarChar, value: data.mobileNumber || null },
      { name: "RoleId", type: sql.Int, value: data.roleId },
      { name: "DepartmentId", type: sql.Int, value: data.departmentId || null },
      { name: "SectionId", type: sql.Int, value: data.sectionId || null },
      { name: "DefaultWorkspaceId", type: sql.Int, value: data.defaultWorkspaceId || null },
      { name: "LegacyRole", type: sql.NVarChar, value: data.legacyRole || null },
    ]
  );
}

/**
 * Sets user active status.
 */
async function setUserActiveStatus(userId, isActive) {
  await query(
    `
    UPDATE dbo.Users
    SET
      IsActive = @IsActive,
      UpdatedAt = GETDATE()
    WHERE UserId = @UserId;
    `,
    [
      { name: "UserId", type: sql.Int, value: userId },
      { name: "IsActive", type: sql.Bit, value: isActive },
    ]
  );
}

module.exports = {
  findAllUsers,
  findUserById,
  findRole,
  findDuplicateUser,
  createUser,
  updateUser,
  setUserActiveStatus,
};