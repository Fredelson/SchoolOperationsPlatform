// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Navigation Repository
// ============================================
//
// Purpose:
// Handles SQL-only operations for backend-driven
// platform navigation, including the sidebar.
//
// Important:
// - Repository layer must only contain SQL.
// - No HTTP logic.
// - No business rules.
// - No frontend rendering logic.
//
// Source of Truth:
// OperationsPlatformDB
// ============================================

const {
  sql,
  executeQuery,
  rows,
} = require("../../../shared/database");

// ============================================
// Get Sidebar Menus For User
// ============================================
//
// Purpose:
// Returns all visible sidebar menu records for
// the authenticated user.
//
// How the query works:
// 1. Root menus are connected to sidebar sections
//    through dbo.MenuGroupItems.
// 2. Child menus are not directly assigned to
//    MenuGroups. They are connected using
//    ParentMenuId.
// 3. This prevents child menus like
//    "IT Asset Dashboard" from appearing as a
//    separate root item under Main.
// 4. UserMenuPreferences can hide or reorder
//    menus per user later.
//
// Used By:
// GET /api/navigation/sidebar
// ============================================

async function getSidebarMenusForUser(userId) {
  const result = await executeQuery(
    `
    DECLARE @WorkspaceId int = COALESCE(
      (SELECT TOP 1 atw.WorkspaceId FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypes at ON at.AssignmentTypeId=ua.AssignmentTypeId AND at.IsActive=1 JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 JOIN dbo.Workspaces aw ON aw.WorkspaceId=atw.WorkspaceId AND aw.IsActive=1 WHERE ua.UserId=@UserId AND ua.IsActive=1 AND ua.IsPrimary=1 AND (ua.StartDate IS NULL OR ua.StartDate<=CAST(GETDATE() AS date)) AND (ua.EndDate IS NULL OR ua.EndDate>=CAST(GETDATE() AS date)) ORDER BY ua.UpdatedAt DESC,ua.CreatedAt DESC,ua.UserAssignmentId DESC),
      (SELECT u.DefaultWorkspaceId FROM dbo.Users u JOIN dbo.Workspaces dw ON dw.WorkspaceId=u.DefaultWorkspaceId AND dw.IsActive=1 WHERE u.UserId=@UserId),
      (SELECT TOP 1 wr.WorkspaceId FROM dbo.Users u JOIN dbo.WorkspaceRoles wr ON wr.RoleId=u.RoleId
       JOIN dbo.Workspaces w ON w.WorkspaceId=wr.WorkspaceId AND w.IsActive=1
       WHERE u.UserId=@UserId ORDER BY wr.IsDefault DESC,w.SortOrder),
      (SELECT TOP 1 WorkspaceId FROM dbo.Workspaces WHERE IsDefault=1 AND IsActive=1)
    );
    DECLARE @IsSuperAdmin bit = CASE WHEN EXISTS(
      SELECT 1 FROM dbo.Users u INNER JOIN dbo.Roles r ON r.RoleId=u.RoleId
      WHERE u.UserId=@UserId AND r.RoleKey='SuperAdmin'
    ) THEN 1 ELSE 0 END;
    DECLARE @NavigationWorkspaceId int = CASE WHEN EXISTS(SELECT 1 FROM dbo.WorkspaceMenus WHERE WorkspaceId=@WorkspaceId)
      THEN @WorkspaceId ELSE (SELECT TOP 1 WorkspaceId FROM dbo.Workspaces WHERE IsDefault=1 AND IsActive=1) END;

    SELECT
        -- Sidebar section / group
        NULL MenuGroupId,
        CASE WHEN @IsSuperAdmin=1 THEN COALESCE(wm.GroupKey, module.ModuleKey, 'MAIN') ELSE wm.GroupKey END AS GroupKey,
        CASE WHEN @IsSuperAdmin=1 THEN COALESCE(wm.GroupName, module.ModuleName, 'Main') ELSE wm.GroupName END AS GroupName,
        CASE WHEN @IsSuperAdmin=1 THEN COALESCE(wm.GroupSortOrder, module.SortOrder, 999) ELSE wm.GroupSortOrder END AS GroupSortOrder,

        -- Menu item
        m.MenuId,
        m.ModuleId,
        CASE WHEN @IsSuperAdmin=1 THEN COALESCE(wm.ParentMenuId, m.ParentMenuId) ELSE wm.ParentMenuId END AS ParentMenuId,
        m.MenuKey,
        m.MenuName,
        m.Route,
        m.Icon,
        m.PermissionId,
        permission.PermissionKey,
        COALESCE(wm.SortOrder, m.SortOrder) AS MenuSortOrder,

        -- Visibility status
        fvs.StatusKey AS VisibilityStatusKey,
        fvs.StatusName AS VisibilityStatusName,

        -- Optional user customization
        ump.IsHidden,
        ump.SortOrder AS UserSortOrder

    FROM dbo.Menus m
    INNER JOIN dbo.Modules module
        ON module.ModuleId = m.ModuleId

    LEFT JOIN dbo.WorkspaceMenus wm ON wm.MenuId=m.MenuId AND wm.WorkspaceId=@NavigationWorkspaceId
    LEFT JOIN dbo.Permissions permission ON permission.PermissionId=m.PermissionId

    -- Root menus are assigned to sidebar groups.
    -- Child menus must not be assigned to groups directly.
    -- This keeps nested dropdowns organized correctly.
    INNER JOIN dbo.FeatureVisibilityStatuses fvs
        ON m.VisibilityStatusId = fvs.VisibilityStatusId

    LEFT JOIN dbo.UserMenuPreferences ump
        ON ump.MenuId = m.MenuId
        AND ump.UserId = @UserId

    WHERE
        ISNULL(ump.IsHidden, 0) = 0
    AND (
      (
        @IsSuperAdmin=1
        AND EXISTS (
          SELECT 1
          FROM dbo.WorkspaceModules wmodule
          WHERE wmodule.WorkspaceId=@NavigationWorkspaceId
            AND wmodule.ModuleId=m.ModuleId
        )
      )
      OR (
        wm.WorkspaceMenuId IS NOT NULL
        AND wm.IsVisible=1
        AND wm.IsEnabled=1
        AND (m.WorkspaceId IS NULL OR m.WorkspaceId IN (1, @NavigationWorkspaceId))
        AND LOWER(fvs.StatusKey) = 'enabled'
        AND module.IsActive = 1
        AND LOWER((SELECT StatusKey FROM dbo.FeatureVisibilityStatuses WHERE VisibilityStatusId = module.VisibilityStatusId)) = 'enabled'
      )
    )
    -- Include:
    -- 1. Root menus that belong to a group.
    -- 2. Child menus that belong to a parent menu.
    --
    -- Exclude:
    -- Root menus that are not assigned to any sidebar group.
    AND
    (
        @IsSuperAdmin=1
        OR wm.ParentMenuId IS NOT NULL
        OR wm.GroupKey IS NOT NULL
    )

    ORDER BY
        ISNULL(CASE WHEN @IsSuperAdmin=1 THEN COALESCE(wm.GroupSortOrder, module.SortOrder, 999) ELSE wm.GroupSortOrder END, 999),
        ISNULL(ump.SortOrder, COALESCE(wm.SortOrder, m.SortOrder)),
        CASE WHEN @IsSuperAdmin=1 THEN COALESCE(wm.ParentMenuId, m.ParentMenuId) ELSE wm.ParentMenuId END,
        COALESCE(wm.SortOrder, m.SortOrder),
        m.MenuName;
    `,
    [
      {
        name: "UserId",
        type: sql.Int,
        value: userId,
      },
    ]
  );

  return rows(result);
}

async function getRuntimeControlsForUser(userId) {
  const result=await executeQuery(`
    DECLARE @WorkspaceId int=COALESCE((SELECT TOP 1 atw.WorkspaceId FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypes at ON at.AssignmentTypeId=ua.AssignmentTypeId AND at.IsActive=1 JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 JOIN dbo.Workspaces aw ON aw.WorkspaceId=atw.WorkspaceId AND aw.IsActive=1 WHERE ua.UserId=@UserId AND ua.IsActive=1 AND ua.IsPrimary=1 AND (ua.StartDate IS NULL OR ua.StartDate<=CAST(GETDATE() AS date)) AND (ua.EndDate IS NULL OR ua.EndDate>=CAST(GETDATE() AS date)) ORDER BY ua.UpdatedAt DESC,ua.CreatedAt DESC,ua.UserAssignmentId DESC),(SELECT u.DefaultWorkspaceId FROM dbo.Users u JOIN dbo.Workspaces dw ON dw.WorkspaceId=u.DefaultWorkspaceId AND dw.IsActive=1 WHERE u.UserId=@UserId),(SELECT TOP 1 wr.WorkspaceId FROM dbo.Users u JOIN dbo.WorkspaceRoles wr ON wr.RoleId=u.RoleId JOIN dbo.Workspaces rw ON rw.WorkspaceId=wr.WorkspaceId AND rw.IsActive=1 WHERE u.UserId=@UserId ORDER BY wr.IsDefault DESC,rw.SortOrder));
    SELECT b.ButtonId,b.ButtonKey,b.ButtonName,b.ModuleId,p.PermissionKey,wb.IsEnabled,wb.SortOrder FROM dbo.WorkspaceButtons wb JOIN dbo.Buttons b ON b.ButtonId=wb.ButtonId LEFT JOIN dbo.Permissions p ON p.PermissionId=b.PermissionId
    WHERE wb.WorkspaceId=@WorkspaceId AND wb.IsVisible=1 AND wb.IsEnabled=1
    ORDER BY wb.SortOrder,b.ButtonName;
    SELECT w.WidgetId,w.WidgetKey,w.WidgetName,w.WidgetType,w.DataSourceKey,w.ModuleId,p.PermissionKey,ww.SortOrder FROM dbo.WorkspaceWidgets ww JOIN dbo.Widgets w ON w.WidgetId=ww.WidgetId LEFT JOIN dbo.Permissions p ON p.PermissionId=w.PermissionId
    WHERE ww.WorkspaceId=@WorkspaceId AND ww.IsVisible=1 AND ww.IsEnabled=1
    ORDER BY ww.SortOrder,w.WidgetName;
  `,[{name:"UserId",type:sql.Int,value:userId}]);
  return {buttons:result.recordsets?.[0]||[],widgets:result.recordsets?.[1]||[]};
}

// ============================================
// Repository Exports
// ============================================

module.exports = {
  getSidebarMenusForUser,
  getRuntimeControlsForUser,
};
