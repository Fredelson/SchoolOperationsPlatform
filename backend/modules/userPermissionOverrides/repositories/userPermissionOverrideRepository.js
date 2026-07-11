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

async function getAll({ search = "", userId = null, moduleId = null, permissionId = null, isAllowed = null, page = 1, pageSize = 10 } = {}) {
  const offset=(page-1)*pageSize;
  const from=`FROM dbo.UserPermissionOverrides upo INNER JOIN dbo.Users u ON upo.UserId=u.UserId
    INNER JOIN dbo.Permissions p ON upo.PermissionId=p.PermissionId LEFT JOIN dbo.Modules m ON p.ModuleId=m.ModuleId
    LEFT JOIN dbo.Users cb ON upo.CreatedBy=cb.UserId`;
  const where=`WHERE (@Search='%%' OR u.FullName LIKE @Search OR u.EmployeeId LIKE @Search OR p.PermissionKey LIKE @Search)
    AND (@UserId IS NULL OR upo.UserId=@UserId) AND (@ModuleId IS NULL OR p.ModuleId=@ModuleId)
    AND (@PermissionId IS NULL OR upo.PermissionId=@PermissionId) AND (@IsAllowed IS NULL OR upo.IsAllowed=@IsAllowed)`;
  const params=[{name:"Search",type:sql.NVarChar(150),value:`%${search}%`},{name:"UserId",type:sql.Int,value:userId},
    {name:"ModuleId",type:sql.Int,value:moduleId},{name:"PermissionId",type:sql.Int,value:permissionId},
    {name:"IsAllowed",type:sql.Bit,value:isAllowed},{name:"Offset",type:sql.Int,value:offset},{name:"PageSize",type:sql.Int,value:pageSize}];
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
      p.ModuleId,
      m.ModuleName,
      upo.IsAllowed,
      upo.Reason,
      upo.CreatedBy,
      cb.FullName AS CreatedByName,
      upo.CreatedAt
    ${from} ${where} ORDER BY u.FullName,p.PermissionKey OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
    SELECT COUNT(1) AS TotalRows ${from} ${where};
  `,params);
  return {items:result.recordsets?.[0]||[],totalRows:result.recordsets?.[1]?.[0]?.TotalRows||0,page,pageSize};
}

async function getLookups() {
  const result=await executeQuery(`SELECT UserId,EmployeeId,FullName FROM dbo.Users WHERE IsActive=1 AND IsDeleted=0 ORDER BY FullName;
    SELECT ModuleId,ModuleKey,ModuleName FROM dbo.Modules WHERE IsActive=1 ORDER BY SortOrder,ModuleName;
    SELECT PermissionId,PermissionKey,PermissionName,ModuleId FROM dbo.Permissions WHERE IsActive=1 ORDER BY PermissionKey;`);
  return {users:result.recordsets?.[0]||[],modules:result.recordsets?.[1]||[],permissions:result.recordsets?.[2]||[]};
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

  return insertedId(result, "InsertedId");
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
  getLookups,
};
