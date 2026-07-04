/* =========================================================
   Navigation Manager Repository
   Purpose:
   Handles all SQL Server database operations for Navigation Manager.

   Architecture:
   Repository → Service → Controller → Routes

   Rules:
   - SQL only in repository.
   - No HTTP logic.
   - No business decisions.
========================================================= */

const { poolPromise, sql } = require("../../../config/db");

/* =========================================================
   GET MENUS WITH SEARCH + FILTER + PAGINATION
========================================================= */

const getNavigationMenus = async ({
  search = "",
  moduleId = null,
  parentMenuId = null,
  permissionId = null,
  featureFlagId = null,
  visibilityStatusId = null,
  rootOnly = false,
  childrenOnly = false,
  page = 1,
  limit = 10,
}) => {
  const pool = await poolPromise;
  const offset = (page - 1) * limit;

  const request = pool.request();

  request.input("Search", sql.NVarChar, `%${search}%`);
  request.input("ModuleId", sql.Int, moduleId);
  request.input("ParentMenuId", sql.Int, parentMenuId);
  request.input("PermissionId", sql.Int, permissionId);
  request.input("FeatureFlagId", sql.Int, featureFlagId);
  request.input("VisibilityStatusId", sql.Int, visibilityStatusId);
  request.input("RootOnly", sql.Bit, rootOnly);
  request.input("ChildrenOnly", sql.Bit, childrenOnly);
  request.input("Offset", sql.Int, offset);
  request.input("Limit", sql.Int, limit);

  const result = await request.query(`
    SELECT
      m.MenuId,
      m.WorkspaceId,
      m.ModuleId,
      mod.ModuleName,
      mod.ModuleKey,

      m.ParentMenuId,
      parent.MenuName AS ParentMenuName,
      parent.MenuKey AS ParentMenuKey,

      m.MenuKey,
      m.MenuName,
      m.Route,
      m.Icon,

      m.PermissionId,
      p.PermissionKey,
      p.PermissionName,

      m.FeatureFlagId,
      ff.FeatureKey,
      ff.FeatureName,

      m.BadgeQueryKey,
      m.VisibilityStatusId,
      fvs.StatusKey AS VisibilityStatusKey,
      fvs.StatusName AS VisibilityStatusName,

      m.IsPinned,
      m.IsCollapsible,
      m.SortOrder,
      m.CreatedAt,
      m.UpdatedAt,

      mg.MenuGroupId,
      mg.GroupKey,
      mg.GroupName,
      mgi.MenuGroupItemId,
      mgi.SortOrder AS MenuGroupSortOrder

    FROM dbo.Menus m

    INNER JOIN dbo.Modules mod
      ON m.ModuleId = mod.ModuleId

    LEFT JOIN dbo.Menus parent
      ON m.ParentMenuId = parent.MenuId

    LEFT JOIN dbo.Permissions p
      ON m.PermissionId = p.PermissionId

    LEFT JOIN dbo.FeatureFlags ff
      ON m.FeatureFlagId = ff.FeatureFlagId

    INNER JOIN dbo.FeatureVisibilityStatuses fvs
      ON m.VisibilityStatusId = fvs.VisibilityStatusId

    LEFT JOIN dbo.MenuGroupItems mgi
      ON m.MenuId = mgi.MenuId

    LEFT JOIN dbo.MenuGroups mg
      ON mgi.MenuGroupId = mg.MenuGroupId

    WHERE
      (
        m.MenuKey LIKE @Search
        OR m.MenuName LIKE @Search
        OR ISNULL(m.Route, '') LIKE @Search
        OR ISNULL(m.Icon, '') LIKE @Search
        OR ISNULL(mod.ModuleName, '') LIKE @Search
        OR ISNULL(p.PermissionName, '') LIKE @Search
        OR ISNULL(ff.FeatureName, '') LIKE @Search
        OR ISNULL(fvs.StatusName, '') LIKE @Search
      )
      AND (@ModuleId IS NULL OR m.ModuleId = @ModuleId)
      AND (@ParentMenuId IS NULL OR m.ParentMenuId = @ParentMenuId)
      AND (@PermissionId IS NULL OR m.PermissionId = @PermissionId)
      AND (@FeatureFlagId IS NULL OR m.FeatureFlagId = @FeatureFlagId)
      AND (@VisibilityStatusId IS NULL OR m.VisibilityStatusId = @VisibilityStatusId)
      AND (@RootOnly = 0 OR m.ParentMenuId IS NULL)
      AND (@ChildrenOnly = 0 OR m.ParentMenuId IS NOT NULL)

    ORDER BY
      m.SortOrder ASC,
      m.MenuName ASC

    OFFSET @Offset ROWS
    FETCH NEXT @Limit ROWS ONLY;

    SELECT COUNT(*) AS Total
    FROM dbo.Menus m
    INNER JOIN dbo.Modules mod
      ON m.ModuleId = mod.ModuleId
    LEFT JOIN dbo.Menus parent
      ON m.ParentMenuId = parent.MenuId
    LEFT JOIN dbo.Permissions p
      ON m.PermissionId = p.PermissionId
    LEFT JOIN dbo.FeatureFlags ff
      ON m.FeatureFlagId = ff.FeatureFlagId
    INNER JOIN dbo.FeatureVisibilityStatuses fvs
      ON m.VisibilityStatusId = fvs.VisibilityStatusId
    WHERE
      (
        m.MenuKey LIKE @Search
        OR m.MenuName LIKE @Search
        OR ISNULL(m.Route, '') LIKE @Search
        OR ISNULL(m.Icon, '') LIKE @Search
        OR ISNULL(mod.ModuleName, '') LIKE @Search
        OR ISNULL(p.PermissionName, '') LIKE @Search
        OR ISNULL(ff.FeatureName, '') LIKE @Search
        OR ISNULL(fvs.StatusName, '') LIKE @Search
      )
      AND (@ModuleId IS NULL OR m.ModuleId = @ModuleId)
      AND (@ParentMenuId IS NULL OR m.ParentMenuId = @ParentMenuId)
      AND (@PermissionId IS NULL OR m.PermissionId = @PermissionId)
      AND (@FeatureFlagId IS NULL OR m.FeatureFlagId = @FeatureFlagId)
      AND (@VisibilityStatusId IS NULL OR m.VisibilityStatusId = @VisibilityStatusId)
      AND (@RootOnly = 0 OR m.ParentMenuId IS NULL)
      AND (@ChildrenOnly = 0 OR m.ParentMenuId IS NOT NULL);
  `);

  return {
    rows: result.recordsets[0],
    total: result.recordsets[1][0].Total,
  };
};

/* =========================================================
   GET MENU BY ID
========================================================= */

const getNavigationMenuById = async (menuId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("MenuId", sql.Int, menuId)
    .query(`
      SELECT
        m.*,
        mod.ModuleName,
        mod.ModuleKey,
        parent.MenuName AS ParentMenuName,
        parent.MenuKey AS ParentMenuKey,
        p.PermissionKey,
        p.PermissionName,
        ff.FeatureKey,
        ff.FeatureName,
        fvs.StatusKey AS VisibilityStatusKey,
        fvs.StatusName AS VisibilityStatusName,
        mg.MenuGroupId,
        mg.GroupKey,
        mg.GroupName,
        mgi.MenuGroupItemId,
        mgi.SortOrder AS MenuGroupSortOrder
      FROM dbo.Menus m
      INNER JOIN dbo.Modules mod
        ON m.ModuleId = mod.ModuleId
      LEFT JOIN dbo.Menus parent
        ON m.ParentMenuId = parent.MenuId
      LEFT JOIN dbo.Permissions p
        ON m.PermissionId = p.PermissionId
      LEFT JOIN dbo.FeatureFlags ff
        ON m.FeatureFlagId = ff.FeatureFlagId
      INNER JOIN dbo.FeatureVisibilityStatuses fvs
        ON m.VisibilityStatusId = fvs.VisibilityStatusId
      LEFT JOIN dbo.MenuGroupItems mgi
        ON m.MenuId = mgi.MenuId
      LEFT JOIN dbo.MenuGroups mg
        ON mgi.MenuGroupId = mg.MenuGroupId
      WHERE m.MenuId = @MenuId;
    `);

  return result.recordset[0];
};

/* =========================================================
   DUPLICATE CHECK
========================================================= */

const getNavigationMenuByKey = async (menuKey) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("MenuKey", sql.NVarChar, menuKey)
    .query(`
      SELECT TOP 1 *
      FROM dbo.Menus
      WHERE MenuKey = @MenuKey;
    `);

  return result.recordset[0];
};

/* =========================================================
   LOOKUP CHECKS
========================================================= */

const existsById = async (tableName, columnName, id) => {
  const allowedTables = {
    Modules: "ModuleId",
    Menus: "MenuId",
    Permissions: "PermissionId",
    FeatureFlags: "FeatureFlagId",
    FeatureVisibilityStatuses: "VisibilityStatusId",
    MenuGroups: "MenuGroupId",
  };

  if (!allowedTables[tableName] || allowedTables[tableName] !== columnName) {
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

/* =========================================================
   CREATE MENU
========================================================= */

const createNavigationMenu = async (data) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    const request = transaction.request();

    request.input("WorkspaceId", sql.Int, data.workspaceId);
    request.input("ModuleId", sql.Int, data.moduleId);
    request.input("ParentMenuId", sql.Int, data.parentMenuId);
    request.input("MenuKey", sql.NVarChar, data.menuKey);
    request.input("MenuName", sql.NVarChar, data.menuName);
    request.input("Route", sql.NVarChar, data.route);
    request.input("Icon", sql.NVarChar, data.icon);
    request.input("PermissionId", sql.Int, data.permissionId);
    request.input("FeatureFlagId", sql.Int, data.featureFlagId);
    request.input("BadgeQueryKey", sql.NVarChar, data.badgeQueryKey);
    request.input("VisibilityStatusId", sql.Int, data.visibilityStatusId);
    request.input("IsPinned", sql.Bit, data.isPinned);
    request.input("IsCollapsible", sql.Bit, data.isCollapsible);
    request.input("SortOrder", sql.Int, data.sortOrder);

    const result = await request.query(`
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
        CreatedAt,
        UpdatedAt
      )
      OUTPUT INSERTED.*
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
        GETDATE(),
        NULL
      );
    `);

    const createdMenu = result.recordset[0];

    if (!data.parentMenuId && data.menuGroupId) {
      await transaction
        .request()
        .input("MenuGroupId", sql.Int, data.menuGroupId)
        .input("MenuId", sql.Int, createdMenu.MenuId)
        .input("SortOrder", sql.Int, data.menuGroupSortOrder || data.sortOrder)
        .query(`
          INSERT INTO dbo.MenuGroupItems
          (
            MenuGroupId,
            MenuId,
            SortOrder
          )
          VALUES
          (
            @MenuGroupId,
            @MenuId,
            @SortOrder
          );
        `);
    }

    await transaction.commit();

    return createdMenu;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/* =========================================================
   UPDATE MENU
========================================================= */

const updateNavigationMenu = async (menuId, data) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    const request = transaction.request();

    request.input("MenuId", sql.Int, menuId);
    request.input("WorkspaceId", sql.Int, data.workspaceId);
    request.input("ModuleId", sql.Int, data.moduleId);
    request.input("ParentMenuId", sql.Int, data.parentMenuId);
    request.input("MenuKey", sql.NVarChar, data.menuKey);
    request.input("MenuName", sql.NVarChar, data.menuName);
    request.input("Route", sql.NVarChar, data.route);
    request.input("Icon", sql.NVarChar, data.icon);
    request.input("PermissionId", sql.Int, data.permissionId);
    request.input("FeatureFlagId", sql.Int, data.featureFlagId);
    request.input("BadgeQueryKey", sql.NVarChar, data.badgeQueryKey);
    request.input("VisibilityStatusId", sql.Int, data.visibilityStatusId);
    request.input("IsPinned", sql.Bit, data.isPinned);
    request.input("IsCollapsible", sql.Bit, data.isCollapsible);
    request.input("SortOrder", sql.Int, data.sortOrder);

    const result = await request.query(`
      UPDATE dbo.Menus
      SET
        WorkspaceId = @WorkspaceId,
        ModuleId = @ModuleId,
        ParentMenuId = @ParentMenuId,
        MenuKey = @MenuKey,
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
      OUTPUT INSERTED.*
      WHERE MenuId = @MenuId;
    `);

    const updatedMenu = result.recordset[0];

    await transaction
      .request()
      .input("MenuId", sql.Int, menuId)
      .query(`
        DELETE FROM dbo.MenuGroupItems
        WHERE MenuId = @MenuId;
      `);

    if (!data.parentMenuId && data.menuGroupId) {
      await transaction
        .request()
        .input("MenuGroupId", sql.Int, data.menuGroupId)
        .input("MenuId", sql.Int, menuId)
        .input("SortOrder", sql.Int, data.menuGroupSortOrder || data.sortOrder)
        .query(`
          INSERT INTO dbo.MenuGroupItems
          (
            MenuGroupId,
            MenuId,
            SortOrder
          )
          VALUES
          (
            @MenuGroupId,
            @MenuId,
            @SortOrder
          );
        `);
    }

    await transaction.commit();

    return updatedMenu;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/* =========================================================
   DELETE MENU
========================================================= */

const deleteNavigationMenu = async (menuId) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    await transaction
      .request()
      .input("MenuId", sql.Int, menuId)
      .query(`
        DELETE FROM dbo.MenuGroupItems
        WHERE MenuId = @MenuId;
      `);

    const result = await transaction
      .request()
      .input("MenuId", sql.Int, menuId)
      .query(`
        DELETE FROM dbo.Menus
        OUTPUT DELETED.*
        WHERE MenuId = @MenuId;
      `);

    await transaction.commit();

    return result.recordset[0];
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/* =========================================================
   CHILD COUNT
========================================================= */

const countChildMenus = async (menuId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("MenuId", sql.Int, menuId)
    .query(`
      SELECT COUNT(*) AS Total
      FROM dbo.Menus
      WHERE ParentMenuId = @MenuId;
    `);

  return result.recordset[0].Total;
};

/* =========================================================
   LOOKUPS
========================================================= */

const getNavigationLookups = async () => {
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
      MenuId,
      MenuKey,
      MenuName,
      ParentMenuId,
      ModuleId,
      SortOrder
    FROM dbo.Menus
    ORDER BY SortOrder, MenuName;

    SELECT
      PermissionId,
      PermissionKey,
      PermissionName,
      ModuleId
    FROM dbo.Permissions
    WHERE IsActive = 1
    ORDER BY PermissionName;

    SELECT
      FeatureFlagId,
      FeatureKey,
      FeatureName,
      ModuleId,
      IsEnabled
    FROM dbo.FeatureFlags
    ORDER BY FeatureName;

    SELECT
      VisibilityStatusId,
      StatusKey,
      StatusName
    FROM dbo.FeatureVisibilityStatuses
    ORDER BY SortOrder;

    SELECT
      MenuGroupId,
      GroupKey,
      GroupName,
      SortOrder
    FROM dbo.MenuGroups
    ORDER BY SortOrder, GroupName;
  `);

  return {
    modules: result.recordsets[0],
    parentMenus: result.recordsets[1],
    permissions: result.recordsets[2],
    featureFlags: result.recordsets[3],
    visibilityStatuses: result.recordsets[4],
    menuGroups: result.recordsets[5],
  };
};

/* =========================================================
   EXPORT REPOSITORY
========================================================= */

module.exports = {
  getNavigationMenus,
  getNavigationMenuById,
  getNavigationMenuByKey,
  existsById,
  createNavigationMenu,
  updateNavigationMenu,
  deleteNavigationMenu,
  countChildMenus,
  getNavigationLookups,
};