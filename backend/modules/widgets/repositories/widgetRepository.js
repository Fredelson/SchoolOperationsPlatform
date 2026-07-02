// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget Repository
// ============================================
//
// Purpose:
// Handles all SQL Server operations for Widget Manager.
//
// Rules:
// - SQL only lives here.
// - No Express req/res here.
// - No frontend formatting here.
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../../../config/db");

const {
  WIDGET_DEFAULTS,
  WIDGET_SORT_COLUMNS,
} = require("../constants/widgetDefaults");

// ============================================
// Helpers
// ============================================

function normalizePagination(query = {}) {
  const page = Math.max(Number(query.page) || WIDGET_DEFAULTS.DEFAULT_PAGE, 1);

  const pageSize = Math.min(
    Math.max(Number(query.pageSize) || WIDGET_DEFAULTS.DEFAULT_PAGE_SIZE, 1),
    WIDGET_DEFAULTS.MAX_PAGE_SIZE
  );

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}

function normalizeSort(query = {}) {
  const requestedColumn =
    query.sortColumn || WIDGET_DEFAULTS.DEFAULT_SORT_COLUMN;

  const sortColumn = WIDGET_SORT_COLUMNS.includes(requestedColumn)
    ? requestedColumn
    : WIDGET_DEFAULTS.DEFAULT_SORT_COLUMN;

  const requestedDirection = String(
    query.sortDirection || WIDGET_DEFAULTS.DEFAULT_SORT_DIRECTION
  ).toUpperCase();

  return {
    sortColumn,
    sortDirection: requestedDirection === "DESC" ? "DESC" : "ASC",
  };
}

// ============================================
// Get Widgets
// ============================================

async function getWidgets(query = {}) {
  const pool = await poolPromise;

  const { page, pageSize, offset } = normalizePagination(query);
  const { sortColumn, sortDirection } = normalizeSort(query);

  const search = query.search ? `%${query.search}%` : null;
  const moduleId = query.moduleId ? Number(query.moduleId) : null;
  const visibilityStatusId = query.visibilityStatusId
    ? Number(query.visibilityStatusId)
    : null;

  const result = await pool
    .request()
    .input("Search", sql.NVarChar(150), search)
    .input("ModuleId", sql.Int, moduleId)
    .input("VisibilityStatusId", sql.Int, visibilityStatusId)
    .input("Offset", sql.Int, offset)
    .input("PageSize", sql.Int, pageSize)
    .query(`
      SELECT
        w.WidgetId,
        w.ModuleId,
        m.ModuleName,
        m.ModuleKey,
        w.WidgetKey,
        w.WidgetName,
        w.WidgetType,
        w.DataSourceKey,
        w.Description,
        w.PermissionId,
        p.PermissionName,
        p.PermissionKey,
        w.FeatureFlagId,
        ff.FeatureName AS FeatureFlagName,
        ff.FeatureKey AS FeatureFlagKey,
        w.VisibilityStatusId,
        vs.StatusName AS VisibilityStatusName,
        w.DefaultWidth,
        w.DefaultHeight,
        w.SortOrder,
        w.CreatedAt,
        w.UpdatedAt,
        COUNT(*) OVER() AS TotalCount
      FROM dbo.Widgets w
      LEFT JOIN dbo.Modules m
        ON w.ModuleId = m.ModuleId
      LEFT JOIN dbo.Permissions p
        ON w.PermissionId = p.PermissionId
      LEFT JOIN dbo.FeatureFlags ff
        ON w.FeatureFlagId = ff.FeatureFlagId
      LEFT JOIN dbo.FeatureVisibilityStatuses vs
        ON w.VisibilityStatusId = vs.VisibilityStatusId
      WHERE
        (
          @Search IS NULL
          OR w.WidgetKey LIKE @Search
          OR w.WidgetName LIKE @Search
          OR w.WidgetType LIKE @Search
          OR w.DataSourceKey LIKE @Search
          OR m.ModuleName LIKE @Search
        )
        AND (@ModuleId IS NULL OR w.ModuleId = @ModuleId)
        AND (@VisibilityStatusId IS NULL OR w.VisibilityStatusId = @VisibilityStatusId)
      ORDER BY ${sortColumn} ${sortDirection}
      OFFSET @Offset ROWS
      FETCH NEXT @PageSize ROWS ONLY;
    `);

  const totalCount = result.recordset[0]?.TotalCount || 0;

  return {
    rows: result.recordset,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

// ============================================
// Get Widget By ID
// ============================================

async function getWidgetById(widgetId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("WidgetId", sql.Int, widgetId)
    .query(`
      SELECT
        w.WidgetId,
        w.ModuleId,
        m.ModuleName,
        w.WidgetKey,
        w.WidgetName,
        w.WidgetType,
        w.DataSourceKey,
        w.Description,
        w.PermissionId,
        p.PermissionName,
        w.FeatureFlagId,
        ff.FeatureName AS FeatureFlagName,
        w.VisibilityStatusId,
        vs.StatusName AS VisibilityStatusName,
        w.DefaultWidth,
        w.DefaultHeight,
        w.SortOrder,
        w.CreatedAt,
        w.UpdatedAt
      FROM dbo.Widgets w
      LEFT JOIN dbo.Modules m
        ON w.ModuleId = m.ModuleId
      LEFT JOIN dbo.Permissions p
        ON w.PermissionId = p.PermissionId
      LEFT JOIN dbo.FeatureFlags ff
        ON w.FeatureFlagId = ff.FeatureFlagId
      LEFT JOIN dbo.FeatureVisibilityStatuses vs
        ON w.VisibilityStatusId = vs.VisibilityStatusId
      WHERE w.WidgetId = @WidgetId;
    `);

  return result.recordset[0] || null;
}

// ============================================
// Duplicate Check
// ============================================

async function isWidgetKeyTaken(widgetKey, excludeWidgetId = null) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("WidgetKey", sql.NVarChar(100), widgetKey)
    .input("ExcludeWidgetId", sql.Int, excludeWidgetId)
    .query(`
      SELECT COUNT(1) AS CountValue
      FROM dbo.Widgets
      WHERE WidgetKey = @WidgetKey
        AND (@ExcludeWidgetId IS NULL OR WidgetId <> @ExcludeWidgetId);
    `);

  return result.recordset[0].CountValue > 0;
}

// ============================================
// Create Widget
// ============================================

async function createWidget(data) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("ModuleId", sql.Int, data.moduleId)
    .input("WidgetKey", sql.NVarChar(100), data.widgetKey)
    .input("WidgetName", sql.NVarChar(150), data.widgetName)
    .input("WidgetType", sql.NVarChar(100), data.widgetType)
    .input("DataSourceKey", sql.NVarChar(150), data.dataSourceKey)
    .input("Description", sql.NVarChar(500), data.description)
    .input("PermissionId", sql.Int, data.permissionId)
    .input("FeatureFlagId", sql.Int, data.featureFlagId)
    .input("VisibilityStatusId", sql.Int, data.visibilityStatusId)
    .input("DefaultWidth", sql.Int, data.defaultWidth)
    .input("DefaultHeight", sql.Int, data.defaultHeight)
    .input("SortOrder", sql.Int, data.sortOrder)
    .query(`
      INSERT INTO dbo.Widgets (
        ModuleId,
        WidgetKey,
        WidgetName,
        WidgetType,
        DataSourceKey,
        Description,
        PermissionId,
        FeatureFlagId,
        VisibilityStatusId,
        DefaultWidth,
        DefaultHeight,
        SortOrder,
        CreatedAt,
        UpdatedAt
      )
      OUTPUT INSERTED.WidgetId
      VALUES (
        @ModuleId,
        @WidgetKey,
        @WidgetName,
        @WidgetType,
        @DataSourceKey,
        @Description,
        @PermissionId,
        @FeatureFlagId,
        @VisibilityStatusId,
        @DefaultWidth,
        @DefaultHeight,
        @SortOrder,
        GETDATE(),
        NULL
      );
    `);

  return result.recordset[0].WidgetId;
}

// ============================================
// Update Widget
// ============================================

async function updateWidget(widgetId, data) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("WidgetId", sql.Int, widgetId)
    .input("ModuleId", sql.Int, data.moduleId)
    .input("WidgetKey", sql.NVarChar(100), data.widgetKey)
    .input("WidgetName", sql.NVarChar(150), data.widgetName)
    .input("WidgetType", sql.NVarChar(100), data.widgetType)
    .input("DataSourceKey", sql.NVarChar(150), data.dataSourceKey)
    .input("Description", sql.NVarChar(500), data.description)
    .input("PermissionId", sql.Int, data.permissionId)
    .input("FeatureFlagId", sql.Int, data.featureFlagId)
    .input("VisibilityStatusId", sql.Int, data.visibilityStatusId)
    .input("DefaultWidth", sql.Int, data.defaultWidth)
    .input("DefaultHeight", sql.Int, data.defaultHeight)
    .input("SortOrder", sql.Int, data.sortOrder)
    .query(`
      UPDATE dbo.Widgets
      SET
        ModuleId = @ModuleId,
        WidgetKey = @WidgetKey,
        WidgetName = @WidgetName,
        WidgetType = @WidgetType,
        DataSourceKey = @DataSourceKey,
        Description = @Description,
        PermissionId = @PermissionId,
        FeatureFlagId = @FeatureFlagId,
        VisibilityStatusId = @VisibilityStatusId,
        DefaultWidth = @DefaultWidth,
        DefaultHeight = @DefaultHeight,
        SortOrder = @SortOrder,
        UpdatedAt = GETDATE()
      WHERE WidgetId = @WidgetId;

      SELECT @@ROWCOUNT AS RowsAffected;
    `);

  return result.recordset[0].RowsAffected;
}

// ============================================
// Delete Widget
// ============================================

async function deleteWidget(widgetId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("WidgetId", sql.Int, widgetId)
    .query(`
      DELETE FROM dbo.Widgets
      WHERE WidgetId = @WidgetId;

      SELECT @@ROWCOUNT AS RowsAffected;
    `);

  return result.recordset[0].RowsAffected;
}

// ============================================
// Statistics
// ============================================

async function getWidgetStatistics() {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT
      COUNT(1) AS TotalWidgets,
      SUM(CASE WHEN VisibilityStatusId = 1 THEN 1 ELSE 0 END) AS VisibleWidgets,
      SUM(CASE WHEN PermissionId IS NOT NULL THEN 1 ELSE 0 END) AS PermissionProtectedWidgets,
      SUM(CASE WHEN FeatureFlagId IS NOT NULL THEN 1 ELSE 0 END) AS FeatureControlledWidgets
    FROM dbo.Widgets;
  `);

  return result.recordset[0];
}

// ============================================
// Lookups
// ============================================

async function getWidgetLookups() {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT ModuleId, ModuleName, ModuleKey
    FROM dbo.Modules
    ORDER BY ModuleName;

    SELECT PermissionId, PermissionName, PermissionKey
    FROM dbo.Permissions
    ORDER BY PermissionName;

    SELECT FeatureFlagId, FeatureName, FeatureKey
    FROM dbo.FeatureFlags
    ORDER BY FeatureName;

    SELECT VisibilityStatusId, StatusName
    FROM dbo.FeatureVisibilityStatuses
    ORDER BY VisibilityStatusId;
  `);

  return {
    modules: result.recordsets[0] || [],
    permissions: result.recordsets[1] || [],
    featureFlags: result.recordsets[2] || [],
    visibilityStatuses: result.recordsets[3] || [],
  };
}

module.exports = {
  getWidgets,
  getWidgetById,
  isWidgetKeyTaken,
  createWidget,
  updateWidget,
  deleteWidget,
  getWidgetStatistics,
  getWidgetLookups,
};