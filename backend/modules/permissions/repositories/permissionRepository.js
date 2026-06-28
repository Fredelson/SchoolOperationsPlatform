// ============================================================
// Arab Unity School Operations Platform
// Permission Repository
// ============================================================
//
// Purpose:
// Handles all SQL operations related to Permissions.
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
// Get All Active Permissions
// ============================================================

async function getPermissions() {
  const result = await executeQuery(`
    SELECT
      p.PermissionId,
      p.PermissionKey,
      p.PermissionName,
      p.ModuleId,
      m.ModuleKey,
      m.ModuleName,
      p.PermissionGroupId,
      pg.GroupKey,
      pg.GroupName,
      p.Description,
      p.IsActive,
      p.CreatedAt,
      p.UpdatedAt
    FROM dbo.Permissions p
    INNER JOIN dbo.Modules m
      ON p.ModuleId = m.ModuleId
    LEFT JOIN dbo.PermissionGroups pg
      ON p.PermissionGroupId = pg.PermissionGroupId
    WHERE
      p.IsActive = 1
    ORDER BY
      m.SortOrder,
      pg.SortOrder,
      p.PermissionName;
  `);

  return rows(result);
}

// ============================================================
// Get Permission By Id
// ============================================================

async function getPermissionById(permissionId) {
  const result = await executeQuery(
    `
    SELECT
      p.PermissionId,
      p.PermissionKey,
      p.PermissionName,
      p.ModuleId,
      m.ModuleKey,
      m.ModuleName,
      p.PermissionGroupId,
      pg.GroupKey,
      pg.GroupName,
      p.Description,
      p.IsActive,
      p.CreatedAt,
      p.UpdatedAt
    FROM dbo.Permissions p
    INNER JOIN dbo.Modules m
      ON p.ModuleId = m.ModuleId
    LEFT JOIN dbo.PermissionGroups pg
      ON p.PermissionGroupId = pg.PermissionGroupId
    WHERE
      p.PermissionId = @PermissionId;
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
// Find Permission By Id
// ============================================================

async function findPermissionById(permissionId) {
  const result = await executeQuery(
    `
    SELECT
      PermissionId,
      PermissionKey,
      PermissionName,
      ModuleId,
      PermissionGroupId,
      Description,
      IsActive,
      CreatedAt,
      UpdatedAt
    FROM dbo.Permissions
    WHERE
      PermissionId = @PermissionId;
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
// Find Permission By Key
// ============================================================

async function findPermissionByKey(permissionKey, excludePermissionId = null) {
  const result = await executeQuery(
    `
    SELECT
      PermissionId,
      PermissionKey
    FROM dbo.Permissions
    WHERE
      PermissionKey = @PermissionKey
      AND (
        @ExcludePermissionId IS NULL
        OR PermissionId <> @ExcludePermissionId
      );
    `,
    [
      {
        name: "PermissionKey",
        type: sql.NVarChar(100),
        value: permissionKey,
      },
      {
        name: "ExcludePermissionId",
        type: sql.Int,
        value: excludePermissionId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Find Permission By Name
// ============================================================

async function findPermissionByName(permissionName, excludePermissionId = null) {
  const result = await executeQuery(
    `
    SELECT
      PermissionId,
      PermissionName
    FROM dbo.Permissions
    WHERE
      PermissionName = @PermissionName
      AND (
        @ExcludePermissionId IS NULL
        OR PermissionId <> @ExcludePermissionId
      );
    `,
    [
      {
        name: "PermissionName",
        type: sql.NVarChar(150),
        value: permissionName,
      },
      {
        name: "ExcludePermissionId",
        type: sql.Int,
        value: excludePermissionId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Find Active Module By Id
// ============================================================

async function findActiveModuleById(moduleId) {
  const result = await executeQuery(
    `
    SELECT
      ModuleId,
      ModuleKey,
      ModuleName,
      IsActive
    FROM dbo.Modules
    WHERE
      ModuleId = @ModuleId
      AND IsActive = 1;
    `,
    [
      {
        name: "ModuleId",
        type: sql.Int,
        value: moduleId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Find Permission Group By Id
// ============================================================

async function findPermissionGroupById(permissionGroupId) {
  const result = await executeQuery(
    `
    SELECT
      PermissionGroupId,
      GroupKey,
      GroupName
    FROM dbo.PermissionGroups
    WHERE
      PermissionGroupId = @PermissionGroupId;
    `,
    [
      {
        name: "PermissionGroupId",
        type: sql.Int,
        value: permissionGroupId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Create Permission
// ============================================================

async function createPermission(data) {
  const result = await executeQuery(
    `
    INSERT INTO dbo.Permissions
    (
      PermissionKey,
      PermissionName,
      ModuleId,
      PermissionGroupId,
      Description,
      IsActive,
      CreatedAt,
      UpdatedAt
    )
    OUTPUT INSERTED.PermissionId
    VALUES
    (
      @PermissionKey,
      @PermissionName,
      @ModuleId,
      @PermissionGroupId,
      @Description,
      1,
      GETDATE(),
      GETDATE()
    );
    `,
    [
      {
        name: "PermissionKey",
        type: sql.NVarChar(100),
        value: data.permissionKey,
      },
      {
        name: "PermissionName",
        type: sql.NVarChar(150),
        value: data.permissionName,
      },
      {
        name: "ModuleId",
        type: sql.Int,
        value: data.moduleId,
      },
      {
        name: "PermissionGroupId",
        type: sql.Int,
        value: data.permissionGroupId || null,
      },
      {
        name: "Description",
        type: sql.NVarChar(255),
        value: data.description || null,
      },
    ]
  );

  return insertedId(result, "PermissionId");
}

// ============================================================
// Update Permission
// ============================================================

async function updatePermission(permissionId, data) {
  await executeQuery(
    `
    UPDATE dbo.Permissions
    SET
      PermissionKey = @PermissionKey,
      PermissionName = @PermissionName,
      ModuleId = @ModuleId,
      PermissionGroupId = @PermissionGroupId,
      Description = @Description,
      UpdatedAt = GETDATE()
    WHERE
      PermissionId = @PermissionId;
    `,
    [
      {
        name: "PermissionId",
        type: sql.Int,
        value: permissionId,
      },
      {
        name: "PermissionKey",
        type: sql.NVarChar(100),
        value: data.permissionKey,
      },
      {
        name: "PermissionName",
        type: sql.NVarChar(150),
        value: data.permissionName,
      },
      {
        name: "ModuleId",
        type: sql.Int,
        value: data.moduleId,
      },
      {
        name: "PermissionGroupId",
        type: sql.Int,
        value: data.permissionGroupId || null,
      },
      {
        name: "Description",
        type: sql.NVarChar(255),
        value: data.description || null,
      },
    ]
  );
}

// ============================================================
// Deactivate Permission
// ============================================================

async function deactivatePermission(permissionId) {
  await executeQuery(
    `
    UPDATE dbo.Permissions
    SET
      IsActive = 0,
      UpdatedAt = GETDATE()
    WHERE
      PermissionId = @PermissionId;
    `,
    [
      {
        name: "PermissionId",
        type: sql.Int,
        value: permissionId,
      },
    ]
  );
}

// ============================================================
// Repository Exports
// ============================================================

module.exports = {
  getPermissions,
  getPermissionById,

  findPermissionById,
  findPermissionByKey,
  findPermissionByName,
  findActiveModuleById,
  findPermissionGroupById,

  createPermission,
  updatePermission,
  deactivatePermission,
};