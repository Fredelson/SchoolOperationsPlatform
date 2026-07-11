SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @ModuleId int = (SELECT TOP 1 ModuleId FROM dbo.Modules WHERE ModuleKey IN ('user_access','USER_ACCESS','Users') ORDER BY CASE WHEN ModuleKey IN ('user_access','USER_ACCESS') THEN 0 ELSE 1 END);
IF @ModuleId IS NULL SET @ModuleId = (SELECT TOP 1 ModuleId FROM dbo.Modules ORDER BY ModuleId);

DECLARE @Permissions TABLE (PermissionKey nvarchar(100), PermissionName nvarchar(150));
INSERT @Permissions VALUES
('access-levels.view','View Access Levels'),('access-levels.create','Create Access Levels'),('access-levels.update','Update Access Levels'),('access-levels.delete','Delete Access Levels'),
('assignment-types.view','View Assignment Types'),('user-assignments.view','View User Assignments'),('user-assignments.create','Create User Assignments'),('user-assignments.update','Update User Assignments'),('user-assignments.delete','Delete User Assignments'),
('user-permission-overrides.view','View User Permission Overrides'),('user-permission-overrides.create','Create User Permission Overrides'),('user-permission-overrides.update','Update User Permission Overrides'),('user-permission-overrides.delete','Delete User Permission Overrides');

INSERT dbo.Permissions (PermissionKey,PermissionName,ModuleId,PermissionGroupId,Description,IsActive,CreatedAt)
SELECT p.PermissionKey,p.PermissionName,@ModuleId,NULL,p.PermissionName,1,GETDATE()
FROM @Permissions p WHERE NOT EXISTS (SELECT 1 FROM dbo.Permissions x WHERE x.PermissionKey=p.PermissionKey);

INSERT dbo.RolePermissions (RoleId,PermissionId,IsAllowed,CreatedAt)
SELECT r.RoleId,p.PermissionId,1,GETDATE()
FROM dbo.Roles r CROSS JOIN dbo.Permissions p
WHERE r.RoleKey IN ('SuperAdmin','PlatformAdmin')
AND p.PermissionKey IN (SELECT PermissionKey FROM @Permissions)
AND NOT EXISTS (SELECT 1 FROM dbo.RolePermissions rp WHERE rp.RoleId=r.RoleId AND rp.PermissionId=p.PermissionId);

UPDATE rp SET IsAllowed=1
FROM dbo.RolePermissions rp INNER JOIN dbo.Roles r ON r.RoleId=rp.RoleId INNER JOIN dbo.Permissions p ON p.PermissionId=rp.PermissionId
WHERE r.RoleKey IN ('SuperAdmin','PlatformAdmin') AND p.PermissionKey IN (SELECT PermissionKey FROM @Permissions);

DECLARE @RootId int=(SELECT MenuId FROM dbo.Menus WHERE MenuKey='USER_ACCESS_ROOT');
DECLARE @VisibilityId int=(SELECT TOP 1 VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE LOWER(StatusKey)='enabled');
DECLARE @WorkspaceId int=(SELECT TOP 1 WorkspaceId FROM dbo.Workspaces ORDER BY WorkspaceId);

IF @RootId IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey='ACCESS_LEVELS')
    INSERT dbo.Menus(WorkspaceId,ModuleId,ParentMenuId,MenuKey,MenuName,Route,Icon,PermissionId,FeatureFlagId,BadgeQueryKey,VisibilityStatusId,IsPinned,IsCollapsible,SortOrder,CreatedAt)
    VALUES(@WorkspaceId,@ModuleId,@RootId,'ACCESS_LEVELS','Access Levels','/super-admin/access-levels','admin_panel_settings',(SELECT PermissionId FROM dbo.Permissions WHERE PermissionKey='access-levels.view'),NULL,NULL,@VisibilityId,0,0,40,GETDATE());
  IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey='USER_ASSIGNMENTS')
    INSERT dbo.Menus(WorkspaceId,ModuleId,ParentMenuId,MenuKey,MenuName,Route,Icon,PermissionId,FeatureFlagId,BadgeQueryKey,VisibilityStatusId,IsPinned,IsCollapsible,SortOrder,CreatedAt)
    VALUES(@WorkspaceId,@ModuleId,@RootId,'USER_ASSIGNMENTS','User Assignments','/super-admin/user-assignments','hub',(SELECT PermissionId FROM dbo.Permissions WHERE PermissionKey='user-assignments.view'),NULL,NULL,@VisibilityId,0,0,50,GETDATE());
  IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey='USER_PERMISSION_OVERRIDES')
    INSERT dbo.Menus(WorkspaceId,ModuleId,ParentMenuId,MenuKey,MenuName,Route,Icon,PermissionId,FeatureFlagId,BadgeQueryKey,VisibilityStatusId,IsPinned,IsCollapsible,SortOrder,CreatedAt)
    VALUES(@WorkspaceId,@ModuleId,@RootId,'USER_PERMISSION_OVERRIDES','User Permission Overrides','/super-admin/user-permission-overrides','manage_accounts',(SELECT PermissionId FROM dbo.Permissions WHERE PermissionKey='user-permission-overrides.view'),NULL,NULL,@VisibilityId,0,0,60,GETDATE());

  UPDATE m SET PermissionId=p.PermissionId,VisibilityStatusId=@VisibilityId,BadgeQueryKey=NULL
  FROM dbo.Menus m JOIN dbo.Permissions p ON p.PermissionKey=CASE m.MenuKey WHEN 'ACCESS_LEVELS' THEN 'access-levels.view' WHEN 'USER_ASSIGNMENTS' THEN 'user-assignments.view' WHEN 'USER_PERMISSION_OVERRIDES' THEN 'user-permission-overrides.view' END
  WHERE m.MenuKey IN ('ACCESS_LEVELS','USER_ASSIGNMENTS','USER_PERMISSION_OVERRIDES');
END;

COMMIT TRANSACTION;
