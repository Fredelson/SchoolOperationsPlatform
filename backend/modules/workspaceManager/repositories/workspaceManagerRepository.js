/* =========================================================
   Workspace Manager Repository
   Purpose:
   Handles all SQL Server operations for Workspaces.

   Architecture:
   Repository → Service → Controller → Routes
========================================================= */

const { poolPromise, sql } = require("../../../config/db");

/* =========================================================
   GET WORKSPACES
========================================================= */

const getWorkspaces = async ({
  search = "",
  visibilityStatusId = null,
  isDefault = null,
  isActive = null,
  page = 1,
  limit = 10,
}) => {
  const pool = await poolPromise;
  const offset = (page - 1) * limit;

  const request = pool.request();

  request.input("Search", sql.NVarChar, `%${search}%`);
  request.input("VisibilityStatusId", sql.Int, visibilityStatusId);
  request.input("IsDefault", sql.Bit, isDefault);
  request.input("IsActive", sql.Bit, isActive);
  request.input("Offset", sql.Int, offset);
  request.input("Limit", sql.Int, limit);

  const result = await request.query(`
    SELECT
      w.WorkspaceId,
      w.WorkspaceKey,
      w.WorkspaceName,
      w.Description,
      w.Icon,
      w.DefaultRoute,
      w.VisibilityStatusId,
      fvs.StatusKey AS VisibilityStatusKey,
      fvs.StatusName AS VisibilityStatusName,
      w.IsDefault,
      w.SortOrder,
      w.CreatedAt,
      w.UpdatedAt,
      w.IsActive
    FROM dbo.Workspaces w
    INNER JOIN dbo.FeatureVisibilityStatuses fvs
      ON w.VisibilityStatusId = fvs.VisibilityStatusId
    WHERE
      (
        w.WorkspaceKey LIKE @Search
        OR w.WorkspaceName LIKE @Search
        OR ISNULL(w.Description, '') LIKE @Search
        OR ISNULL(w.Icon, '') LIKE @Search
        OR ISNULL(w.DefaultRoute, '') LIKE @Search
        OR ISNULL(fvs.StatusName, '') LIKE @Search
      )
      AND (@VisibilityStatusId IS NULL OR w.VisibilityStatusId = @VisibilityStatusId)
      AND (@IsDefault IS NULL OR w.IsDefault = @IsDefault)
      AND (@IsActive IS NULL OR w.IsActive = @IsActive)
    ORDER BY
      w.SortOrder ASC,
      w.WorkspaceName ASC
    OFFSET @Offset ROWS
    FETCH NEXT @Limit ROWS ONLY;

    SELECT COUNT(*) AS Total
    FROM dbo.Workspaces w
    INNER JOIN dbo.FeatureVisibilityStatuses fvs
      ON w.VisibilityStatusId = fvs.VisibilityStatusId
    WHERE
      (
        w.WorkspaceKey LIKE @Search
        OR w.WorkspaceName LIKE @Search
        OR ISNULL(w.Description, '') LIKE @Search
        OR ISNULL(w.Icon, '') LIKE @Search
        OR ISNULL(w.DefaultRoute, '') LIKE @Search
        OR ISNULL(fvs.StatusName, '') LIKE @Search
      )
      AND (@VisibilityStatusId IS NULL OR w.VisibilityStatusId = @VisibilityStatusId)
      AND (@IsDefault IS NULL OR w.IsDefault = @IsDefault)
      AND (@IsActive IS NULL OR w.IsActive = @IsActive);
  `);

  return {
    rows: result.recordsets[0],
    total: result.recordsets[1][0].Total,
  };
};

/* =========================================================
   GET WORKSPACE BY ID
========================================================= */

const getWorkspaceById = async (workspaceId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("WorkspaceId", sql.Int, workspaceId)
    .query(`
      SELECT
        w.WorkspaceId,
        w.WorkspaceKey,
        w.WorkspaceName,
        w.Description,
        w.Icon,
        w.DefaultRoute,
        w.VisibilityStatusId,
        fvs.StatusKey AS VisibilityStatusKey,
        fvs.StatusName AS VisibilityStatusName,
        w.IsDefault,
        w.SortOrder,
        w.CreatedAt,
        w.UpdatedAt,
        w.IsActive
      FROM dbo.Workspaces w
      INNER JOIN dbo.FeatureVisibilityStatuses fvs
        ON w.VisibilityStatusId = fvs.VisibilityStatusId
      WHERE w.WorkspaceId = @WorkspaceId;
    `);

  return result.recordset[0];
};

/* =========================================================
   CHECK DUPLICATE WORKSPACE KEY
========================================================= */

const getWorkspaceByKey = async (workspaceKey) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("WorkspaceKey", sql.NVarChar, workspaceKey)
    .query(`
      SELECT TOP 1 *
      FROM dbo.Workspaces
      WHERE WorkspaceKey = @WorkspaceKey;
    `);

  return result.recordset[0];
};

/* =========================================================
   LOOKUP VALIDATION
========================================================= */

const visibilityStatusExists = async (visibilityStatusId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("VisibilityStatusId", sql.Int, visibilityStatusId)
    .query(`
      SELECT TOP 1 VisibilityStatusId
      FROM dbo.FeatureVisibilityStatuses
      WHERE VisibilityStatusId = @VisibilityStatusId;
    `);

  return Boolean(result.recordset[0]);
};

/* =========================================================
   CREATE WORKSPACE
========================================================= */

const createWorkspace = async (data) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    if (data.isDefault) {
      await transaction.request().query(`
        UPDATE dbo.Workspaces
        SET IsDefault = 0,
            UpdatedAt = GETDATE()
        WHERE IsDefault = 1;
      `);
    }

    const result = await transaction
      .request()
      .input("WorkspaceKey", sql.NVarChar, data.workspaceKey)
      .input("WorkspaceName", sql.NVarChar, data.workspaceName)
      .input("Description", sql.NVarChar, data.description)
      .input("Icon", sql.NVarChar, data.icon)
      .input("DefaultRoute", sql.NVarChar, data.defaultRoute)
      .input("VisibilityStatusId", sql.Int, data.visibilityStatusId)
      .input("IsDefault", sql.Bit, data.isDefault)
      .input("SortOrder", sql.Int, data.sortOrder)
      .input("IsActive", sql.Bit, data.isActive)
      .query(`
        INSERT INTO dbo.Workspaces
        (
          WorkspaceKey,
          WorkspaceName,
          Description,
          Icon,
          DefaultRoute,
          VisibilityStatusId,
          IsDefault,
          SortOrder,
          CreatedAt,
          UpdatedAt,
          IsActive
        )
        OUTPUT INSERTED.*
        VALUES
        (
          @WorkspaceKey,
          @WorkspaceName,
          @Description,
          @Icon,
          @DefaultRoute,
          @VisibilityStatusId,
          @IsDefault,
          @SortOrder,
          GETDATE(),
          NULL,
          @IsActive
        );
      `);

    await transaction.commit();

    return result.recordset[0];
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/* =========================================================
   UPDATE WORKSPACE
========================================================= */

const updateWorkspace = async (workspaceId, data) => {
  const pool = await poolPromise;
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    if (data.isDefault) {
      await transaction
        .request()
        .input("WorkspaceId", sql.Int, workspaceId)
        .query(`
          UPDATE dbo.Workspaces
          SET IsDefault = 0,
              UpdatedAt = GETDATE()
          WHERE IsDefault = 1
            AND WorkspaceId <> @WorkspaceId;
        `);
    }

    const result = await transaction
      .request()
      .input("WorkspaceId", sql.Int, workspaceId)
      .input("WorkspaceKey", sql.NVarChar, data.workspaceKey)
      .input("WorkspaceName", sql.NVarChar, data.workspaceName)
      .input("Description", sql.NVarChar, data.description)
      .input("Icon", sql.NVarChar, data.icon)
      .input("DefaultRoute", sql.NVarChar, data.defaultRoute)
      .input("VisibilityStatusId", sql.Int, data.visibilityStatusId)
      .input("IsDefault", sql.Bit, data.isDefault)
      .input("SortOrder", sql.Int, data.sortOrder)
      .input("IsActive", sql.Bit, data.isActive)
      .query(`
        UPDATE dbo.Workspaces
        SET
          WorkspaceKey = @WorkspaceKey,
          WorkspaceName = @WorkspaceName,
          Description = @Description,
          Icon = @Icon,
          DefaultRoute = @DefaultRoute,
          VisibilityStatusId = @VisibilityStatusId,
          IsDefault = @IsDefault,
          SortOrder = @SortOrder,
          UpdatedAt = GETDATE(),
          IsActive = @IsActive
        OUTPUT INSERTED.*
        WHERE WorkspaceId = @WorkspaceId;
      `);

    await transaction.commit();

    return result.recordset[0];
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/* =========================================================
   DELETE WORKSPACE
========================================================= */

const deleteWorkspace = async (workspaceId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("WorkspaceId", sql.Int, workspaceId)
    .query(`
      DELETE FROM dbo.Workspaces
      OUTPUT DELETED.*
      WHERE WorkspaceId = @WorkspaceId;
    `);

  return result.recordset[0];
};

/* =========================================================
   USAGE CHECK
========================================================= */

const getWorkspaceUsageCounts = async (workspaceId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("WorkspaceId", sql.Int, workspaceId)
    .query(`
      SELECT 'Dashboards' AS TableName, COUNT(*) AS Total
      FROM dbo.Dashboards
      WHERE WorkspaceId = @WorkspaceId

      UNION ALL

      SELECT 'MenuGroups', COUNT(*)
      FROM dbo.MenuGroups
      WHERE WorkspaceId = @WorkspaceId

      UNION ALL

      SELECT 'Menus', COUNT(*)
      FROM dbo.Menus
      WHERE WorkspaceId = @WorkspaceId

      UNION ALL

      SELECT 'UserMenuPreferences', COUNT(*)
      FROM dbo.UserMenuPreferences
      WHERE WorkspaceId = @WorkspaceId

      UNION ALL

      SELECT 'Users', COUNT(*)
      FROM dbo.Users
      WHERE DefaultWorkspaceId = @WorkspaceId

      UNION ALL

      SELECT 'WorkspaceRoles', COUNT(*)
      FROM dbo.WorkspaceRoles
      WHERE WorkspaceId = @WorkspaceId;
    `);

  return result.recordset;
};

/* =========================================================
   LOOKUPS
========================================================= */

const getWorkspaceLookups = async () => {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT
      VisibilityStatusId,
      StatusKey,
      StatusName
    FROM dbo.FeatureVisibilityStatuses
    ORDER BY SortOrder;
  `);

  return {
    visibilityStatuses: result.recordsets[0],
  };
};

const getWorkspaceConfiguration = async (workspaceId) => {
  const pool = await poolPromise;
  const result = await pool.request().input("WorkspaceId", sql.Int, workspaceId).query(`
    SELECT * FROM dbo.Workspaces WHERE WorkspaceId=@WorkspaceId;
    SELECT m.ModuleId,m.ModuleKey,m.ModuleName,m.BaseRoute,m.Icon,m.IsActive,
      CONVERT(bit,CASE WHEN wm.WorkspaceModuleId IS NULL THEN 0 ELSE wm.IsVisible END) IsAssigned,
      ISNULL(wm.IsEnabled,0) IsEnabled,ISNULL(wm.SortOrder,m.SortOrder) SortOrder
    FROM dbo.Modules m LEFT JOIN dbo.WorkspaceModules wm ON wm.ModuleId=m.ModuleId AND wm.WorkspaceId=@WorkspaceId
    ORDER BY ISNULL(wm.SortOrder,m.SortOrder),m.ModuleName;
    SELECT m.MenuId,m.MenuKey,m.MenuName,m.Route,m.Icon,m.PermissionId,m.ModuleId,COALESCE(wm.ParentMenuId,m.ParentMenuId) ParentMenuId,wm.GroupKey,wm.GroupName,wm.GroupSortOrder,wm.SortOrder,wm.IsEnabled,CONVERT(bit,CASE WHEN wm.WorkspaceMenuId IS NULL THEN 0 ELSE wm.IsVisible END) IsAssigned FROM dbo.Menus m LEFT JOIN dbo.WorkspaceMenus wm ON wm.MenuId=m.MenuId AND wm.WorkspaceId=@WorkspaceId ORDER BY ISNULL(wm.GroupSortOrder,999),ISNULL(wm.SortOrder,m.SortOrder),m.MenuName;
    SELECT b.*,ISNULL(wb.IsVisible,0) IsAssigned,ISNULL(wb.IsEnabled,0) IsEnabled FROM dbo.Buttons b LEFT JOIN dbo.WorkspaceButtons wb ON wb.ButtonId=b.ButtonId AND wb.WorkspaceId=@WorkspaceId ORDER BY b.ButtonName;
    SELECT w.*,ISNULL(ww.IsVisible,0) IsAssigned,ISNULL(ww.IsEnabled,0) IsEnabled FROM dbo.Widgets w LEFT JOIN dbo.WorkspaceWidgets ww ON ww.WidgetId=w.WidgetId AND ww.WorkspaceId=@WorkspaceId ORDER BY w.SortOrder,w.WidgetName;
    SELECT * FROM dbo.Dashboards WHERE WorkspaceId=@WorkspaceId;
    SELECT r.RoleId,r.RoleKey,r.RoleName,CONVERT(bit,CASE WHEN wr.WorkspaceRoleId IS NULL THEN 0 ELSE 1 END) IsAssigned FROM dbo.Roles r LEFT JOIN dbo.WorkspaceRoles wr ON wr.RoleId=r.RoleId AND wr.WorkspaceId=@WorkspaceId ORDER BY r.RoleName;
  `);
  return { workspace:result.recordsets[0][0],modules:result.recordsets[1],navigation:result.recordsets[2],buttons:result.recordsets[3],widgets:result.recordsets[4],dashboards:result.recordsets[5],profiles:result.recordsets[6] };
};

const replaceAssignments = async (workspaceId, assignmentType, items) => {
  const definitions = {
    modules: { table:"WorkspaceModules", id:"ModuleId", extra:",IsVisible,IsEnabled,SortOrder", values:",@IsVisible,@IsEnabled,@SortOrder" },
    buttons: { table:"WorkspaceButtons", id:"ButtonId", extra:",IsVisible,IsEnabled,SortOrder", values:",@IsVisible,@IsEnabled,@SortOrder" },
    widgets: { table:"WorkspaceWidgets", id:"WidgetId", extra:",IsVisible,IsEnabled,SortOrder", values:",@IsVisible,@IsEnabled,@SortOrder" },
    profiles: { table:"WorkspaceRoles", id:"RoleId", extra:",IsDefault,CreatedAt", values:",@IsDefault,GETDATE()" },
    navigation: { table:"WorkspaceMenus", id:"MenuId", extra:",GroupKey,GroupName,GroupSortOrder,ParentMenuId,IsVisible,IsEnabled,SortOrder", values:",@GroupKey,@GroupName,@GroupSortOrder,@ParentMenuId,@IsVisible,@IsEnabled,@SortOrder" },
  };
  const definition=definitions[assignmentType];
  if (!definition) throw new Error("Unsupported workspace assignment type.");
  const pool=await poolPromise; const transaction=pool.transaction(); await transaction.begin();
  try {
    await transaction.request().input("WorkspaceId",sql.Int,workspaceId).query(`DELETE dbo.${definition.table} WHERE WorkspaceId=@WorkspaceId`);
    for (const item of items) {
      const request=transaction.request().input("WorkspaceId",sql.Int,workspaceId).input("ItemId",sql.Int,Number(item.id));
      if (assignmentType === "profiles") request.input("IsDefault",sql.Bit,item.isDefault!==false);
      else {
        request.input("IsVisible",sql.Bit,item.isVisible!==false).input("IsEnabled",sql.Bit,item.isEnabled!==false).input("SortOrder",sql.Int,Number(item.sortOrder||0));
        if(assignmentType === "navigation") request.input("GroupKey",sql.NVarChar(100),String(item.groupKey||"MAIN")).input("GroupName",sql.NVarChar(150),String(item.groupName||"Main")).input("GroupSortOrder",sql.Int,Number(item.groupSortOrder||0)).input("ParentMenuId",sql.Int,item.parentMenuId?Number(item.parentMenuId):null);
      }
      await request.query(`INSERT dbo.${definition.table}(WorkspaceId,${definition.id}${definition.extra}) VALUES(@WorkspaceId,@ItemId${definition.values})`);
    }
    await transaction.commit(); return getWorkspaceConfiguration(workspaceId);
  } catch(error) { await transaction.rollback(); throw error; }
};

const getPreviewUser = async (userId) => {
  const pool=await poolPromise;
  const result=await pool.request().input("UserId",sql.Int,userId).query(`
    SELECT u.UserId,u.FullName,u.EmployeeId,u.DefaultWorkspaceId,u.DepartmentId,u.SectionId,u.SchoolId,r.RoleId,r.RoleKey,r.RoleName,
      COALESCE((SELECT TOP 1 atw.WorkspaceId FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 WHERE ua.UserId=u.UserId AND ua.IsActive=1 AND ua.IsPrimary=1),u.DefaultWorkspaceId,(SELECT TOP 1 WorkspaceId FROM dbo.WorkspaceRoles WHERE RoleId=u.RoleId ORDER BY IsDefault DESC)) WorkspaceId
    FROM dbo.Users u JOIN dbo.Roles r ON r.RoleId=u.RoleId WHERE u.UserId=@UserId AND u.IsActive=1 AND ISNULL(u.IsDeleted,0)=0;
  `);
  return result.recordset[0];
};
const canPreviewWorkspace = async (actorUserId,targetWorkspaceId) => {
  const pool=await poolPromise;
  const result=await pool.request().input("ActorUserId",sql.Int,actorUserId).input("TargetWorkspaceId",sql.Int,targetWorkspaceId).query(`
    DECLARE @ActorWorkspaceId int=COALESCE((SELECT TOP 1 atw.WorkspaceId FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 WHERE ua.UserId=@ActorUserId AND ua.IsActive=1 AND ua.IsPrimary=1),(SELECT DefaultWorkspaceId FROM dbo.Users WHERE UserId=@ActorUserId),(SELECT TOP 1 wr.WorkspaceId FROM dbo.Users u JOIN dbo.WorkspaceRoles wr ON wr.RoleId=u.RoleId WHERE u.UserId=@ActorUserId ORDER BY wr.IsDefault DESC));
    SELECT CONVERT(bit,CASE WHEN EXISTS(SELECT 1 FROM dbo.WorkspaceModules actor JOIN dbo.WorkspaceModules target ON target.ModuleId=actor.ModuleId AND target.WorkspaceId=@TargetWorkspaceId AND target.IsVisible=1 AND target.IsEnabled=1 WHERE actor.WorkspaceId=@ActorWorkspaceId AND actor.IsVisible=1 AND actor.IsEnabled=1) THEN 1 ELSE 0 END) IsAllowed;
  `);
  return Boolean(result.recordset[0]?.IsAllowed);
};
const searchPreviewUsers = async (actorUserId,search="") => {
  const pool=await poolPromise;
  const result=await pool.request().input("ActorUserId",sql.Int,actorUserId).input("Search",sql.NVarChar(150),`%${search}%`).query(`
    DECLARE @IsSuper bit=CASE WHEN EXISTS(SELECT 1 FROM dbo.Users u JOIN dbo.Roles r ON r.RoleId=u.RoleId WHERE u.UserId=@ActorUserId AND r.RoleKey='SuperAdmin') THEN 1 ELSE 0 END;
    DECLARE @ActorWorkspaceId int=COALESCE((SELECT TOP 1 atw.WorkspaceId FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 WHERE ua.UserId=@ActorUserId AND ua.IsActive=1 AND ua.IsPrimary=1),(SELECT DefaultWorkspaceId FROM dbo.Users WHERE UserId=@ActorUserId),(SELECT TOP 1 wr.WorkspaceId FROM dbo.Users u JOIN dbo.WorkspaceRoles wr ON wr.RoleId=u.RoleId WHERE u.UserId=@ActorUserId ORDER BY wr.IsDefault DESC));
    SELECT TOP 20 u.UserId,u.EmployeeId,u.FullName,r.RoleKey,r.RoleName,COALESCE((SELECT TOP 1 atw.WorkspaceId FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 WHERE ua.UserId=u.UserId AND ua.IsActive=1 AND ua.IsPrimary=1),u.DefaultWorkspaceId,(SELECT TOP 1 WorkspaceId FROM dbo.WorkspaceRoles WHERE RoleId=u.RoleId ORDER BY IsDefault DESC)) WorkspaceId
    FROM dbo.Users u JOIN dbo.Roles r ON r.RoleId=u.RoleId
    WHERE u.IsActive=1 AND ISNULL(u.IsDeleted,0)=0 AND (u.FullName LIKE @Search OR u.EmployeeId LIKE @Search OR ISNULL(u.SchoolEmail,'') LIKE @Search)
    AND (@IsSuper=1 OR (r.RoleKey NOT IN ('SuperAdmin','PlatformAdmin') AND EXISTS(
      SELECT 1 FROM dbo.WorkspaceModules actor JOIN dbo.WorkspaceModules target ON target.ModuleId=actor.ModuleId AND target.WorkspaceId=COALESCE((SELECT TOP 1 atw.WorkspaceId FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 WHERE ua.UserId=u.UserId AND ua.IsActive=1 AND ua.IsPrimary=1),u.DefaultWorkspaceId,(SELECT TOP 1 WorkspaceId FROM dbo.WorkspaceRoles WHERE RoleId=u.RoleId ORDER BY IsDefault DESC)) AND target.IsVisible=1 AND target.IsEnabled=1
      WHERE actor.WorkspaceId=@ActorWorkspaceId AND actor.IsVisible=1 AND actor.IsEnabled=1)))
    ORDER BY u.FullName;
  `);
  return result.recordset;
};
const setWorkspaceDashboard = async (workspaceId,dashboardId,defaultRoute) => {
  const pool=await poolPromise;
  const result=await pool.request().input("WorkspaceId",sql.Int,workspaceId).input("DashboardId",sql.Int,dashboardId).input("DefaultRoute",sql.NVarChar(300),defaultRoute).query(`UPDATE dbo.Workspaces SET DefaultDashboardId=@DashboardId,DefaultRoute=@DefaultRoute,UpdatedAt=GETDATE() OUTPUT INSERTED.* WHERE WorkspaceId=@WorkspaceId`);
  return result.recordset[0];
};

const createLiveSession = async (actorUserId,targetUserId,reason) => {
  const pool=await poolPromise;
  const result=await pool.request().input("ActorUserId",sql.Int,actorUserId).input("TargetUserId",sql.Int,targetUserId).input("Reason",sql.NVarChar(500),reason).query(`INSERT dbo.WorkspaceLiveSessions(ActorUserId,TargetUserId,Reason) OUTPUT INSERTED.* VALUES(@ActorUserId,@TargetUserId,@Reason)`);
  return result.recordset[0];
};
const closeLiveSession = async (sessionId,actorUserId) => {
  const pool=await poolPromise;
  const result=await pool.request().input("SessionId",sql.UniqueIdentifier,sessionId).input("ActorUserId",sql.Int,actorUserId).query(`UPDATE dbo.WorkspaceLiveSessions SET IsActive=0,ExitedAt=GETDATE() OUTPUT INSERTED.* WHERE LiveSessionId=@SessionId AND ActorUserId=@ActorUserId AND IsActive=1`);
  return result.recordset[0];
};
const touchLiveSession = async (sessionId,route) => {
  const pool=await poolPromise;
  await pool.request().input("SessionId",sql.UniqueIdentifier,sessionId).input("Route",sql.NVarChar(500),String(route||"").slice(0,500)).query(`UPDATE dbo.WorkspaceLiveSessions SET LastRoute=@Route WHERE LiveSessionId=@SessionId AND IsActive=1`);
};
const getActiveLiveSession = async (sessionId,actorUserId,targetUserId) => {
  const pool=await poolPromise;
  const result=await pool.request().input("SessionId",sql.UniqueIdentifier,sessionId).input("ActorUserId",sql.Int,actorUserId).input("TargetUserId",sql.Int,targetUserId).query(`SELECT TOP 1 * FROM dbo.WorkspaceLiveSessions WHERE LiveSessionId=@SessionId AND ActorUserId=@ActorUserId AND TargetUserId=@TargetUserId AND IsActive=1`);
  return result.recordset[0];
};

/* =========================================================
   EXPORT REPOSITORY
========================================================= */

module.exports = {
  getWorkspaces,
  getWorkspaceById,
  getWorkspaceByKey,
  visibilityStatusExists,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceUsageCounts,
  getWorkspaceLookups,
  getWorkspaceConfiguration,
  replaceAssignments,
  getPreviewUser,
  canPreviewWorkspace,
  searchPreviewUsers,
  setWorkspaceDashboard,
  createLiveSession,
  closeLiveSession,
  touchLiveSession,
  getActiveLiveSession,
};
