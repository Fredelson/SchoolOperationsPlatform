// backend/modules/users/repositories/userRepository.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Users Repository
 * ============================================================
 *
 * Purpose:
 * Handles all direct database access for the Users module.
 *
 * Architecture:
 * Route → Controller → Service → Repository → Shared Database Layer
 *
 * Rules:
 * - No business logic belongs here.
 * - No HTTP response logic belongs here.
 * - No password policy decisions belong here.
 * - Only SQL queries and database mapping belong here.
 *
 * Database Source of Truth:
 * OperationsPlatformDB
 *
 * Important Schema Notes:
 * - dbo.Users stores RoleId, not Role.
 * - dbo.Roles stores RoleKey, RoleName, DisplayName, and protection status.
 * - Subjects are not stored directly in dbo.Users.
 * - Subject assignments should be handled later through dbo.UserAssignments.
 * ============================================================
 */

const {
  sql,
  executeQuery,
  firstOrNull,
  rows,
  insertedId,
} = require("../../../shared/database");

/**
 * ------------------------------------------------------------
 * Find All Users
 * ------------------------------------------------------------
 *
 * Gets all users with role, department, and section details.
 *
 * Used by:
 * GET /api/users
 *
 * @returns {Promise<Array>} List of users.
 */
async function findAllUsers() {
  const result = await executeQuery(`
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

  return rows(result);
}

/**
 * ------------------------------------------------------------
 * Find User by ID
 * ------------------------------------------------------------
 *
 * Gets one user by UserId.
 *
 * Used by:
 * GET /api/users/:id
 *
 * @param {number} userId - User primary key.
 * @returns {Promise<object|null>} User record or null.
 */
async function findUserById(userId) {
  const result = await executeQuery(
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

/**
 * ------------------------------------------------------------
 * Find Role
 * ------------------------------------------------------------
 *
 * Finds a role using either:
 * - RoleId
 * - RoleKey
 * - RoleName
 * - DisplayName
 *
 * This keeps backward compatibility because older frontend code may still
 * send role strings like "SuperAdmin" or "PrintingAdmin".
 *
 * @param {number|string} roleValue - RoleId or role text.
 * @returns {Promise<object|null>} Role record or null.
 */
async function findRole(roleValue) {
  const roleId = Number(roleValue);

  const result = await executeQuery(
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

  return firstOrNull(result);
}

/**
 * ------------------------------------------------------------
 * Find Duplicate User
 * ------------------------------------------------------------
 *
 * Checks whether EmployeeId or SchoolEmail already exists.
 *
 * Used by:
 * - Create user
 * - Update user
 *
 * @param {string} employeeId - Employee ID.
 * @param {string} schoolEmail - School email.
 * @param {number|null} excludeUserId - Optional UserId to ignore during update.
 * @returns {Promise<object|null>} Duplicate user or null.
 */
async function findDuplicateUser(employeeId, schoolEmail, excludeUserId = null) {
  const result = await executeQuery(
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
      {
        name: "EmployeeId",
        type: sql.NVarChar,
        value: employeeId,
      },
      {
        name: "SchoolEmail",
        type: sql.NVarChar,
        value: schoolEmail,
      },
      {
        name: "ExcludeUserId",
        type: sql.Int,
        value: excludeUserId,
      },
    ]
  );

  return firstOrNull(result);
}

/**
 * ------------------------------------------------------------
 * Create User
 * ------------------------------------------------------------
 *
 * Inserts a new user into dbo.Users.
 *
 * Notes:
 * - PasswordHash is already generated by the service layer.
 * - RoleId is already resolved by the service layer.
 * - LegacyRole is stored for backward compatibility.
 *
 * @param {object} data - User data prepared by service.
 * @returns {Promise<number|null>} New UserId.
 */
async function createUser(data) {
  const result = await executeQuery(
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
      {
        name: "EmployeeId",
        type: sql.NVarChar,
        value: data.employeeId,
      },
      {
        name: "FullName",
        type: sql.NVarChar,
        value: data.fullName,
      },
      {
        name: "SchoolEmail",
        type: sql.NVarChar,
        value: data.schoolEmail,
      },
      {
        name: "PersonalEmail",
        type: sql.NVarChar,
        value: data.personalEmail || null,
      },
      {
        name: "MobileNumber",
        type: sql.NVarChar,
        value: data.mobileNumber || null,
      },
      {
        name: "PasswordHash",
        type: sql.NVarChar,
        value: data.passwordHash,
      },
      {
        name: "RoleId",
        type: sql.Int,
        value: data.roleId,
      },
      {
        name: "DepartmentId",
        type: sql.Int,
        value: data.departmentId || null,
      },
      {
        name: "SectionId",
        type: sql.Int,
        value: data.sectionId || null,
      },
      {
        name: "DefaultWorkspaceId",
        type: sql.Int,
        value: data.defaultWorkspaceId || null,
      },
      {
        name: "LegacyRole",
        type: sql.NVarChar,
        value: data.legacyRole || null,
      },
    ]
  );

  return insertedId(result, "UserId");
}

/**
 * ------------------------------------------------------------
 * Update User
 * ------------------------------------------------------------
 *
 * Updates an existing user profile.
 *
 * Notes:
 * - EmployeeId is intentionally not updated here.
 * - Password is intentionally not updated here.
 * - Password reset should be a separate endpoint later.
 *
 * @param {number} userId - User primary key.
 * @param {object} data - Updated user data.
 * @returns {Promise<void>}
 */
async function updateUser(userId, data) {
  await executeQuery(
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
      {
        name: "UserId",
        type: sql.Int,
        value: userId,
      },
      {
        name: "FullName",
        type: sql.NVarChar,
        value: data.fullName,
      },
      {
        name: "SchoolEmail",
        type: sql.NVarChar,
        value: data.schoolEmail,
      },
      {
        name: "PersonalEmail",
        type: sql.NVarChar,
        value: data.personalEmail || null,
      },
      {
        name: "MobileNumber",
        type: sql.NVarChar,
        value: data.mobileNumber || null,
      },
      {
        name: "RoleId",
        type: sql.Int,
        value: data.roleId,
      },
      {
        name: "DepartmentId",
        type: sql.Int,
        value: data.departmentId || null,
      },
      {
        name: "SectionId",
        type: sql.Int,
        value: data.sectionId || null,
      },
      {
        name: "DefaultWorkspaceId",
        type: sql.Int,
        value: data.defaultWorkspaceId || null,
      },
      {
        name: "LegacyRole",
        type: sql.NVarChar,
        value: data.legacyRole || null,
      },
    ]
  );
}

/**
 * ------------------------------------------------------------
 * Set User Active Status
 * ------------------------------------------------------------
 *
 * Activates or deactivates a user account.
 *
 * Used by:
 * PUT /api/users/:id/activate
 * PUT /api/users/:id/deactivate
 *
 * @param {number} userId - User primary key.
 * @param {boolean} isActive - Active status.
 * @returns {Promise<void>}
 */
async function setUserActiveStatus(userId, isActive) {
  await executeQuery(
    `
    UPDATE dbo.Users
    SET
      IsActive = @IsActive,
      UpdatedAt = GETDATE()
    WHERE UserId = @UserId;
    `,
    [
      {
        name: "UserId",
        type: sql.Int,
        value: userId,
      },
      {
        name: "IsActive",
        type: sql.Bit,
        value: isActive,
      },
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