SET NOCOUNT ON;

DECLARE @PlatformAdminUserId int = (
  SELECT TOP 1 u.UserId
  FROM dbo.Users u
  INNER JOIN dbo.Roles r ON r.RoleId = u.RoleId
  WHERE r.RoleKey = 'PlatformAdmin'
    AND u.IsActive = 1
    AND ISNULL(u.IsDeleted, 0) = 0
  ORDER BY u.UserId
);

IF @PlatformAdminUserId IS NULL
BEGIN
  PRINT N'No active PlatformAdmin user found.';
  RETURN;
END;

DECLARE @ResolvedWorkspaceId int = COALESCE(
  (SELECT TOP 1 atw.WorkspaceId FROM dbo.UserAssignments ua 
   JOIN dbo.AssignmentTypes at ON at.AssignmentTypeId=ua.AssignmentTypeId AND at.IsActive=1 
   JOIN dbo.AssignmentTypeWorkspaces atw ON atw.AssignmentTypeId=ua.AssignmentTypeId AND atw.IsActive=1 
   JOIN dbo.Workspaces aw ON aw.WorkspaceId=atw.WorkspaceId AND aw.IsActive=1 
   WHERE ua.UserId=@PlatformAdminUserId AND ua.IsActive=1 AND ua.IsPrimary=1 
   AND (ua.StartDate IS NULL OR ua.StartDate<=CAST(GETDATE() AS date)) 
   AND (ua.EndDate IS NULL OR ua.EndDate>=CAST(GETDATE() AS date)) 
   ORDER BY ua.UpdatedAt DESC,ua.CreatedAt DESC,ua.UserAssignmentId DESC),
  (SELECT u.DefaultWorkspaceId FROM dbo.Users u 
   JOIN dbo.Workspaces dw ON dw.WorkspaceId=u.DefaultWorkspaceId AND dw.IsActive=1 
   WHERE u.UserId=@PlatformAdminUserId),
  (SELECT TOP 1 wr.WorkspaceId FROM dbo.Users u 
   JOIN dbo.WorkspaceRoles wr ON wr.RoleId=u.RoleId
   JOIN dbo.Workspaces w ON w.WorkspaceId=wr.WorkspaceId AND w.IsActive=1
   WHERE u.UserId=@PlatformAdminUserId ORDER BY wr.IsDefault DESC,w.SortOrder),
  (SELECT TOP 1 WorkspaceId FROM dbo.Workspaces WHERE IsDefault=1 AND IsActive=1)
);

PRINT N'Resolved WorkspaceId: ' + CAST(@ResolvedWorkspaceId AS nvarchar(50));

DECLARE @MenuIds TABLE (MenuId int, MenuKey nvarchar(100), MenuName nvarchar(150), Route nvarchar(255));
INSERT INTO @MenuIds (MenuId, MenuKey, MenuName, Route)
SELECT m.MenuId, m.MenuKey, m.MenuName, m.Route
FROM dbo.Menus m
WHERE m.MenuKey IN (
  'SCHOOL_RECTANGULAR_ASSET_TAG_BRANDING',
  'SCHOOL_ROUNDED_ASSET_TAG_BRANDING',
  'IT_RECTANGULAR_ASSET_TAG_PRINTER',
  'IT_ROUNDED_ASSET_TAG_PRINTER'
);

DECLARE @ExistingCount int = (
  SELECT COUNT(*)
  FROM dbo.WorkspaceMenus wm
  INNER JOIN @MenuIds m ON m.MenuId = wm.MenuId
  WHERE wm.WorkspaceId = @ResolvedWorkspaceId
);

PRINT N'Existing asset tag menus in workspace: ' + CAST(@ExistingCount AS nvarchar(50));

IF @ExistingCount = 0
BEGIN
  INSERT INTO dbo.WorkspaceMenus (
    WorkspaceId, MenuId, GroupKey, GroupName, GroupSortOrder,
    IsVisible, IsEnabled, SortOrder, CreatedAt, UpdatedAt
  )
  SELECT 
    @ResolvedWorkspaceId,
    m.MenuId,
    'IT_Operations',
    'IT Operations',
    10,
    1,
    1,
    m.SortOrder,
    GETDATE(),
    GETDATE()
  FROM dbo.Menus m
  INNER JOIN @MenuIds t ON t.MenuId = m.MenuId
  LEFT JOIN dbo.WorkspaceMenus wm ON wm.MenuId = m.MenuId AND wm.WorkspaceId = @ResolvedWorkspaceId
  WHERE wm.WorkspaceMenuId IS NULL;

  PRINT N'Inserted ' + CAST(@@ROWCOUNT AS nvarchar(50)) + ' missing asset tag menus into WorkspaceMenus.';
END
ELSE
BEGIN
  PRINT N'Asset tag menus already exist in workspace.';
END;

SELECT 
  wm.WorkspaceMenuId,
  wm.WorkspaceId,
  m.MenuKey,
  m.MenuName,
  m.Route,
  wm.IsVisible,
  wm.IsEnabled,
  wm.GroupKey
FROM dbo.WorkspaceMenus wm
INNER JOIN dbo.Menus m ON m.MenuId = wm.MenuId
WHERE wm.WorkspaceId = @ResolvedWorkspaceId
  AND m.MenuKey IN (
    'SCHOOL_RECTANGULAR_ASSET_TAG_BRANDING',
    'SCHOOL_ROUNDED_ASSET_TAG_BRANDING',
    'IT_RECTANGULAR_ASSET_TAG_PRINTER',
    'IT_ROUNDED_ASSET_TAG_PRINTER'
  )
ORDER BY wm.WorkspaceMenuId;
