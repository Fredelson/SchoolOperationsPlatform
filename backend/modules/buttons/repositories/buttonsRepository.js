// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Repository
// ============================================
//
// Purpose:
// Handles all SQL Server operations for the Button Manager.
//
// Architecture:
// Repository → Service → Controller → Routes
//
// Rules:
// - SQL only lives here.
// - No Express request/response here.
// - No frontend formatting here.
// - No business decision logic here.
// ============================================

const sql = require("mssql");

// IMPORTANT:
// This matches your existing backend database pattern.
// config/db.js exports the pool promise directly,
// not a getPool() function.
const { poolPromise } = require("../../../config/db");

const {
  BUTTON_DEFAULTS,
  BUTTON_SORT_COLUMNS,
} = require("../constants/buttonsDefaults");

// ============================================
// Pagination Normalizer
// ============================================
//
// Purpose:
// Converts query string pagination values into safe numbers.
// Prevents invalid page/pageSize values from breaking SQL.
// ============================================

function normalizePagination(query = {}) {
  const page = Math.max(
    Number(query.page) || BUTTON_DEFAULTS.DEFAULT_PAGE,
    1
  );

  const pageSize = Math.min(
    Math.max(Number(query.pageSize) || BUTTON_DEFAULTS.DEFAULT_PAGE_SIZE, 1),
    BUTTON_DEFAULTS.MAX_PAGE_SIZE
  );

  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

// ============================================
// Sort Normalizer
// ============================================
//
// Purpose:
// Allows sorting only by approved column names.
// This protects ORDER BY from SQL injection.
// ============================================

function normalizeSort(query = {}) {
  const requestedColumn =
    query.sortColumn || BUTTON_DEFAULTS.DEFAULT_SORT_COLUMN;

  const sortColumn = BUTTON_SORT_COLUMNS.includes(requestedColumn)
    ? requestedColumn
    : BUTTON_DEFAULTS.DEFAULT_SORT_COLUMN;

  const requestedDirection = String(
    query.sortDirection || BUTTON_DEFAULTS.DEFAULT_SORT_DIRECTION
  ).toUpperCase();

  const sortDirection = requestedDirection === "ASC" ? "ASC" : "DESC";

  return { sortColumn, sortDirection };
}

// ============================================
// Get Buttons
// ============================================
//
// Purpose:
// Returns paginated Button Manager records.
// Supports:
// - Search
// - Module filter
// - Visibility filter
// - Sorting
// - Pagination
// ============================================

async function getButtons(query = {}) {
  const pool = await poolPromise;

  const { page, pageSize, offset } = normalizePagination(query);
  const { sortColumn, sortDirection } = normalizeSort(query);

  const search = query.search ? `%${query.search}%` : null;
  const moduleId = query.moduleId ? Number(query.moduleId) : null;
  const visibilityStatusId = query.visibilityStatusId
    ? Number(query.visibilityStatusId)
    : null;

  const request = pool.request();

  request.input("Search", sql.NVarChar(150), search);
  request.input("ModuleId", sql.Int, moduleId);
  request.input("VisibilityStatusId", sql.Int, visibilityStatusId);
  request.input("Offset", sql.Int, offset);
  request.input("PageSize", sql.Int, pageSize);

  const result = await request.query(`
    SELECT
      b.ButtonId,
      b.ModuleId,
      m.ModuleName,
      b.ButtonKey,
      b.ButtonName,
      b.PermissionId,
      p.PermissionName,
      p.PermissionKey,
      b.FeatureFlagId,
      ff.FeatureName AS FeatureFlagName,
      ff.FeatureKey AS FeatureFlagKey,
      b.VisibilityStatusId,
      vs.StatusName AS VisibilityStatusName,
      b.CreatedAt,
      b.UpdatedAt,
      COUNT(*) OVER() AS TotalCount
    FROM dbo.Buttons b
    INNER JOIN dbo.Modules m
      ON b.ModuleId = m.ModuleId
    LEFT JOIN dbo.Permissions p
      ON b.PermissionId = p.PermissionId
    LEFT JOIN dbo.FeatureFlags ff
      ON b.FeatureFlagId = ff.FeatureFlagId
    LEFT JOIN dbo.FeatureVisibilityStatuses vs
      ON b.VisibilityStatusId = vs.VisibilityStatusId
    WHERE
      (
        @Search IS NULL
        OR b.ButtonKey LIKE @Search
        OR b.ButtonName LIKE @Search
        OR m.ModuleName LIKE @Search
      )
      AND (@ModuleId IS NULL OR b.ModuleId = @ModuleId)
      AND (@VisibilityStatusId IS NULL OR b.VisibilityStatusId = @VisibilityStatusId)
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
// Get Button By ID
// ============================================

async function getButtonById(buttonId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("ButtonId", sql.Int, buttonId)
    .query(`
      SELECT
        b.ButtonId,
        b.ModuleId,
        m.ModuleName,
        b.ButtonKey,
        b.ButtonName,
        b.PermissionId,
        p.PermissionName,
        p.PermissionKey,
        b.FeatureFlagId,
        ff.FeatureName AS FeatureFlagName,
        ff.FeatureKey AS FeatureFlagKey,
        b.VisibilityStatusId,
        vs.StatusName AS VisibilityStatusName,
        b.CreatedAt,
        b.UpdatedAt
      FROM dbo.Buttons b
      INNER JOIN dbo.Modules m
        ON b.ModuleId = m.ModuleId
      LEFT JOIN dbo.Permissions p
        ON b.PermissionId = p.PermissionId
      LEFT JOIN dbo.FeatureFlags ff
        ON b.FeatureFlagId = ff.FeatureFlagId
      LEFT JOIN dbo.FeatureVisibilityStatuses vs
        ON b.VisibilityStatusId = vs.VisibilityStatusId
      WHERE b.ButtonId = @ButtonId;
    `);

  return result.recordset[0] || null;
}

// ============================================
// Check Duplicate Button Key
// ============================================

async function isButtonKeyTaken(buttonKey, excludeButtonId = null) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("ButtonKey", sql.NVarChar(100), buttonKey)
    .input("ExcludeButtonId", sql.Int, excludeButtonId)
    .query(`
      SELECT COUNT(1) AS CountValue
      FROM dbo.Buttons
      WHERE ButtonKey = @ButtonKey
        AND (@ExcludeButtonId IS NULL OR ButtonId <> @ExcludeButtonId);
    `);

  return result.recordset[0].CountValue > 0;
}

// ============================================
// Create Button
// ============================================

async function createButton(data) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("ModuleId", sql.Int, data.moduleId)
    .input("ButtonKey", sql.NVarChar(100), data.buttonKey)
    .input("ButtonName", sql.NVarChar(150), data.buttonName)
    .input("PermissionId", sql.Int, data.permissionId)
    .input("FeatureFlagId", sql.Int, data.featureFlagId)
    .input("VisibilityStatusId", sql.Int, data.visibilityStatusId)
    .query(`
      INSERT INTO dbo.Buttons (
        ModuleId,
        ButtonKey,
        ButtonName,
        PermissionId,
        FeatureFlagId,
        VisibilityStatusId,
        CreatedAt,
        UpdatedAt
      )
      OUTPUT INSERTED.ButtonId
      VALUES (
        @ModuleId,
        @ButtonKey,
        @ButtonName,
        @PermissionId,
        @FeatureFlagId,
        @VisibilityStatusId,
        GETDATE(),
        NULL
      );
    `);

  return result.recordset[0].ButtonId;
}

// ============================================
// Update Button
// ============================================

async function updateButton(buttonId, data) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("ButtonId", sql.Int, buttonId)
    .input("ModuleId", sql.Int, data.moduleId)
    .input("ButtonKey", sql.NVarChar(100), data.buttonKey)
    .input("ButtonName", sql.NVarChar(150), data.buttonName)
    .input("PermissionId", sql.Int, data.permissionId)
    .input("FeatureFlagId", sql.Int, data.featureFlagId)
    .input("VisibilityStatusId", sql.Int, data.visibilityStatusId)
    .query(`
      UPDATE dbo.Buttons
      SET
        ModuleId = @ModuleId,
        ButtonKey = @ButtonKey,
        ButtonName = @ButtonName,
        PermissionId = @PermissionId,
        FeatureFlagId = @FeatureFlagId,
        VisibilityStatusId = @VisibilityStatusId,
        UpdatedAt = GETDATE()
      WHERE ButtonId = @ButtonId;

      SELECT @@ROWCOUNT AS RowsAffected;
    `);

  return result.recordset[0].RowsAffected;
}

// ============================================
// Delete Button
// ============================================

async function deleteButton(buttonId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("ButtonId", sql.Int, buttonId)
    .query(`
      DELETE FROM dbo.Buttons
      WHERE ButtonId = @ButtonId;

      SELECT @@ROWCOUNT AS RowsAffected;
    `);

  return result.recordset[0].RowsAffected;
}

// ============================================
// Button Statistics
// ============================================

async function getButtonStatistics() {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT
      COUNT(1) AS TotalButtons,
      SUM(CASE WHEN VisibilityStatusId = 1 THEN 1 ELSE 0 END) AS VisibleButtons,
      SUM(CASE WHEN PermissionId IS NOT NULL THEN 1 ELSE 0 END) AS PermissionProtectedButtons,
      SUM(CASE WHEN FeatureFlagId IS NOT NULL THEN 1 ELSE 0 END) AS FeatureControlledButtons
    FROM dbo.Buttons;
  `);

  return result.recordset[0];
}

// ============================================
// Button Lookups
// ============================================
//
// Purpose:
// Loads dropdown data for Button Manager forms.
//
// Notes:
// FeatureFlags table uses:
// - FeatureName
// - FeatureKey
//
// It does NOT use:
// - FeatureFlagName
// - FeatureFlagKey
// ============================================

async function getButtonLookups() {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT
      ModuleId,
      ModuleName,
      ModuleKey
    FROM dbo.Modules
    ORDER BY ModuleName;

    SELECT
      PermissionId,
      PermissionName,
      PermissionKey
    FROM dbo.Permissions
    ORDER BY PermissionName;

    SELECT
      FeatureFlagId,
      FeatureName AS FeatureFlagName,
      FeatureKey AS FeatureFlagKey
    FROM dbo.FeatureFlags
    ORDER BY FeatureName;

    SELECT
      VisibilityStatusId,
      StatusName
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

// ============================================
// Exports
// ============================================

module.exports = {
  getButtons,
  getButtonById,
  isButtonKeyTaken,
  createButton,
  updateButton,
  deleteButton,
  getButtonStatistics,
  getButtonLookups,
};