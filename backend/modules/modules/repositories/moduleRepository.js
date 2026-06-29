// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Repository
// ============================================

const { sql, poolPromise } = require("../../../config/db");

const baseSelect = `
  SELECT
    m.ModuleId,
    m.ModuleKey,
    m.ModuleName,
    m.Description,
    m.Icon,
    m.BaseRoute,
    m.VisibilityStatusId,
    vs.StatusKey AS VisibilityStatusKey,
    vs.StatusName AS VisibilityStatusName,
    m.IsActive,
    m.SortOrder,
    m.CreatedAt,
    m.UpdatedAt
  FROM dbo.Modules m
  INNER JOIN dbo.FeatureVisibilityStatuses vs
    ON vs.VisibilityStatusId = m.VisibilityStatusId
`;

const getModules = async ({ search = "", statusKey = "", isActive = null } = {}) => {
  const pool = await poolPromise;

  const request = pool.request()
    .input("Search", sql.NVarChar(150), `%${search}%`)
    .input("StatusKey", sql.NVarChar(50), statusKey || null)
    .input("IsActive", sql.Bit, isActive);

  const result = await request.query(`
    ${baseSelect}
    WHERE
      (
        @Search = '%%'
        OR m.ModuleKey LIKE @Search
        OR m.ModuleName LIKE @Search
        OR m.Description LIKE @Search
      )
      AND (@StatusKey IS NULL OR vs.StatusKey = @StatusKey)
      AND (@IsActive IS NULL OR m.IsActive = @IsActive)
    ORDER BY m.SortOrder ASC, m.ModuleName ASC;
  `);

  return result.recordset;
};

const getModuleById = async (moduleId) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("ModuleId", sql.Int, moduleId)
    .query(`
      ${baseSelect}
      WHERE m.ModuleId = @ModuleId;
    `);

  return result.recordset[0] || null;
};

const getModuleByKey = async (moduleKey) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("ModuleKey", sql.NVarChar(100), moduleKey)
    .query(`
      ${baseSelect}
      WHERE m.ModuleKey = @ModuleKey;
    `);

  return result.recordset[0] || null;
};

const getVisibilityStatusIdByKey = async (statusKey) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("StatusKey", sql.NVarChar(50), statusKey)
    .query(`
      SELECT VisibilityStatusId
      FROM dbo.FeatureVisibilityStatuses
      WHERE StatusKey = @StatusKey;
    `);

  return result.recordset[0]?.VisibilityStatusId || null;
};

const createModule = async (payload) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("ModuleKey", sql.NVarChar(100), payload.moduleKey)
    .input("ModuleName", sql.NVarChar(150), payload.moduleName)
    .input("Description", sql.NVarChar(255), payload.description || null)
    .input("Icon", sql.NVarChar(100), payload.icon || null)
    .input("BaseRoute", sql.NVarChar(150), payload.baseRoute || null)
    .input("VisibilityStatusId", sql.Int, payload.visibilityStatusId)
    .input("IsActive", sql.Bit, payload.isActive ?? true)
    .input("SortOrder", sql.Int, payload.sortOrder ?? 0)
    .query(`
      INSERT INTO dbo.Modules
      (
        ModuleKey,
        ModuleName,
        Description,
        Icon,
        BaseRoute,
        VisibilityStatusId,
        IsActive,
        SortOrder,
        CreatedAt
      )
      OUTPUT INSERTED.ModuleId
      VALUES
      (
        @ModuleKey,
        @ModuleName,
        @Description,
        @Icon,
        @BaseRoute,
        @VisibilityStatusId,
        @IsActive,
        @SortOrder,
        GETDATE()
      );
    `);

  return getModuleById(result.recordset[0].ModuleId);
};

const updateModule = async (moduleId, payload) => {
  const pool = await poolPromise;

  await pool.request()
    .input("ModuleId", sql.Int, moduleId)
    .input("ModuleName", sql.NVarChar(150), payload.moduleName)
    .input("Description", sql.NVarChar(255), payload.description || null)
    .input("Icon", sql.NVarChar(100), payload.icon || null)
    .input("BaseRoute", sql.NVarChar(150), payload.baseRoute || null)
    .input("VisibilityStatusId", sql.Int, payload.visibilityStatusId)
    .input("IsActive", sql.Bit, payload.isActive)
    .input("SortOrder", sql.Int, payload.sortOrder ?? 0)
    .query(`
      UPDATE dbo.Modules
      SET
        ModuleName = @ModuleName,
        Description = @Description,
        Icon = @Icon,
        BaseRoute = @BaseRoute,
        VisibilityStatusId = @VisibilityStatusId,
        IsActive = @IsActive,
        SortOrder = @SortOrder,
        UpdatedAt = GETDATE()
      WHERE ModuleId = @ModuleId;
    `);

  return getModuleById(moduleId);
};

const setModuleActiveState = async (moduleId, isActive) => {
  const pool = await poolPromise;

  await pool.request()
    .input("ModuleId", sql.Int, moduleId)
    .input("IsActive", sql.Bit, isActive)
    .query(`
      UPDATE dbo.Modules
      SET IsActive = @IsActive,
          UpdatedAt = GETDATE()
      WHERE ModuleId = @ModuleId;
    `);

  return getModuleById(moduleId);
};

const deleteModule = async (moduleId) => {
  const pool = await poolPromise;

  await pool.request()
    .input("ModuleId", sql.Int, moduleId)
    .query(`
      DELETE FROM dbo.Modules
      WHERE ModuleId = @ModuleId;
    `);

  return true;
};

module.exports = {
  getModules,
  getModuleById,
  getModuleByKey,
  getVisibilityStatusIdByKey,
  createModule,
  updateModule,
  setModuleActiveState,
  deleteModule,
};