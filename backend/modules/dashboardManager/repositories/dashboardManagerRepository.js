/* =========================================================
   Dashboard Manager Repository
   Repository → Service → Controller → Routes
========================================================= */

const { poolPromise, sql } = require("../../../config/db");

const getDashboards = async ({
  search = "",
  workspaceId = null,
  roleId = null,
  assignmentTypeId = null,
  moduleId = null,
  visibilityStatusId = null,
  isDefault = null,
  page = 1,
  limit = 10,
}) => {
  const pool = await poolPromise;
  const offset = (page - 1) * limit;

  const request = pool.request();

  request.input("Search", sql.NVarChar, `%${search}%`);
  request.input("WorkspaceId", sql.Int, workspaceId);
  request.input("RoleId", sql.Int, roleId);
  request.input("AssignmentTypeId", sql.Int, assignmentTypeId);
  request.input("ModuleId", sql.Int, moduleId);
  request.input("VisibilityStatusId", sql.Int, visibilityStatusId);
  request.input("IsDefault", sql.Bit, isDefault);
  request.input("Offset", sql.Int, offset);
  request.input("Limit", sql.Int, limit);

  const result = await request.query(`
    SELECT
      d.DashboardId,
      d.DashboardKey,
      d.DashboardName,
      d.WorkspaceId,
      w.WorkspaceName,
      d.RoleId,
      r.RoleName,
      d.AssignmentTypeId,
      at.AssignmentName,
      d.ModuleId,
      m.ModuleName,
      d.IsDefault,
      d.VisibilityStatusId,
      fvs.StatusKey AS VisibilityStatusKey,
      fvs.StatusName AS VisibilityStatusName,
      d.CreatedAt,
      d.UpdatedAt
    FROM dbo.Dashboards d
    LEFT JOIN dbo.Workspaces w ON d.WorkspaceId = w.WorkspaceId
    LEFT JOIN dbo.Roles r ON d.RoleId = r.RoleId
    LEFT JOIN dbo.AssignmentTypes at ON d.AssignmentTypeId = at.AssignmentTypeId
    LEFT JOIN dbo.Modules m ON d.ModuleId = m.ModuleId
    INNER JOIN dbo.FeatureVisibilityStatuses fvs
      ON d.VisibilityStatusId = fvs.VisibilityStatusId
    WHERE
      (
        d.DashboardKey LIKE @Search
        OR d.DashboardName LIKE @Search
        OR ISNULL(w.WorkspaceName, '') LIKE @Search
        OR ISNULL(r.RoleName, '') LIKE @Search
        OR ISNULL(at.AssignmentName, '') LIKE @Search
        OR ISNULL(m.ModuleName, '') LIKE @Search
        OR ISNULL(fvs.StatusName, '') LIKE @Search
      )
      AND (@WorkspaceId IS NULL OR d.WorkspaceId = @WorkspaceId)
      AND (@RoleId IS NULL OR d.RoleId = @RoleId)
      AND (@AssignmentTypeId IS NULL OR d.AssignmentTypeId = @AssignmentTypeId)
      AND (@ModuleId IS NULL OR d.ModuleId = @ModuleId)
      AND (@VisibilityStatusId IS NULL OR d.VisibilityStatusId = @VisibilityStatusId)
      AND (@IsDefault IS NULL OR d.IsDefault = @IsDefault)
    ORDER BY d.DashboardId DESC
    OFFSET @Offset ROWS
    FETCH NEXT @Limit ROWS ONLY;

    SELECT COUNT(*) AS Total
    FROM dbo.Dashboards d
    LEFT JOIN dbo.Workspaces w ON d.WorkspaceId = w.WorkspaceId
    LEFT JOIN dbo.Roles r ON d.RoleId = r.RoleId
    LEFT JOIN dbo.AssignmentTypes at ON d.AssignmentTypeId = at.AssignmentTypeId
    LEFT JOIN dbo.Modules m ON d.ModuleId = m.ModuleId
    INNER JOIN dbo.FeatureVisibilityStatuses fvs
      ON d.VisibilityStatusId = fvs.VisibilityStatusId
    WHERE
      (
        d.DashboardKey LIKE @Search
        OR d.DashboardName LIKE @Search
        OR ISNULL(w.WorkspaceName, '') LIKE @Search
        OR ISNULL(r.RoleName, '') LIKE @Search
        OR ISNULL(at.AssignmentName, '') LIKE @Search
        OR ISNULL(m.ModuleName, '') LIKE @Search
        OR ISNULL(fvs.StatusName, '') LIKE @Search
      )
      AND (@WorkspaceId IS NULL OR d.WorkspaceId = @WorkspaceId)
      AND (@RoleId IS NULL OR d.RoleId = @RoleId)
      AND (@AssignmentTypeId IS NULL OR d.AssignmentTypeId = @AssignmentTypeId)
      AND (@ModuleId IS NULL OR d.ModuleId = @ModuleId)
      AND (@VisibilityStatusId IS NULL OR d.VisibilityStatusId = @VisibilityStatusId)
      AND (@IsDefault IS NULL OR d.IsDefault = @IsDefault);
  `);

  return {
    rows: result.recordsets[0],
    total: result.recordsets[1][0].Total,
  };
};

const getDashboardById = async (dashboardId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("DashboardId", sql.Int, dashboardId)
    .query(`
      SELECT
        d.*,
        w.WorkspaceName,
        r.RoleName,
        at.AssignmentName,
        m.ModuleName,
        fvs.StatusKey AS VisibilityStatusKey,
        fvs.StatusName AS VisibilityStatusName
      FROM dbo.Dashboards d
      LEFT JOIN dbo.Workspaces w ON d.WorkspaceId = w.WorkspaceId
      LEFT JOIN dbo.Roles r ON d.RoleId = r.RoleId
      LEFT JOIN dbo.AssignmentTypes at ON d.AssignmentTypeId = at.AssignmentTypeId
      LEFT JOIN dbo.Modules m ON d.ModuleId = m.ModuleId
      INNER JOIN dbo.FeatureVisibilityStatuses fvs
        ON d.VisibilityStatusId = fvs.VisibilityStatusId
      WHERE d.DashboardId = @DashboardId;
    `);

  return result.recordset[0];
};

const getDashboardByKey = async (dashboardKey) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("DashboardKey", sql.NVarChar, dashboardKey)
    .query(`
      SELECT TOP 1 *
      FROM dbo.Dashboards
      WHERE DashboardKey = @DashboardKey;
    `);

  return result.recordset[0];
};

const existsById = async (tableName, columnName, id) => {
  const allowed = {
    Workspaces: "WorkspaceId",
    Roles: "RoleId",
    AssignmentTypes: "AssignmentTypeId",
    Modules: "ModuleId",
    FeatureVisibilityStatuses: "VisibilityStatusId",
  };

  if (!allowed[tableName] || allowed[tableName] !== columnName) {
    throw new Error("Invalid lookup validation target.");
  }

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("Id", sql.Int, id)
    .query(`
      SELECT TOP 1 ${columnName}
      FROM dbo.${tableName}
      WHERE ${columnName} = @Id;
    `);

  return Boolean(result.recordset[0]);
};

const createDashboard = async (data) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("DashboardKey", sql.NVarChar, data.dashboardKey)
    .input("DashboardName", sql.NVarChar, data.dashboardName)
    .input("WorkspaceId", sql.Int, data.workspaceId)
    .input("RoleId", sql.Int, data.roleId)
    .input("AssignmentTypeId", sql.Int, data.assignmentTypeId)
    .input("ModuleId", sql.Int, data.moduleId)
    .input("IsDefault", sql.Bit, data.isDefault)
    .input("VisibilityStatusId", sql.Int, data.visibilityStatusId)
    .query(`
      INSERT INTO dbo.Dashboards
      (
        DashboardKey,
        DashboardName,
        WorkspaceId,
        RoleId,
        AssignmentTypeId,
        ModuleId,
        IsDefault,
        VisibilityStatusId,
        CreatedAt,
        UpdatedAt
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @DashboardKey,
        @DashboardName,
        @WorkspaceId,
        @RoleId,
        @AssignmentTypeId,
        @ModuleId,
        @IsDefault,
        @VisibilityStatusId,
        GETDATE(),
        NULL
      );
    `);

  return result.recordset[0];
};

const updateDashboard = async (dashboardId, data) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("DashboardId", sql.Int, dashboardId)
    .input("DashboardKey", sql.NVarChar, data.dashboardKey)
    .input("DashboardName", sql.NVarChar, data.dashboardName)
    .input("WorkspaceId", sql.Int, data.workspaceId)
    .input("RoleId", sql.Int, data.roleId)
    .input("AssignmentTypeId", sql.Int, data.assignmentTypeId)
    .input("ModuleId", sql.Int, data.moduleId)
    .input("IsDefault", sql.Bit, data.isDefault)
    .input("VisibilityStatusId", sql.Int, data.visibilityStatusId)
    .query(`
      UPDATE dbo.Dashboards
      SET
        DashboardKey = @DashboardKey,
        DashboardName = @DashboardName,
        WorkspaceId = @WorkspaceId,
        RoleId = @RoleId,
        AssignmentTypeId = @AssignmentTypeId,
        ModuleId = @ModuleId,
        IsDefault = @IsDefault,
        VisibilityStatusId = @VisibilityStatusId,
        UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE DashboardId = @DashboardId;
    `);

  return result.recordset[0];
};

const deleteDashboard = async (dashboardId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("DashboardId", sql.Int, dashboardId)
    .query(`
      DELETE FROM dbo.Dashboards
      OUTPUT DELETED.*
      WHERE DashboardId = @DashboardId;
    `);

  return result.recordset[0];
};

const getDashboardUsageCounts = async (dashboardId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("DashboardId", sql.Int, dashboardId)
    .query(`
      SELECT 'DashboardWidgets' AS TableName, COUNT(*) AS Total
      FROM dbo.DashboardWidgets
      WHERE DashboardId = @DashboardId

      UNION ALL

      SELECT 'DashboardKPIs', COUNT(*)
      FROM dbo.DashboardKPIs
      WHERE DashboardId = @DashboardId;
    `);

  return result.recordset;
};

const getDashboardLookups = async () => {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT WorkspaceId, WorkspaceKey, WorkspaceName
    FROM dbo.Workspaces
    WHERE IsActive = 1
    ORDER BY SortOrder, WorkspaceName;

    SELECT RoleId, RoleKey, RoleName
    FROM dbo.Roles
    WHERE IsActive = 1
    ORDER BY RoleName;

    SELECT AssignmentTypeId, AssignmentKey, AssignmentName
    FROM dbo.AssignmentTypes
    WHERE IsActive = 1
    ORDER BY SortOrder, AssignmentName;

    SELECT ModuleId, ModuleKey, ModuleName
    FROM dbo.Modules
    WHERE IsActive = 1
    ORDER BY SortOrder, ModuleName;

    SELECT VisibilityStatusId, StatusKey, StatusName
    FROM dbo.FeatureVisibilityStatuses
    ORDER BY SortOrder;
  `);

  return {
    workspaces: result.recordsets[0],
    roles: result.recordsets[1],
    assignmentTypes: result.recordsets[2],
    modules: result.recordsets[3],
    visibilityStatuses: result.recordsets[4],
  };
};

module.exports = {
  getDashboards,
  getDashboardById,
  getDashboardByKey,
  existsById,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  getDashboardUsageCounts,
  getDashboardLookups,
};