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
// Get Role Permissions
// ============================================================
//
// Supports:
// - Search
// - Pagination
// - Role filter
// - Module filter
// - Permission group filter
// - IsAllowed filter
//
// ============================================================

async function getRolePermissions({
  search = "",
  page = 1,
  limit = 10,
  roleId = null,
  moduleId = null,
  permissionGroupId = null,
  isAllowed = null,
} = {}) {
  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;
  const offset = (parsedPage - 1) * parsedLimit;

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
      rp.CreatedAt,
      rp.UpdatedAt

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
      r.IsActive = 1
      AND p.IsActive = 1

      AND (
        @Search = ''
        OR r.RoleKey LIKE '%' + @Search + '%'
        OR r.RoleName LIKE '%' + @Search + '%'
        OR r.DisplayName LIKE '%' + @Search + '%'
        OR p.PermissionKey LIKE '%' + @Search + '%'
        OR p.PermissionName LIKE '%' + @Search + '%'
        OR m.ModuleKey LIKE '%' + @Search + '%'
        OR m.ModuleName LIKE '%' + @Search + '%'
        OR ISNULL(pg.GroupKey, '') LIKE '%' + @Search + '%'
        OR ISNULL(pg.GroupName, '') LIKE '%' + @Search + '%'
      )

      AND (
        @RoleId IS NULL
        OR rp.RoleId = @RoleId
      )

      AND (
        @ModuleId IS NULL
        OR p.ModuleId = @ModuleId
      )

      AND (
        @PermissionGroupId IS NULL
        OR p.PermissionGroupId = @PermissionGroupId
      )

      AND (
        @IsAllowed IS NULL
        OR rp.IsAllowed = @IsAllowed
      )

    ORDER BY
      r.DisplayName,
      m.SortOrder,
      ISNULL(pg.SortOrder, 0),
      p.PermissionName

    OFFSET @Offset ROWS
    FETCH NEXT @Limit ROWS ONLY;

    SELECT
      COUNT(*) AS Total

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
      r.IsActive = 1
      AND p.IsActive = 1

      AND (
        @Search = ''
        OR r.RoleKey LIKE '%' + @Search + '%'
        OR r.RoleName LIKE '%' + @Search + '%'
        OR r.DisplayName LIKE '%' + @Search + '%'
        OR p.PermissionKey LIKE '%' + @Search + '%'
        OR p.PermissionName LIKE '%' + @Search + '%'
        OR m.ModuleKey LIKE '%' + @Search + '%'
        OR m.ModuleName LIKE '%' + @Search + '%'
        OR ISNULL(pg.GroupKey, '') LIKE '%' + @Search + '%'
        OR ISNULL(pg.GroupName, '') LIKE '%' + @Search + '%'
      )

      AND (
        @RoleId IS NULL
        OR rp.RoleId = @RoleId
      )

      AND (
        @ModuleId IS NULL
        OR p.ModuleId = @ModuleId
      )

      AND (
        @PermissionGroupId IS NULL
        OR p.PermissionGroupId = @PermissionGroupId
      )

      AND (
        @IsAllowed IS NULL
        OR rp.IsAllowed = @IsAllowed
      );
    `,
    [
      {
        name: "Search",
        type: sql.NVarChar(150),
        value: search || "",
      },
      {
        name: "RoleId",
        type: sql.Int,
        value: roleId ? Number(roleId) : null,
      },
      {
        name: "ModuleId",
        type: sql.Int,
        value: moduleId ? Number(moduleId) : null,
      },
      {
        name: "PermissionGroupId",
        type: sql.Int,
        value: permissionGroupId ? Number(permissionGroupId) : null,
      },
      {
        name: "IsAllowed",
        type: sql.Bit,
        value:
          isAllowed === null || isAllowed === undefined || isAllowed === ""
            ? null
            : isAllowed === true ||
              isAllowed === "true" ||
              isAllowed === 1 ||
              isAllowed === "1",
      },
      {
        name: "Offset",
        type: sql.Int,
        value: offset,
      },
      {
        name: "Limit",
        type: sql.Int,
        value: parsedLimit,
      },
    ]
  );

  return {
    data: result.recordsets?.[0] || [],
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      totalRecords: result.recordsets?.[1]?.[0]?.Total || 0,
      totalPages: Math.ceil(
        (result.recordsets?.[1]?.[0]?.Total || 0) / parsedLimit
      ),
    },
  };
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
      rp.CreatedAt,
      rp.UpdatedAt

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
// Role Permission Lookups
// ============================================================

async function getRolePermissionLookups() {
  const result = await executeQuery(`
    SELECT
      RoleId,
      RoleKey,
      RoleName,
      DisplayName,
      AccessLevelId
    FROM dbo.Roles
    WHERE IsActive = 1
    ORDER BY DisplayName;

    SELECT
      ModuleId,
      ModuleKey,
      ModuleName,
      SortOrder
    FROM dbo.Modules
    WHERE IsActive = 1
    ORDER BY SortOrder, ModuleName;

    SELECT
      PermissionGroupId,
      GroupKey,
      GroupName,
      SortOrder
    FROM dbo.PermissionGroups
    WHERE IsActive = 1
    ORDER BY SortOrder, GroupName;

    SELECT
      p.PermissionId,
      p.PermissionKey,
      p.PermissionName,
      p.ModuleId,
      m.ModuleKey,
      m.ModuleName,
      p.PermissionGroupId,
      pg.GroupKey,
      pg.GroupName
    FROM dbo.Permissions p
    INNER JOIN dbo.Modules m
      ON p.ModuleId = m.ModuleId
    LEFT JOIN dbo.PermissionGroups pg
      ON p.PermissionGroupId = pg.PermissionGroupId
    WHERE
      p.IsActive = 1
      AND m.IsActive = 1
    ORDER BY
      m.SortOrder,
      ISNULL(pg.SortOrder, 0),
      p.PermissionName;
  `);

  return {
    roles: result.recordsets?.[0] || [],
    modules: result.recordsets?.[1] || [],
    permissionGroups: result.recordsets?.[2] || [],
    permissions: result.recordsets?.[3] || [],
  };
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
      CreatedAt,
      UpdatedAt
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

async function findRolePermissionPair(
  roleId,
  permissionId,
  excludeRolePermissionId = null
) {
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
      CreatedAt,
      UpdatedAt
    )
    OUTPUT INSERTED.RolePermissionId
    VALUES
    (
      @RoleId,
      @PermissionId,
      @IsAllowed,
      GETDATE(),
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
      IsAllowed = @IsAllowed,
      UpdatedAt = GETDATE()
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
//
// RolePermissions is a mapping table.
// Hard delete is acceptable here because removing the mapping
// means the role no longer has that permission assignment.
//
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
  getRolePermissionLookups,

  findRolePermissionById,
  findRolePermissionPair,
  findActiveRoleById,
  findActivePermissionById,

  createRolePermission,
  updateRolePermission,
  deleteRolePermission,
};