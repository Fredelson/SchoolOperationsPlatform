SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

DECLARE @PlatformModuleId INT = (SELECT TOP 1 ModuleId FROM dbo.Modules WHERE ModuleKey = N'platform_foundation');
DECLARE @UserAccessModuleId INT = (SELECT TOP 1 ModuleId FROM dbo.Modules WHERE ModuleKey = N'user_access');
DECLARE @ItModuleId INT = (SELECT TOP 1 ModuleId FROM dbo.Modules WHERE ModuleKey = N'it_operations');
DECLARE @EnabledStatusId INT = (SELECT TOP 1 VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = N'Enabled');
DECLARE @WorkspaceId INT = (SELECT TOP 1 WorkspaceId FROM dbo.Workspaces WHERE IsDefault = 1 ORDER BY WorkspaceId);

IF @PlatformModuleId IS NULL OR @UserAccessModuleId IS NULL OR @ItModuleId IS NULL OR @EnabledStatusId IS NULL
  THROW 50001, 'Required enterprise modules or Enabled visibility status are missing.', 1;

DECLARE @Permissions TABLE (PermissionKey NVARCHAR(100), PermissionName NVARCHAR(150), ModuleId INT);
INSERT INTO @Permissions VALUES
  (N'roles.view', N'View Roles', @UserAccessModuleId),
  (N'roles.create', N'Create Roles', @UserAccessModuleId),
  (N'roles.update', N'Update Roles', @UserAccessModuleId),
  (N'roles.delete', N'Delete Roles', @UserAccessModuleId),
  (N'permissions.view', N'View Permissions', @UserAccessModuleId),
  (N'permissions.create', N'Create Permissions', @UserAccessModuleId),
  (N'permissions.update', N'Update Permissions', @UserAccessModuleId),
  (N'permissions.delete', N'Delete Permissions', @UserAccessModuleId),
  (N'role-permissions.view', N'View Role Permissions', @UserAccessModuleId),
  (N'role-permissions.create', N'Create Role Permissions', @UserAccessModuleId),
  (N'role-permissions.update', N'Update Role Permissions', @UserAccessModuleId),
  (N'role-permissions.delete', N'Delete Role Permissions', @UserAccessModuleId),
  (N'user-permission-overrides.view', N'View User Permission Overrides', @UserAccessModuleId),
  (N'user-permission-overrides.create', N'Create User Permission Overrides', @UserAccessModuleId),
  (N'user-permission-overrides.update', N'Update User Permission Overrides', @UserAccessModuleId),
  (N'user-permission-overrides.delete', N'Delete User Permission Overrides', @UserAccessModuleId),
  (N'navigation.manage', N'Manage Navigation', @PlatformModuleId),
  (N'permission-groups.manage', N'Manage Permission Groups', @UserAccessModuleId),
  (N'it_assets.dashboard.view', N'View IT Asset Dashboard', @ItModuleId),
  (N'it_assets.assets.view', N'View IT Assets', @ItModuleId),
  (N'it_assets.assignment.manage', N'Manage IT Asset Assignments', @ItModuleId),
  (N'it_assets.borrow.manage', N'Manage IT Asset Borrowing and Returns', @ItModuleId),
  (N'it_assets.transfer.manage', N'Manage IT Asset Transfers', @ItModuleId),
  (N'it_assets.issues.manage', N'Manage IT Asset Issues', @ItModuleId),
  (N'it_assets.maintenance.manage', N'Manage IT Asset Maintenance', @ItModuleId),
  (N'it_assets.disposal.manage', N'Manage IT Asset Disposals', @ItModuleId),
  (N'it_assets.reports.view', N'View and Export IT Asset Reports', @ItModuleId),
  (N'it_assets.tags.print', N'Print IT Asset Tags', @ItModuleId),
  (N'it_assets.import.manage', N'Import IT Assets', @ItModuleId);

INSERT INTO dbo.Permissions (PermissionKey, PermissionName, ModuleId, Description, IsActive, CreatedAt)
SELECT source.PermissionKey, source.PermissionName, source.ModuleId, N'Enterprise administration permission.', 1, GETDATE()
FROM @Permissions source
WHERE NOT EXISTS (SELECT 1 FROM dbo.Permissions target WHERE target.PermissionKey = source.PermissionKey);

UPDATE target SET target.PermissionName = source.PermissionName, target.ModuleId = source.ModuleId,
  target.IsActive = 1, target.UpdatedAt = GETDATE()
FROM dbo.Permissions target INNER JOIN @Permissions source ON source.PermissionKey = target.PermissionKey;

INSERT INTO dbo.RolePermissions (RoleId, PermissionId, IsAllowed, CreatedAt)
SELECT role.RoleId, permission.PermissionId, 1, GETDATE()
FROM dbo.Roles role
CROSS JOIN dbo.Permissions permission
WHERE role.RoleKey = N'SuperAdmin'
  AND permission.PermissionKey IN (SELECT PermissionKey FROM @Permissions)
  AND NOT EXISTS (SELECT 1 FROM dbo.RolePermissions existing
    WHERE existing.RoleId = role.RoleId AND existing.PermissionId = permission.PermissionId);

UPDATE rp SET rp.IsAllowed = 1
FROM dbo.RolePermissions rp
INNER JOIN dbo.Roles role ON role.RoleId = rp.RoleId AND role.RoleKey = N'SuperAdmin'
INNER JOIN dbo.Permissions permission ON permission.PermissionId = rp.PermissionId
WHERE permission.PermissionKey IN (SELECT PermissionKey FROM @Permissions);

DECLARE @PlatformParentId INT = (SELECT TOP 1 MenuId FROM dbo.Menus WHERE MenuKey IN (N'PLATFORM_FOUNDATION_ROOT', N'PLATFORM_FOUNDATION') ORDER BY CASE WHEN MenuKey = N'PLATFORM_FOUNDATION_ROOT' THEN 0 ELSE 1 END);
DECLARE @UserAccessParentId INT = (SELECT TOP 1 MenuId FROM dbo.Menus WHERE MenuKey = N'USER_ACCESS_ROOT');

DECLARE @Menus TABLE
(
  ModuleId INT, ParentMenuId INT, MenuKey NVARCHAR(100), MenuName NVARCHAR(150), Route NVARCHAR(150),
  Icon NVARCHAR(100), PermissionKey NVARCHAR(100), SortOrder INT
);
INSERT INTO @Menus VALUES
  (@PlatformModuleId, @PlatformParentId, N'NAVIGATION_MANAGER', N'Navigation Manager', N'/super-admin/navigation-manager', N'account_tree', N'navigation.manage', 25),
  (@UserAccessModuleId, @UserAccessParentId, N'PERMISSION_GROUPS', N'Permission Groups', N'/super-admin/permission-groups', N'groups', N'permission-groups.manage', 35),
  (@UserAccessModuleId, @UserAccessParentId, N'ROLE_PERMISSIONS', N'Role Permissions', N'/super-admin/role-permissions', N'shield', N'role-permissions.view', 50),
  (@UserAccessModuleId, @UserAccessParentId, N'USER_PERMISSION_OVERRIDES', N'User Permission Overrides', N'/super-admin/user-permission-overrides', N'people', N'user-permission-overrides.view', 60);

INSERT INTO dbo.Menus
  (WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, PermissionId,
   FeatureFlagId, BadgeQueryKey, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt)
SELECT @WorkspaceId, source.ModuleId, source.ParentMenuId, source.MenuKey, source.MenuName, source.Route,
  source.Icon, permission.PermissionId, NULL, NULL, @EnabledStatusId, 0, 0, source.SortOrder, GETDATE()
FROM @Menus source
LEFT JOIN dbo.Permissions permission ON permission.PermissionKey = source.PermissionKey
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus target WHERE target.MenuKey = source.MenuKey);

UPDATE target SET target.ModuleId = source.ModuleId, target.ParentMenuId = source.ParentMenuId,
  target.MenuName = source.MenuName, target.Route = source.Route, target.Icon = source.Icon,
  target.PermissionId = permission.PermissionId, target.VisibilityStatusId = @EnabledStatusId,
  target.SortOrder = source.SortOrder, target.UpdatedAt = GETDATE()
FROM dbo.Menus target
INNER JOIN @Menus source ON source.MenuKey = target.MenuKey
LEFT JOIN dbo.Permissions permission ON permission.PermissionKey = source.PermissionKey;

DECLARE @ItMenuPermissions TABLE (MenuKey NVARCHAR(100), PermissionKey NVARCHAR(100), Icon NVARCHAR(100));
INSERT INTO @ItMenuPermissions VALUES
  (N'IT_DASHBOARD', N'it_assets.dashboard.view', N'dashboard'),
  (N'IT_ASSET_MANAGEMENT', N'it_assets.assets.view', N'devices'),
  (N'IT_ASSIGNMENTS', N'it_assets.assignment.manage', N'assignment'),
  (N'IT_BORROW_RETURN', N'it_assets.borrow.manage', N'history'),
  (N'IT_TRANSFERS', N'it_assets.transfer.manage', N'account_tree'),
  (N'IT_ISSUES', N'it_assets.issues.manage', N'flag'),
  (N'IT_MAINTENANCE', N'it_assets.maintenance.manage', N'build'),
  (N'IT_DISPOSALS', N'it_assets.disposal.manage', N'inventory'),
  (N'IT_REPORTS', N'it_assets.reports.view', N'apps'),
  (N'IT_ASSET_TAG_PRINTER', N'it_assets.tags.print', N'print');

UPDATE menu SET menu.PermissionId = permission.PermissionId, menu.Icon = mapping.Icon,
  menu.UpdatedAt = GETDATE()
FROM dbo.Menus menu
INNER JOIN @ItMenuPermissions mapping ON mapping.MenuKey = menu.MenuKey
INNER JOIN dbo.Permissions permission ON permission.PermissionKey = mapping.PermissionKey;

UPDATE dbo.Menus SET Route = N'/it-assets/assets', VisibilityStatusId = @EnabledStatusId,
  Icon = N'devices', UpdatedAt = GETDATE()
WHERE MenuKey = N'IT_INVENTORY';

COMMIT TRANSACTION;
