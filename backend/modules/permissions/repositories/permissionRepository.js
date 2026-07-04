// ============================================================
// Arab Unity School Operations Platform
// Permission Repository
// ============================================================
//
// Purpose:
// Handles all SQL Server operations for Permission Manager.
//
// Rules:
// - SQL only
// - No business logic
// - No HTTP handling
// ============================================================

const {
  sql,
  executeQuery,
  rows,
  firstOrNull,
  insertedId,
} = require("../../../shared/database");

// ============================================================
// Get Permissions with Search + Filters + Pagination
// ============================================================

async function getPermissions(filters = {}) {
  const {
    search = "",
    moduleId = null,
    permissionGroupId = null,
    isActive = null,
    page = 1,
    limit = 10,
  } = filters;

  const offset = (Number(page) - 1) * Number(limit);

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
      (
        @Search = ''
        OR p.PermissionKey LIKE '%' + @Search + '%'
        OR p.PermissionName LIKE '%' + @Search + '%'
        OR ISNULL(p.Description, '') LIKE '%' + @Search + '%'
        OR ISNULL(m.ModuleName, '') LIKE '%' + @Search + '%'
        OR ISNULL(pg.GroupName, '') LIKE '%' + @Search + '%'
      )
      AND (@ModuleId IS NULL OR p.ModuleId = @ModuleId)
      AND (@PermissionGroupId IS NULL OR p.PermissionGroupId = @PermissionGroupId)
      AND (@IsActive IS NULL OR p.IsActive = @IsActive)
    ORDER BY
      m.SortOrder,
      pg.SortOrder,
      p.PermissionName
    OFFSET @Offset ROWS
    FETCH NEXT @Limit ROWS ONLY;

    SELECT COUNT(*) AS Total
    FROM dbo.Permissions p
    INNER JOIN dbo.Modules m
      ON p.ModuleId = m.ModuleId
    LEFT JOIN dbo.PermissionGroups pg
      ON p.PermissionGroupId = pg.PermissionGroupId
    WHERE
      (
        @Search = ''
        OR p.PermissionKey LIKE '%' + @Search + '%'
        OR p.PermissionName LIKE '%' + @Search + '%'
        OR ISNULL(p.Description, '') LIKE '%' + @Search + '%'
        OR ISNULL(m.ModuleName, '') LIKE '%' + @Search + '%'
        OR ISNULL(pg.GroupName, '') LIKE '%' + @Search + '%'
      )
      AND (@ModuleId IS NULL OR p.ModuleId = @ModuleId)
      AND (@PermissionGroupId IS NULL OR p.PermissionGroupId = @PermissionGroupId)
      AND (@IsActive IS NULL OR p.IsActive = @IsActive);
    `,
    [
      { name: "Search", type: sql.NVarChar(150), value: search },
      { name: "ModuleId", type: sql.Int, value: moduleId },
      { name: "PermissionGroupId", type: sql.Int, value: permissionGroupId },
      { name: "IsActive", type: sql.Bit, value: isActive },
      { name: "Offset", type: sql.Int, value: offset },
      { name: "Limit", type: sql.Int, value: Number(limit) },
    ]
  );

  return {
    rows: result.recordsets?.[0] || [],
    total: result.recordsets?.[1]?.[0]?.Total || 0,
  };
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
    WHERE p.PermissionId = @PermissionId;
    `,
    [{ name: "PermissionId", type: sql.Int, value: permissionId }]
  );

  return firstOrNull(result);
}

// ============================================================
// Get Permission By Key
// ============================================================

async function getPermissionByKey(permissionKey) {
  const result = await executeQuery(
    `
    SELECT TOP 1
      PermissionId,
      PermissionKey
    FROM dbo.Permissions
    WHERE PermissionKey = @PermissionKey;
    `,
    [{ name: "PermissionKey", type: sql.NVarChar(100), value: permissionKey }]
  );

  return firstOrNull(result);
}

// ============================================================
// Get Permission By Name
// ============================================================

async function getPermissionByName(permissionName) {
  const result = await executeQuery(
    `
    SELECT TOP 1
      PermissionId,
      PermissionName
    FROM dbo.Permissions
    WHERE PermissionName = @PermissionName;
    `,
    [{ name: "PermissionName", type: sql.NVarChar(150), value: permissionName }]
  );

  return firstOrNull(result);
}

// ============================================================
// Get Permission Lookups
// ============================================================

async function getPermissionLookups() {
  const result = await executeQuery(`
    SELECT
      ModuleId,
      ModuleKey,
      ModuleName
    FROM dbo.Modules
    WHERE IsActive = 1
    ORDER BY SortOrder, ModuleName;

    SELECT
      PermissionGroupId,
      GroupKey,
      GroupName
    FROM dbo.PermissionGroups
    ORDER BY SortOrder, GroupName;
  `);

  return {
    modules: result.recordsets?.[0] || [],
    permissionGroups: result.recordsets?.[1] || [],
    statuses: [
      { id: "true", name: "Active" },
      { id: "false", name: "Inactive" },
    ],
  };
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
      @IsActive,
      GETDATE(),
      NULL
    );
    `,
    [
      { name: "PermissionKey", type: sql.NVarChar(100), value: data.permissionKey },
      { name: "PermissionName", type: sql.NVarChar(150), value: data.permissionName },
      { name: "ModuleId", type: sql.Int, value: data.moduleId },
      { name: "PermissionGroupId", type: sql.Int, value: data.permissionGroupId || null },
      { name: "Description", type: sql.NVarChar(255), value: data.description || null },
      { name: "IsActive", type: sql.Bit, value: data.isActive },
    ]
  );

  const permissionId = insertedId(result, "PermissionId");
  return await getPermissionById(permissionId);
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
      IsActive = @IsActive,
      UpdatedAt = GETDATE()
    WHERE PermissionId = @PermissionId;
    `,
    [
      { name: "PermissionId", type: sql.Int, value: permissionId },
      { name: "PermissionKey", type: sql.NVarChar(100), value: data.permissionKey },
      { name: "PermissionName", type: sql.NVarChar(150), value: data.permissionName },
      { name: "ModuleId", type: sql.Int, value: data.moduleId },
      { name: "PermissionGroupId", type: sql.Int, value: data.permissionGroupId || null },
      { name: "Description", type: sql.NVarChar(255), value: data.description || null },
      { name: "IsActive", type: sql.Bit, value: data.isActive },
    ]
  );

  return await getPermissionById(permissionId);
}

// ============================================================
// Delete Permission
// Soft delete only
// ============================================================

async function deletePermission(permissionId) {
  await executeQuery(
    `
    UPDATE dbo.Permissions
    SET
      IsActive = 0,
      UpdatedAt = GETDATE()
    WHERE PermissionId = @PermissionId;
    `,
    [{ name: "PermissionId", type: sql.Int, value: permissionId }]
  );

  return await getPermissionById(permissionId);
}

// ============================================================
// Exports
// ============================================================

module.exports = {
  getPermissions,
  getPermissionById,
  getPermissionByKey,
  getPermissionByName,
  getPermissionLookups,
  createPermission,
  updatePermission,
  deletePermission,
};