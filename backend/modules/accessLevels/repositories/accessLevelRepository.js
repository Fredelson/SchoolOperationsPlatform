const { sql, executeQuery, rows, firstOrNull, insertedId } = require("../../../shared/database");

const select = `SELECT AccessLevelId, AccessLevelKey, AccessLevelName, DisplayName,
  Description, SortOrder, IsSystemLevel, IsActive, CreatedAt, UpdatedAt
  FROM dbo.AccessLevels`;

async function list({ search = "", status = "", page = 1, pageSize = 10 }) {
  const offset = (page - 1) * pageSize;
  const params = [
    { name: "Search", type: sql.NVarChar(150), value: `%${search}%` },
    { name: "Status", type: sql.NVarChar(20), value: status || null },
    { name: "Offset", type: sql.Int, value: offset },
    { name: "PageSize", type: sql.Int, value: pageSize },
  ];
  const where = `WHERE (@Search = '%%' OR AccessLevelKey LIKE @Search OR AccessLevelName LIKE @Search OR DisplayName LIKE @Search OR Description LIKE @Search)
    AND (@Status IS NULL OR (@Status = 'active' AND IsActive = 1) OR (@Status = 'inactive' AND IsActive = 0))`;
  const result = await executeQuery(`${select} ${where} ORDER BY SortOrder, DisplayName
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
    SELECT COUNT(1) AS TotalRows FROM dbo.AccessLevels ${where};`, params);
  return { items: result.recordsets?.[0] || [], totalRows: result.recordsets?.[1]?.[0]?.TotalRows || 0, page, pageSize };
}

async function byId(id) {
  return firstOrNull(await executeQuery(`${select} WHERE AccessLevelId = @Id;`, [{ name: "Id", type: sql.Int, value: id }]));
}

async function duplicate(key, name, excludeId = null) {
  return firstOrNull(await executeQuery(`SELECT AccessLevelId FROM dbo.AccessLevels
    WHERE (AccessLevelKey = @Key OR AccessLevelName = @Name) AND (@ExcludeId IS NULL OR AccessLevelId <> @ExcludeId);`, [
    { name: "Key", type: sql.NVarChar(50), value: key }, { name: "Name", type: sql.NVarChar(50), value: name },
    { name: "ExcludeId", type: sql.Int, value: excludeId },
  ]));
}

async function create(data) {
  const result = await executeQuery(`INSERT dbo.AccessLevels
    (AccessLevelKey, AccessLevelName, DisplayName, Description, SortOrder, IsSystemLevel, IsActive, CreatedAt)
    OUTPUT INSERTED.AccessLevelId VALUES (@Key,@Name,@DisplayName,@Description,@SortOrder,0,@IsActive,GETDATE());`, inputs(data));
  return byId(insertedId(result, "AccessLevelId"));
}

function inputs(data, id = null) {
  return [
    ...(id === null ? [] : [{ name: "Id", type: sql.Int, value: id }]),
    { name: "Key", type: sql.NVarChar(50), value: data.accessLevelKey }, { name: "Name", type: sql.NVarChar(50), value: data.accessLevelName },
    { name: "DisplayName", type: sql.NVarChar(100), value: data.displayName }, { name: "Description", type: sql.NVarChar(255), value: data.description || null },
    { name: "SortOrder", type: sql.Int, value: data.sortOrder }, { name: "IsActive", type: sql.Bit, value: data.isActive },
  ];
}

async function update(id, data) {
  await executeQuery(`UPDATE dbo.AccessLevels SET
    AccessLevelKey = CASE WHEN IsSystemLevel=1 THEN AccessLevelKey ELSE @Key END,
    AccessLevelName = CASE WHEN IsSystemLevel=1 THEN AccessLevelName ELSE @Name END,
    DisplayName=@DisplayName, Description=@Description, SortOrder=@SortOrder, IsActive=@IsActive, UpdatedAt=GETDATE()
    WHERE AccessLevelId=@Id;`, inputs(data, id));
  return byId(id);
}

async function setActive(id, active) {
  await executeQuery(`UPDATE dbo.AccessLevels SET IsActive=@Active, UpdatedAt=GETDATE() WHERE AccessLevelId=@Id;`, [
    { name: "Id", type: sql.Int, value: id }, { name: "Active", type: sql.Bit, value: active },
  ]); return byId(id);
}

async function usage(id) {
  return firstOrNull(await executeQuery(`SELECT COUNT(1) AS RoleCount FROM dbo.Roles WHERE AccessLevelId=@Id;`, [{ name: "Id", type: sql.Int, value: id }]));
}

async function remove(id) { await executeQuery(`DELETE dbo.AccessLevels WHERE AccessLevelId=@Id;`, [{ name: "Id", type: sql.Int, value: id }]); }

module.exports = { list, byId, duplicate, create, update, setActive, usage, remove };
