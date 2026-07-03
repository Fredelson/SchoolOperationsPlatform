/* =========================================================
   Feature Flag Repository
   Purpose:
   Handles all SQL Server database operations for Feature Flag Manager.

   Architecture:
   Repository → Service → Controller → Routes
========================================================= */

const { poolPromise, sql } = require("../../../config/db");

/* =========================================================
   GET FEATURE FLAGS WITH SEARCH + FILTER + PAGINATION
========================================================= */
const getFeatureFlags = async ({
  search = "",
  moduleId = null,
  visibilityStatusId = null,
  isEnabled = null,
  page = 1,
  limit = 10,
}) => {
  const pool = await poolPromise;

  const offset = (page - 1) * limit;

  const request = pool.request();

  request.input("Search", sql.NVarChar, `%${search}%`);
  request.input("ModuleId", sql.Int, moduleId);
  request.input("VisibilityStatusId", sql.Int, visibilityStatusId);
  request.input("IsEnabled", sql.Bit, isEnabled);
  request.input("Offset", sql.Int, offset);
  request.input("Limit", sql.Int, limit);

  const result = await request.query(`
    SELECT
      ff.FeatureFlagId,
      ff.FeatureKey,
      ff.FeatureName,
      ff.Description,
      ff.ModuleId,
      m.ModuleName,
      ff.VisibilityStatusId,
      fvs.StatusName AS VisibilityStatusName,
      fvs.StatusKey AS VisibilityStatusKey,
      ff.IsEnabled,
      ff.CreatedAt,
      ff.UpdatedAt
    FROM dbo.FeatureFlags ff
    LEFT JOIN dbo.Modules m
      ON ff.ModuleId = m.ModuleId
    LEFT JOIN dbo.FeatureVisibilityStatuses fvs
      ON ff.VisibilityStatusId = fvs.VisibilityStatusId
    WHERE
      (
        ff.FeatureKey LIKE @Search
        OR ff.FeatureName LIKE @Search
        OR ISNULL(ff.Description, '') LIKE @Search
        OR ISNULL(m.ModuleName, '') LIKE @Search
        OR ISNULL(fvs.StatusName, '') LIKE @Search
      )
      AND (@ModuleId IS NULL OR ff.ModuleId = @ModuleId)
      AND (@VisibilityStatusId IS NULL OR ff.VisibilityStatusId = @VisibilityStatusId)
      AND (@IsEnabled IS NULL OR ff.IsEnabled = @IsEnabled)
    ORDER BY ff.FeatureFlagId DESC
    OFFSET @Offset ROWS
    FETCH NEXT @Limit ROWS ONLY;

    SELECT COUNT(*) AS Total
    FROM dbo.FeatureFlags ff
    LEFT JOIN dbo.Modules m
      ON ff.ModuleId = m.ModuleId
    LEFT JOIN dbo.FeatureVisibilityStatuses fvs
      ON ff.VisibilityStatusId = fvs.VisibilityStatusId
    WHERE
      (
        ff.FeatureKey LIKE @Search
        OR ff.FeatureName LIKE @Search
        OR ISNULL(ff.Description, '') LIKE @Search
        OR ISNULL(m.ModuleName, '') LIKE @Search
        OR ISNULL(fvs.StatusName, '') LIKE @Search
      )
      AND (@ModuleId IS NULL OR ff.ModuleId = @ModuleId)
      AND (@VisibilityStatusId IS NULL OR ff.VisibilityStatusId = @VisibilityStatusId)
      AND (@IsEnabled IS NULL OR ff.IsEnabled = @IsEnabled);
  `);

  return {
    rows: result.recordsets[0],
    total: result.recordsets[1][0].Total,
  };
};

/* =========================================================
   GET FEATURE FLAG BY ID
========================================================= */
const getFeatureFlagById = async (featureFlagId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("FeatureFlagId", sql.Int, featureFlagId)
    .query(`
      SELECT
        ff.FeatureFlagId,
        ff.FeatureKey,
        ff.FeatureName,
        ff.Description,
        ff.ModuleId,
        m.ModuleName,
        ff.VisibilityStatusId,
        fvs.StatusName AS VisibilityStatusName,
        fvs.StatusKey AS VisibilityStatusKey,
        ff.IsEnabled,
        ff.CreatedAt,
        ff.UpdatedAt
      FROM dbo.FeatureFlags ff
      LEFT JOIN dbo.Modules m
        ON ff.ModuleId = m.ModuleId
      LEFT JOIN dbo.FeatureVisibilityStatuses fvs
        ON ff.VisibilityStatusId = fvs.VisibilityStatusId
      WHERE ff.FeatureFlagId = @FeatureFlagId;
    `);

  return result.recordset[0];
};

/* =========================================================
   CHECK DUPLICATE FEATURE KEY
========================================================= */
const getFeatureFlagByKey = async (featureKey) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("FeatureKey", sql.NVarChar, featureKey)
    .query(`
      SELECT TOP 1 *
      FROM dbo.FeatureFlags
      WHERE FeatureKey = @FeatureKey;
    `);

  return result.recordset[0];
};

/* =========================================================
   CREATE FEATURE FLAG
========================================================= */
const createFeatureFlag = async (data) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("FeatureKey", sql.NVarChar, data.featureKey)
    .input("FeatureName", sql.NVarChar, data.featureName)
    .input("Description", sql.NVarChar, data.description || null)
    .input("ModuleId", sql.Int, data.moduleId)
    .input("VisibilityStatusId", sql.Int, data.visibilityStatusId)
    .input("IsEnabled", sql.Bit, data.isEnabled)
    .query(`
      INSERT INTO dbo.FeatureFlags
      (
        FeatureKey,
        FeatureName,
        Description,
        ModuleId,
        VisibilityStatusId,
        IsEnabled,
        CreatedAt,
        UpdatedAt
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @FeatureKey,
        @FeatureName,
        @Description,
        @ModuleId,
        @VisibilityStatusId,
        @IsEnabled,
        GETDATE(),
        NULL
      );
    `);

  return result.recordset[0];
};

/* =========================================================
   UPDATE FEATURE FLAG
========================================================= */
const updateFeatureFlag = async (featureFlagId, data) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("FeatureFlagId", sql.Int, featureFlagId)
    .input("FeatureKey", sql.NVarChar, data.featureKey)
    .input("FeatureName", sql.NVarChar, data.featureName)
    .input("Description", sql.NVarChar, data.description || null)
    .input("ModuleId", sql.Int, data.moduleId)
    .input("VisibilityStatusId", sql.Int, data.visibilityStatusId)
    .input("IsEnabled", sql.Bit, data.isEnabled)
    .query(`
      UPDATE dbo.FeatureFlags
      SET
        FeatureKey = @FeatureKey,
        FeatureName = @FeatureName,
        Description = @Description,
        ModuleId = @ModuleId,
        VisibilityStatusId = @VisibilityStatusId,
        IsEnabled = @IsEnabled,
        UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE FeatureFlagId = @FeatureFlagId;
    `);

  return result.recordset[0];
};

/* =========================================================
   DELETE FEATURE FLAG
========================================================= */
const deleteFeatureFlag = async (featureFlagId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("FeatureFlagId", sql.Int, featureFlagId)
    .query(`
      DELETE FROM dbo.FeatureFlags
      OUTPUT DELETED.*
      WHERE FeatureFlagId = @FeatureFlagId;
    `);

  return result.recordset[0];
};

/* =========================================================
   LOOKUPS
========================================================= */
const getFeatureFlagLookups = async () => {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT
      ModuleId,
      ModuleKey,
      ModuleName
    FROM dbo.Modules
    WHERE IsActive = 1
    ORDER BY SortOrder, ModuleName;

    SELECT
      VisibilityStatusId,
      StatusKey,
      StatusName
    FROM dbo.FeatureVisibilityStatuses
    ORDER BY SortOrder;
  `);

  return {
    modules: result.recordsets[0],
    visibilityStatuses: result.recordsets[1],
  };
};

/* =========================================================
   EXPORT REPOSITORY FUNCTIONS
========================================================= */
module.exports = {
  getFeatureFlags,
  getFeatureFlagById,
  getFeatureFlagByKey,
  createFeatureFlag,
  updateFeatureFlag,
  deleteFeatureFlag,
  getFeatureFlagLookups,
}; 