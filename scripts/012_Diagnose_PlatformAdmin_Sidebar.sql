SET NOCOUNT ON;

PRINT N'=== PlatformAdmin Workspace Resolution ===';

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

PRINT N'PlatformAdmin UserId: ' + CAST(@PlatformAdminUserId AS nvarchar(50));

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

SELECT w.WorkspaceId, w.WorkspaceKey, w.WorkspaceName, w.IsDefault
FROM dbo.Workspaces w
WHERE w.WorkspaceId = @ResolvedWorkspaceId;

PRINT N'';
PRINT N'=== Asset Tag Branding Menus ===';

SELECT m.MenuId, m.MenuKey, m.MenuName, m.Route, m.ModuleId, m.VisibilityStatusId
FROM dbo.Menus m
WHERE m.MenuKey IN (
  'SCHOOL_RECTANGULAR_ASSET_TAG_BRANDING',
  'SCHOOL_ROUNDED_ASSET_TAG_BRANDING',
  'IT_RECTANGULAR_ASSET_TAG_PRINTER',
  'IT_ROUNDED_ASSET_TAG_PRINTER'
)
ORDER BY m.MenuId;

PRINT N'';
PRINT N'=== WorkspaceMenus for Resolved Workspace ===';

SELECT wm.WorkspaceMenuId, wm.WorkspaceId, wm.MenuId, m.MenuKey, m.MenuName, wm.IsVisible, wm.IsEnabled, wm.GroupKey
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

PRINT N'';
PRINT N'=== Missing WorkspaceMenus ===';

SELECT m.MenuId, m.MenuKey, m.MenuName, m.Route
FROM dbo.Menus m
WHERE m.MenuKey IN (
  'SCHOOL_RECTANGULAR_ASSET_TAG_BRANDING',
  'SCHOOL_ROUNDED_ASSET_TAG_BRANDING',
  'IT_RECTANGULAR_ASSET_TAG_PRINTER',
  'IT_ROUNDED_ASSET_TAG_PRINTER'
)
  AND NOT EXISTS (
    SELECT 1 FROM dbo.WorkspaceMenus wm
    WHERE wm.MenuId = m.MenuId AND wm.WorkspaceId = @ResolvedWorkspaceId
  )
ORDER BY m.MenuId;
