// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Menu Repository
// ============================================
//
// Purpose:
// Handles SQL Server data access for the
// Super Admin Menu Manager.
//
// Architecture:
// Repository -> Service -> Controller -> Routes
//
// Rules:
// - SQL only lives here.
// - No HTTP request/response logic.
// - No business rules.
// ============================================

const { sql, poolPromise } = require("../../../config/db");

// ============================================
// Base Select
// ============================================

const baseSelect = `
  SELECT
    mn.MenuId,
    mn.WorkspaceId,
    w.WorkspaceKey,
    w.WorkspaceName,

    mn.ModuleId,
    m.ModuleKey,
    m.ModuleName,

    mn.ParentMenuId,
    parent.MenuKey AS ParentMenuKey,
    parent.MenuName AS ParentMenuName,

    mn.MenuKey,
    mn.MenuName,
    mn.Route,
    mn.Icon,

    mn.PermissionId,
    p.PermissionKey,
    p.PermissionName,

    mn.FeatureFlagId,
    ff.FeatureKey AS FeatureFlagKey,
    ff.FeatureName AS FeatureFlagName,
    ff.IsEnabled AS FeatureFlagIsEnabled,

    mn.BadgeQueryKey,

    mn.VisibilityStatusId,
    vs.StatusKey AS VisibilityStatusKey,
    vs.StatusName AS VisibilityStatusName,

    mn.IsPinned,
    mn.IsCollapsible,
    mn.SortOrder,
    mn.CreatedAt,
    mn.UpdatedAt
  FROM dbo.Menus mn
  INNER JOIN dbo.Modules m
    ON m.ModuleId = mn.ModuleId
  INNER JOIN dbo.FeatureVisibilityStatuses vs
    ON vs.VisibilityStatusId = mn.VisibilityStatusId
  LEFT JOIN dbo.Workspaces w
    ON w.WorkspaceId = mn.WorkspaceId
  LEFT JOIN dbo.Menus parent
    ON parent.MenuId = mn.ParentMenuId
  LEFT JOIN dbo.Permissions p
    ON p.PermissionId = mn.PermissionId
  LEFT JOIN dbo.FeatureFlags ff
    ON ff.FeatureFlagId = mn.FeatureFlagId
`;

// ============================================
// Shared Filter Clause
// ============================================

const menuFilterWhereClause = `
  WHERE
    (
      @Search = '%%'
      OR mn.MenuKey LIKE @Search
      OR mn.MenuName LIKE @Search
      OR mn.Route LIKE @Search
      OR mn.BadgeQueryKey LIKE @Search
      OR m.ModuleKey LIKE @Search
      OR m.ModuleName LIKE @Search
      OR w.WorkspaceKey LIKE @Search
      OR w.WorkspaceName LIKE @Search
      OR p.PermissionKey LIKE @Search
      OR ff.FeatureKey LIKE @Search
    )
    AND (@ModuleId IS NULL OR mn.ModuleId = @ModuleId)
    AND (@WorkspaceId IS NULL OR mn.WorkspaceId = @WorkspaceId)
    AND (@ParentMenuId IS NULL OR mn.ParentMenuId = @ParentMenuId)
    AND (@VisibilityStatusKey IS NULL OR vs.StatusKey = @VisibilityStatusKey)
`;

// ============================================
// Shared Filter Inputs
// ============================================

function attachMenuFilterInputs(
  request,
  {
    search = "",
    moduleId = null,
    workspaceId = null,
    parentMenuId = null,
    visibilityStatusKey = "",
  } = {}
) {
  return request
    .input("Search", sql.NVarChar(150), `%${search}%`)
    .input("ModuleId", sql.Int, moduleId)
    .input("WorkspaceId", sql.Int, workspaceId)
    .input("ParentMenuId", sql.Int, parentMenuId)
    .input("VisibilityStatusKey", sql.NVarChar(50), visibilityStatusKey || null);
}

// ============================================
// Get Menus - Full List
// ============================================

const getMenus = async (filters = {}) => {
  const pool = await poolPromise;

  const request = attachMenuFilterInputs(pool.request(), filters);

  const result = await request.query(`
    ${baseSelect}
    ${menuFilterWhereClause}
    ORDER BY
      w.SortOrder ASC,
      m.SortOrder ASC,
      mn.SortOrder ASC,
      mn.MenuName ASC;
  `);

  return result.recordset;
};

// ============================================
// Get Menus - Paginated
// ============================================

const getMenusPaginated = async ({
  search = "",
  moduleId = null,
  workspaceId = null,
  parentMenuId = null,
  visibilityStatusKey = "",
  page = 1,
  pageSize = 10,
} = {}) => {
  const pool = await poolPromise;

  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.min(Math.max(Number(pageSize) || 10, 1), 100);
  const offset = (safePage - 1) * safePageSize;

  const sharedFilters = {
    search,
    moduleId,
    workspaceId,
    parentMenuId,
    visibilityStatusKey,
  };

  // Count total matching rows
  const countRequest = attachMenuFilterInputs(pool.request(), sharedFilters);

  const countResult = await countRequest.query(`
    SELECT COUNT(1) AS TotalRows
    FROM dbo.Menus mn
    INNER JOIN dbo.Modules m
      ON m.ModuleId = mn.ModuleId
    INNER JOIN dbo.FeatureVisibilityStatuses vs
      ON vs.VisibilityStatusId = mn.VisibilityStatusId
    LEFT JOIN dbo.Workspaces w
      ON w.WorkspaceId = mn.WorkspaceId
    LEFT JOIN dbo.Menus parent
      ON parent.MenuId = mn.ParentMenuId
    LEFT JOIN dbo.Permissions p
      ON p.PermissionId = mn.PermissionId
    LEFT JOIN dbo.FeatureFlags ff
      ON ff.FeatureFlagId = mn.FeatureFlagId
    ${menuFilterWhereClause};
  `);

  const totalRows = countResult.recordset[0]?.TotalRows || 0;
  const totalPages = Math.ceil(totalRows / safePageSize);

  // Fetch current page
  const pageRequest = attachMenuFilterInputs(pool.request(), sharedFilters)
    .input("Offset", sql.Int, offset)
    .input("PageSize", sql.Int, safePageSize);

  const pageResult = await pageRequest.query(`
    ${baseSelect}
    ${menuFilterWhereClause}
    ORDER BY
      w.SortOrder ASC,
      m.SortOrder ASC,
      mn.SortOrder ASC,
      mn.MenuName ASC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
  `);

  return {
    items: pageResult.recordset,
    totalRows,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
};

// ============================================
// Get Menu By ID
// ============================================

const getMenuById = async (menuId) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("MenuId", sql.Int, menuId)
    .query(`
      ${baseSelect}
      WHERE mn.MenuId = @MenuId;
    `);

  return result.recordset[0] || null;
};

// ============================================
// Get Menu By Key
// ============================================

const getMenuByKey = async (menuKey) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("MenuKey", sql.NVarChar(100), menuKey)
    .query(`
      ${baseSelect}
      WHERE mn.MenuKey = @MenuKey;
    `);

  return result.recordset[0] || null;
};

// ============================================
// Get Visibility Status ID By Key
// ============================================

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

// ============================================
// Create Menu
// ============================================

const createMenu = async (payload) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("WorkspaceId", sql.Int, payload.workspaceId || null)
    .input("ModuleId", sql.Int, payload.moduleId)
    .input("ParentMenuId", sql.Int, payload.parentMenuId || null)
    .input("MenuKey", sql.NVarChar(100), payload.menuKey)
    .input("MenuName", sql.NVarChar(150), payload.menuName)
    .input("Route", sql.NVarChar(150), payload.route || null)
    .input("Icon", sql.NVarChar(100), payload.icon || null)
    .input("PermissionId", sql.Int, payload.permissionId || null)
    .input("FeatureFlagId", sql.Int, payload.featureFlagId || null)
    .input("BadgeQueryKey", sql.NVarChar(100), payload.badgeQueryKey || null)
    .input("VisibilityStatusId", sql.Int, payload.visibilityStatusId)
    .input("IsPinned", sql.Bit, payload.isPinned ?? false)
    .input("IsCollapsible", sql.Bit, payload.isCollapsible ?? false)
    .input("SortOrder", sql.Int, payload.sortOrder ?? 0)
    .query(`
      INSERT INTO dbo.Menus
      (
        WorkspaceId,
        ModuleId,
        ParentMenuId,
        MenuKey,
        MenuName,
        Route,
        Icon,
        PermissionId,
        FeatureFlagId,
        BadgeQueryKey,
        VisibilityStatusId,
        IsPinned,
        IsCollapsible,
        SortOrder,
        CreatedAt
      )
      OUTPUT INSERTED.MenuId
      VALUES
      (
        @WorkspaceId,
        @ModuleId,
        @ParentMenuId,
        @MenuKey,
        @MenuName,
        @Route,
        @Icon,
        @PermissionId,
        @FeatureFlagId,
        @BadgeQueryKey,
        @VisibilityStatusId,
        @IsPinned,
        @IsCollapsible,
        @SortOrder,
        GETDATE()
      );
    `);

  return getMenuById(result.recordset[0].MenuId);
};

// ============================================
// Update Menu
// ============================================

const updateMenu = async (menuId, payload) => {
  const pool = await poolPromise;

  await pool.request()
    .input("MenuId", sql.Int, menuId)
    .input("WorkspaceId", sql.Int, payload.workspaceId || null)
    .input("ModuleId", sql.Int, payload.moduleId)
    .input("ParentMenuId", sql.Int, payload.parentMenuId || null)
    .input("MenuName", sql.NVarChar(150), payload.menuName)
    .input("Route", sql.NVarChar(150), payload.route || null)
    .input("Icon", sql.NVarChar(100), payload.icon || null)
    .input("PermissionId", sql.Int, payload.permissionId || null)
    .input("FeatureFlagId", sql.Int, payload.featureFlagId || null)
    .input("BadgeQueryKey", sql.NVarChar(100), payload.badgeQueryKey || null)
    .input("VisibilityStatusId", sql.Int, payload.visibilityStatusId)
    .input("IsPinned", sql.Bit, payload.isPinned)
    .input("IsCollapsible", sql.Bit, payload.isCollapsible)
    .input("SortOrder", sql.Int, payload.sortOrder ?? 0)
    .query(`
      UPDATE dbo.Menus
      SET
        WorkspaceId = @WorkspaceId,
        ModuleId = @ModuleId,
        ParentMenuId = @ParentMenuId,
        MenuName = @MenuName,
        Route = @Route,
        Icon = @Icon,
        PermissionId = @PermissionId,
        FeatureFlagId = @FeatureFlagId,
        BadgeQueryKey = @BadgeQueryKey,
        VisibilityStatusId = @VisibilityStatusId,
        IsPinned = @IsPinned,
        IsCollapsible = @IsCollapsible,
        SortOrder = @SortOrder,
        UpdatedAt = GETDATE()
      WHERE MenuId = @MenuId;
    `);

  return getMenuById(menuId);
};

// ============================================
// Set Menu Visibility Status
// ============================================

const setMenuVisibilityStatus = async (menuId, visibilityStatusId) => {
  const pool = await poolPromise;

  await pool.request()
    .input("MenuId", sql.Int, menuId)
    .input("VisibilityStatusId", sql.Int, visibilityStatusId)
    .query(`
      UPDATE dbo.Menus
      SET
        VisibilityStatusId = @VisibilityStatusId,
        UpdatedAt = GETDATE()
      WHERE MenuId = @MenuId;
    `);

  return getMenuById(menuId);
};

// ============================================
// Delete Menu
// ============================================

const deleteMenu = async (menuId) => {
  const pool = await poolPromise;

  await pool.request()
    .input("MenuId", sql.Int, menuId)
    .query(`
      DELETE FROM dbo.Menus
      WHERE MenuId = @MenuId;
    `);

  return true;
};

// ============================================
// Exports
// ============================================

module.exports = {
  getMenus,
  getMenusPaginated,
  getMenuById,
  getMenuByKey,
  getVisibilityStatusIdByKey,
  createMenu,
  updateMenu,
  setMenuVisibilityStatus,
  deleteMenu,
};