// ============================================================
// Arab Unity School Operations Platform
// Role Permission Repository
// ============================================================
//
// Purpose:
// Handles all SQL operations related to Role Permissions.
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
// ============================================================

const {
  sql,
  executeQuery,
  rows,
  firstOrNull,
  insertedId,
} = require("../../../shared/database");

// ============================================================
// Get All Role Permissions
// ============================================================

async function getRolePermissions() {
  const result = await executeQuery(`
    SELECT
      rp.RolePermissionId,
      rp.RoleId,
      r.RoleKey,
      r.RoleName,
      r.DisplayName AS RoleDisplayName,
      rp.PermissionId,
      p.PermissionKey,
      p.PermissionName,
      p.ModuleId,
      m.ModuleKey,
      m.ModuleName,
      p.PermissionGroupId,
      pg.GroupKey,
      pg.GroupName,
      rp.IsAllowed,
      rp.CreatedAt
    FROM dbo.RolePermissions rp
    INNER JOIN dbo.Roles r
      ON rp.RoleId = r.RoleId
    INNER JOIN dbo.Permissions p
      ON rp.PermissionId = p.PermissionId
    INNER JOIN dbo.Modules m
      ON p.ModuleId = m.ModuleId
    LEFT JOIN dbo.PermissionGroups pg
      ON p.PermissionGroupId = pg.PermissionGroupId
    ORDER BY
      r.DisplayName,
      m.SortOrder,
      pg.SortOrder,
      p.PermissionName;
  `);

  return rows(result);
}

// ============================================================
// Get Role Permission By Id
// ============================================================

async function getRolePermissionById(rolePermissionId) {
  const result = await executeQuery(
    `
    SELECT
      rp.RolePermissionId,
      rp.RoleId,
      r.RoleKey,
      r.RoleName,
      r.DisplayName AS RoleDisplayName,
      rp.PermissionId,
      p.PermissionKey,
      p.PermissionName,
      p.ModuleId,
      m.ModuleKey,
      m.ModuleName,
      p.PermissionGroupId,
      pg.GroupKey,
      pg.GroupName,
      rp.IsAllowed,
      rp.CreatedAt
    FROM dbo.RolePermissions rp
    INNER JOIN dbo.Roles r
      ON rp.RoleId = r.RoleId
    INNER JOIN dbo.Permissions p
      ON rp.PermissionId = p.PermissionId
    INNER JOIN dbo.Modules m
      ON p.ModuleId = m.ModuleId
    LEFT JOIN dbo.PermissionGroups pg
      ON p.PermissionGroupId = pg.PermissionGroupId
    WHERE
      rp.RolePermissionId = @RolePermissionId;
    `,
    [
      {
        name: "RolePermissionId",
        type: sql.Int,
        value: rolePermissionId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Find Role Permission By Id
// ============================================================

async function findRolePermissionById(rolePermissionId) {
  const result = await executeQuery(
    `
    SELECT
      RolePermissionId,
      RoleId,
      PermissionId,
      IsAllowed,
      CreatedAt
    FROM dbo.RolePermissions
    WHERE
      RolePermissionId = @RolePermissionId;
    `,
    [
      {
        name: "RolePermissionId",
        type: sql.Int,
        value: rolePermissionId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Find Role Permission Pair
// ============================================================

async function findRolePermissionPair(roleId, permissionId, excludeRolePermissionId = null) {
  const result = await executeQuery(
    `
    SELECT
      RolePermissionId,
      RoleId,
      PermissionId,
      IsAllowed
    FROM dbo.RolePermissions
    WHERE
      RoleId = @RoleId
      AND PermissionId = @PermissionId
      AND (
        @ExcludeRolePermissionId IS NULL
        OR RolePermissionId <> @ExcludeRolePermissionId
      );
    `,
    [
      {
        name: "RoleId",
        type: sql.Int,
        value: roleId,
      },
      {
        name: "PermissionId",
        type: sql.Int,
        value: permissionId,
      },
      {
        name: "ExcludeRolePermissionId",
        type: sql.Int,
        value: excludeRolePermissionId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Find Active Role By Id
// ============================================================

async function findActiveRoleById(roleId) {
  const result = await executeQuery(
    `
    SELECT
      RoleId,
      RoleKey,
      RoleName,
      DisplayName,
      IsActive
    FROM dbo.Roles
    WHERE
      RoleId = @RoleId
      AND IsActive = 1;
    `,
    [
      {
        name: "RoleId",
        type: sql.Int,
        value: roleId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Find Active Permission By Id
// ============================================================

async function findActivePermissionById(permissionId) {
  const result = await executeQuery(
    `
    SELECT
      PermissionId,
      PermissionKey,
      PermissionName,
      IsActive
    FROM dbo.Permissions
    WHERE
      PermissionId = @PermissionId
      AND IsActive = 1;
    `,
    [
      {
        name: "PermissionId",
        type: sql.Int,
        value: permissionId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Create Role Permission
// ============================================================

async function createRolePermission(data) {
  const result = await executeQuery(
    `
    INSERT INTO dbo.RolePermissions
    (
      RoleId,
      PermissionId,
      IsAllowed,
      CreatedAt
    )
    OUTPUT INSERTED.RolePermissionId
    VALUES
    (
      @RoleId,
      @PermissionId,
      @IsAllowed,
      GETDATE()
    );
    `,
    [
      {
        name: "RoleId",
        type: sql.Int,
        value: data.roleId,
      },
      {
        name: "PermissionId",
        type: sql.Int,
        value: data.permissionId,
      },
      {
        name: "IsAllowed",
        type: sql.Bit,
        value: data.isAllowed === false ? false : true,
      },
    ]
  );

  return insertedId(result, "RolePermissionId");
}

// ============================================================
// Update Role Permission
// ============================================================

async function updateRolePermission(rolePermissionId, data) {
  await executeQuery(
    `
    UPDATE dbo.RolePermissions
    SET
      RoleId = @RoleId,
      PermissionId = @PermissionId,
      IsAllowed = @IsAllowed
    WHERE
      RolePermissionId = @RolePermissionId;
    `,
    [
      {
        name: "RolePermissionId",
        type: sql.Int,
        value: rolePermissionId,
      },
      {
        name: "RoleId",
        type: sql.Int,
        value: data.roleId,
      },
      {
        name: "PermissionId",
        type: sql.Int,
        value: data.permissionId,
      },
      {
        name: "IsAllowed",
        type: sql.Bit,
        value: data.isAllowed === false ? false : true,
      },
    ]
  );
}

// ============================================================
// Delete Role Permission
// ============================================================

async function deleteRolePermission(rolePermissionId) {
  await executeQuery(
    `
    DELETE FROM dbo.RolePermissions
    WHERE
      RolePermissionId = @RolePermissionId;
    `,
    [
      {
        name: "RolePermissionId",
        type: sql.Int,
        value: rolePermissionId,
      },
    ]
  );
}

// ============================================================
// Repository Exports
// ============================================================

module.exports = {
  getRolePermissions,
  getRolePermissionById,

  findRolePermissionById,
  findRolePermissionPair,
  findActiveRoleById,
  findActivePermissionById,

  createRolePermission,
  updateRolePermission,
  deleteRolePermission,
};