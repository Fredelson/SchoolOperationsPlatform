const { sql, executeQuery, firstOrNull } = require("../../../shared/database");

async function getPermissionGroups({ search = "", page = 1, limit = 10 } = {}) {
  const offset = (Number(page) - 1) * Number(limit);

  const result = await executeQuery(
    `
    SELECT
      PermissionGroupId,
      GroupKey,
      GroupName,
      Description,
      SortOrder,
      CreatedAt,
      UpdatedAt
    FROM dbo.PermissionGroups
    WHERE
      @Search = ''
      OR GroupKey LIKE '%' + @Search + '%'
      OR GroupName LIKE '%' + @Search + '%'
      OR ISNULL(Description, '') LIKE '%' + @Search + '%'
    ORDER BY SortOrder, GroupName
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

    SELECT COUNT(*) AS Total
    FROM dbo.PermissionGroups
    WHERE
      @Search = ''
      OR GroupKey LIKE '%' + @Search + '%'
      OR GroupName LIKE '%' + @Search + '%'
      OR ISNULL(Description, '') LIKE '%' + @Search + '%';
    `,
    [
      { name: "Search", type: sql.NVarChar(150), value: search },
      { name: "Offset", type: sql.Int, value: offset },
      { name: "Limit", type: sql.Int, value: Number(limit) },
    ]
  );

  return {
    rows: result.recordsets?.[0] || [],
    total: result.recordsets?.[1]?.[0]?.Total || 0,
  };
}

async function getPermissionGroupById(permissionGroupId) {
  const result = await executeQuery(
    `
    SELECT
      PermissionGroupId,
      GroupKey,
      GroupName,
      Description,
      SortOrder,
      CreatedAt,
      UpdatedAt
    FROM dbo.PermissionGroups
    WHERE PermissionGroupId = @PermissionGroupId;
    `,
    [{ name: "PermissionGroupId", type: sql.Int, value: permissionGroupId }]
  );

  return firstOrNull(result);
}

async function getPermissionGroupByKey(groupKey) {
  const result = await executeQuery(
    `
    SELECT TOP 1 PermissionGroupId, GroupKey
    FROM dbo.PermissionGroups
    WHERE GroupKey = @GroupKey;
    `,
    [{ name: "GroupKey", type: sql.NVarChar(100), value: groupKey }]
  );

  return firstOrNull(result);
}

async function getPermissionGroupByName(groupName) {
  const result = await executeQuery(
    `
    SELECT TOP 1 PermissionGroupId, GroupName
    FROM dbo.PermissionGroups
    WHERE GroupName = @GroupName;
    `,
    [{ name: "GroupName", type: sql.NVarChar(150), value: groupName }]
  );

  return firstOrNull(result);
}

async function createPermissionGroup(data) {
  const result = await executeQuery(
    `
    INSERT INTO dbo.PermissionGroups
    (
      GroupKey,
      GroupName,
      Description,
      SortOrder,
      CreatedAt,
      UpdatedAt
    )
    OUTPUT INSERTED.PermissionGroupId
    VALUES
    (
      @GroupKey,
      @GroupName,
      @Description,
      @SortOrder,
      GETDATE(),
      NULL
    );
    `,
    [
      { name: "GroupKey", type: sql.NVarChar(100), value: data.groupKey },
      { name: "GroupName", type: sql.NVarChar(150), value: data.groupName },
      { name: "Description", type: sql.NVarChar(255), value: data.description || null },
      { name: "SortOrder", type: sql.Int, value: data.sortOrder || 0 },
    ]
  );

  const id = result.recordset?.[0]?.PermissionGroupId;
  return await getPermissionGroupById(id);
}

async function updatePermissionGroup(permissionGroupId, data) {
  await executeQuery(
    `
    UPDATE dbo.PermissionGroups
    SET
      GroupKey = @GroupKey,
      GroupName = @GroupName,
      Description = @Description,
      SortOrder = @SortOrder,
      UpdatedAt = GETDATE()
    WHERE PermissionGroupId = @PermissionGroupId;
    `,
    [
      { name: "PermissionGroupId", type: sql.Int, value: permissionGroupId },
      { name: "GroupKey", type: sql.NVarChar(100), value: data.groupKey },
      { name: "GroupName", type: sql.NVarChar(150), value: data.groupName },
      { name: "Description", type: sql.NVarChar(255), value: data.description || null },
      { name: "SortOrder", type: sql.Int, value: data.sortOrder || 0 },
    ]
  );

  return await getPermissionGroupById(permissionGroupId);
}

async function deletePermissionGroup(permissionGroupId) {
  await executeQuery(
    `
    DELETE FROM dbo.PermissionGroups
    OUTPUT DELETED.*
    WHERE PermissionGroupId = @PermissionGroupId;
    `,
    [{ name: "PermissionGroupId", type: sql.Int, value: permissionGroupId }]
  );

  return { permissionGroupId: Number(permissionGroupId), deleted: true };
}

module.exports = {
  getPermissionGroups,
  getPermissionGroupById,
  getPermissionGroupByKey,
  getPermissionGroupByName,
  createPermissionGroup,
  updatePermissionGroup,
  deletePermissionGroup,
};