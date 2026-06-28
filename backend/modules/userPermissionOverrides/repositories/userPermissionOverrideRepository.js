// ============================================================
// Arab Unity School Operations Platform
// User Permission Override Repository
// ============================================================
//
// Purpose:
// Handles all SQL operations for user-level permission overrides.
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
// Table: dbo.UserPermissionOverrides
// ============================================================

const {
  sql,
  executeQuery,
  rows,
  firstOrNull,
  insertedId,
} = require("../../../shared/database");

// ============================================================
// Get All User Permission Overrides
// ============================================================

async function getAll() {
  const result = await executeQuery(`
    SELECT
      upo.UserPermissionOverrideId,
      upo.UserId,
      u.FullName,
      u.EmployeeId,
      u.SchoolEmail,
      upo.PermissionId,
      p.PermissionKey,
      p.PermissionName,
      upo.IsAllowed,
      upo.Reason,
      upo.CreatedBy,
      cb.FullName AS CreatedByName,
      upo.CreatedAt
    FROM dbo.UserPermissionOverrides upo
    INNER JOIN dbo.Users u
      ON upo.UserId = u.UserId
    INNER JOIN dbo.Permissions p
      ON upo.PermissionId = p.PermissionId
    LEFT JOIN dbo.Users cb
      ON upo.CreatedBy = cb.UserId
    ORDER BY u.FullName ASC, p.PermissionKey ASC;
  `);

  return rows(result);
}

// ============================================================
// Get User Permission Overrides By User
// ============================================================

async function getByUserId(userId) {
  const result = await executeQuery(
    `
      SELECT
        upo.UserPermissionOverrideId,
        upo.UserId,
        u.FullName,
        u.EmployeeId,
        u.SchoolEmail,
        upo.PermissionId,
        p.PermissionKey,
        p.PermissionName,
        upo.IsAllowed,
        upo.Reason,
        upo.CreatedBy,
        cb.FullName AS CreatedByName,
        upo.CreatedAt
      FROM dbo.UserPermissionOverrides upo
      INNER JOIN dbo.Users u
        ON upo.UserId = u.UserId
      INNER JOIN dbo.Permissions p
        ON upo.PermissionId = p.PermissionId
      LEFT JOIN dbo.Users cb
        ON upo.CreatedBy = cb.UserId
      WHERE upo.UserId = @UserId
      ORDER BY p.PermissionKey ASC;
    `,
    [{ name: "UserId", type: sql.Int, value: userId }]
  );

  return rows(result);
}

// ============================================================
// Get User Permission Override By ID
// ============================================================

async function getById(userPermissionOverrideId) {
  const result = await executeQuery(
    `
      SELECT
        upo.UserPermissionOverrideId,
        upo.UserId,
        u.FullName,
        u.EmployeeId,
        u.SchoolEmail,
        upo.PermissionId,
        p.PermissionKey,
        p.PermissionName,
        upo.IsAllowed,
        upo.Reason,
        upo.CreatedBy,
        cb.FullName AS CreatedByName,
        upo.CreatedAt
      FROM dbo.UserPermissionOverrides upo
      INNER JOIN dbo.Users u
        ON upo.UserId = u.UserId
      INNER JOIN dbo.Permissions p
        ON upo.PermissionId = p.PermissionId
      LEFT JOIN dbo.Users cb
        ON upo.CreatedBy = cb.UserId
      WHERE upo.UserPermissionOverrideId = @UserPermissionOverrideId;
    `,
    [
      {
        name: "UserPermissionOverrideId",
        type: sql.Int,
        value: userPermissionOverrideId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Find Duplicate User Permission Override
// ============================================================

async function findDuplicate(userId, permissionId, excludeId = null) {
  const result = await executeQuery(
    `
      SELECT
        UserPermissionOverrideId,
        UserId,
        PermissionId
      FROM dbo.UserPermissionOverrides
      WHERE UserId = @UserId
        AND PermissionId = @PermissionId
        AND (
          @ExcludeId IS NULL
          OR UserPermissionOverrideId <> @ExcludeId
        );
    `,
    [
      { name: "UserId", type: sql.Int, value: userId },
      { name: "PermissionId", type: sql.Int, value: permissionId },
      { name: "ExcludeId", type: sql.Int, value: excludeId },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Create User Permission Override
// ============================================================

async function create({ userId, permissionId, isAllowed, reason, createdBy }) {
  const result = await executeQuery(
    `
      INSERT INTO dbo.UserPermissionOverrides (
        UserId,
        PermissionId,
        IsAllowed,
        Reason,
        CreatedBy
      )
      VALUES (
        @UserId,
        @PermissionId,
        @IsAllowed,
        @Reason,
        @CreatedBy
      );

      SELECT SCOPE_IDENTITY() AS InsertedId;
    `,
    [
      { name: "UserId", type: sql.Int, value: userId },
      { name: "PermissionId", type: sql.Int, value: permissionId },
      { name: "IsAllowed", type: sql.Bit, value: isAllowed },
      { name: "Reason", type: sql.NVarChar(255), value: reason || null },
      { name: "CreatedBy", type: sql.Int, value: createdBy || null },
    ]
  );

  return insertedId(result);
}

// ============================================================
// Update User Permission Override
// ============================================================

async function update(userPermissionOverrideId, { userId, permissionId, isAllowed, reason }) {
  await executeQuery(
    `
      UPDATE dbo.UserPermissionOverrides
      SET
        UserId = @UserId,
        PermissionId = @PermissionId,
        IsAllowed = @IsAllowed,
        Reason = @Reason
      WHERE UserPermissionOverrideId = @UserPermissionOverrideId;
    `,
    [
      {
        name: "UserPermissionOverrideId",
        type: sql.Int,
        value: userPermissionOverrideId,
      },
      { name: "UserId", type: sql.Int, value: userId },
      { name: "PermissionId", type: sql.Int, value: permissionId },
      { name: "IsAllowed", type: sql.Bit, value: isAllowed },
      { name: "Reason", type: sql.NVarChar(255), value: reason || null },
    ]
  );
}

// ============================================================
// Delete User Permission Override
// ============================================================
//
// Note:
// This table does not contain IsActive in the SQL schema.
// Therefore delete is a physical delete, not soft delete.
// ============================================================

async function remove(userPermissionOverrideId) {
  await executeQuery(
    `
      DELETE FROM dbo.UserPermissionOverrides
      WHERE UserPermissionOverrideId = @UserPermissionOverrideId;
    `,
    [
      {
        name: "UserPermissionOverrideId",
        type: sql.Int,
        value: userPermissionOverrideId,
      },
    ]
  );
}

// ============================================================
// Entity Validation Helpers
// ============================================================

async function findUserById(userId) {
  const result = await executeQuery(
    `
      SELECT
        UserId,
        FullName,
        EmployeeId,
        SchoolEmail,
        IsActive
      FROM dbo.Users
      WHERE UserId = @UserId;
    `,
    [{ name: "UserId", type: sql.Int, value: userId }]
  );

  return firstOrNull(result);
}

async function findPermissionById(permissionId) {
  const result = await executeQuery(
    `
      SELECT
        PermissionId,
        PermissionKey,
        PermissionName,
        IsActive
      FROM dbo.Permissions
      WHERE PermissionId = @PermissionId;
    `,
    [{ name: "PermissionId", type: sql.Int, value: permissionId }]
  );

  return firstOrNull(result);
}

module.exports = {
  getAll,
  getByUserId,
  getById,
  findDuplicate,
  create,
  update,
  remove,
  findUserById,
  findPermissionById,
};