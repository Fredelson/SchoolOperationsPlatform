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
      (SELECT TOP 1 atw.WorkspaceId FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 JOIN dbo.Workspaces aw ON aw.WorkspaceId=atw.WorkspaceId AND aw.IsActive=1 WHERE ua.UserId=@UserId AND ua.IsActive=1 AND ua.IsPrimary=1),
      (SELECT u.DefaultWorkspaceId FROM dbo.Users u JOIN dbo.Workspaces dw ON dw.WorkspaceId=u.DefaultWorkspaceId AND dw.IsActive=1 WHERE u.UserId=@UserId),
      (SELECT TOP 1 wr.WorkspaceId FROM dbo.Users u JOIN dbo.WorkspaceRoles wr ON wr.RoleId=u.RoleId
       JOIN dbo.Workspaces w ON w.WorkspaceId=wr.WorkspaceId AND w.IsActive=1
       WHERE u.UserId=@UserId ORDER BY wr.IsDefault DESC,w.SortOrder),
      (SELECT TOP 1 WorkspaceId FROM dbo.Workspaces WHERE IsDefault=1 AND IsActive=1)
    );
    DECLARE @NavigationWorkspaceId int = CASE WHEN EXISTS(SELECT 1 FROM dbo.WorkspaceMenus WHERE WorkspaceId=@WorkspaceId)
      THEN @WorkspaceId ELSE (SELECT TOP 1 WorkspaceId FROM dbo.Workspaces WHERE IsDefault=1 AND IsActive=1) END;

    SELECT
        -- Sidebar section / group
        NULL MenuGroupId,
        wm.GroupKey,
        wm.GroupName,
        wm.GroupSortOrder,

        -- Menu item
        m.MenuId,
        m.ModuleId,
        wm.ParentMenuId,
        m.MenuKey,
        m.MenuName,
        m.Route,
        m.Icon,
        wm.SortOrder AS MenuSortOrder,

        -- Visibility status
        fvs.StatusKey AS VisibilityStatusKey,
        fvs.StatusName AS VisibilityStatusName,

        -- Optional user customization
        ump.IsHidden,
        ump.SortOrder AS UserSortOrder

    FROM dbo.Menus m
    INNER JOIN dbo.Modules module
        ON module.ModuleId = m.ModuleId

    INNER JOIN dbo.WorkspaceMenus wm ON wm.MenuId=m.MenuId AND wm.WorkspaceId=@NavigationWorkspaceId

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
    AND wm.IsVisible=1 AND wm.IsEnabled=1
    AND LOWER(fvs.StatusKey) = 'enabled'
    AND module.IsActive = 1
    AND LOWER((SELECT StatusKey FROM dbo.FeatureVisibilityStatuses WHERE VisibilityStatusId = module.VisibilityStatusId)) = 'enabled'
    AND (
      EXISTS (
        SELECT 1 FROM dbo.Users u INNER JOIN dbo.Roles r ON r.RoleId=u.RoleId
        WHERE u.UserId=@UserId AND r.RoleKey IN ('SuperAdmin','PlatformAdmin')
      )
      OR (
        m.PermissionId IS NOT NULL
        AND COALESCE(
          (SELECT TOP 1 CONVERT(int,upo.IsAllowed) FROM dbo.UserPermissionOverrides upo WHERE upo.UserId=@UserId AND upo.PermissionId=m.PermissionId),
          (SELECT TOP 1 CONVERT(int,rp.IsAllowed) FROM dbo.Users u INNER JOIN dbo.RolePermissions rp ON rp.RoleId=u.RoleId WHERE u.UserId=@UserId AND rp.PermissionId=m.PermissionId),
          0
        ) = 1
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
        wm.ParentMenuId IS NOT NULL
        OR wm.GroupKey IS NOT NULL
    )

    ORDER BY
        ISNULL(wm.GroupSortOrder, 999),
        ISNULL(ump.SortOrder, wm.SortOrder),
        wm.ParentMenuId,
        wm.SortOrder,
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
    DECLARE @WorkspaceId int=COALESCE((SELECT TOP 1 atw.WorkspaceId FROM dbo.UserAssignments ua JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 JOIN dbo.Workspaces aw ON aw.WorkspaceId=atw.WorkspaceId AND aw.IsActive=1 WHERE ua.UserId=@UserId AND ua.IsActive=1 AND ua.IsPrimary=1),(SELECT u.DefaultWorkspaceId FROM dbo.Users u JOIN dbo.Workspaces dw ON dw.WorkspaceId=u.DefaultWorkspaceId AND dw.IsActive=1 WHERE u.UserId=@UserId),(SELECT TOP 1 wr.WorkspaceId FROM dbo.Users u JOIN dbo.WorkspaceRoles wr ON wr.RoleId=u.RoleId JOIN dbo.Workspaces rw ON rw.WorkspaceId=wr.WorkspaceId AND rw.IsActive=1 WHERE u.UserId=@UserId ORDER BY wr.IsDefault DESC,rw.SortOrder));
    DECLARE @IsSuper bit=CASE WHEN EXISTS(SELECT 1 FROM dbo.Users u JOIN dbo.Roles r ON r.RoleId=u.RoleId WHERE u.UserId=@UserId AND r.RoleKey='SuperAdmin') THEN 1 ELSE 0 END;
    SELECT b.ButtonId,b.ButtonKey,b.ButtonName,b.ModuleId,p.PermissionKey,wb.IsEnabled,wb.SortOrder FROM dbo.WorkspaceButtons wb JOIN dbo.Buttons b ON b.ButtonId=wb.ButtonId LEFT JOIN dbo.Permissions p ON p.PermissionId=b.PermissionId
    WHERE wb.WorkspaceId=@WorkspaceId AND wb.IsVisible=1 AND wb.IsEnabled=1 AND (@IsSuper=1 OR b.PermissionId IS NULL OR COALESCE((SELECT TOP 1 CONVERT(int,IsAllowed) FROM dbo.UserPermissionOverrides WHERE UserId=@UserId AND PermissionId=b.PermissionId),(SELECT TOP 1 CONVERT(int,rp.IsAllowed) FROM dbo.Users u JOIN dbo.RolePermissions rp ON rp.RoleId=u.RoleId WHERE u.UserId=@UserId AND rp.PermissionId=b.PermissionId),0)=1)
    ORDER BY wb.SortOrder,b.ButtonName;
    SELECT w.WidgetId,w.WidgetKey,w.WidgetName,w.WidgetType,w.DataSourceKey,w.ModuleId,p.PermissionKey,ww.SortOrder FROM dbo.WorkspaceWidgets ww JOIN dbo.Widgets w ON w.WidgetId=ww.WidgetId LEFT JOIN dbo.Permissions p ON p.PermissionId=w.PermissionId
    WHERE ww.WorkspaceId=@WorkspaceId AND ww.IsVisible=1 AND ww.IsEnabled=1 AND (@IsSuper=1 OR w.PermissionId IS NULL OR COALESCE((SELECT TOP 1 CONVERT(int,IsAllowed) FROM dbo.UserPermissionOverrides WHERE UserId=@UserId AND PermissionId=w.PermissionId),(SELECT TOP 1 CONVERT(int,rp.IsAllowed) FROM dbo.Users u JOIN dbo.RolePermissions rp ON rp.RoleId=u.RoleId WHERE u.UserId=@UserId AND rp.PermissionId=w.PermissionId),0)=1)
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
