SET XACT_ABORT ON;
BEGIN TRANSACTION;
DECLARE @WorkspaceId int=(SELECT WorkspaceId FROM dbo.Workspaces WHERE WorkspaceKey='platform-admin');
DECLARE @Enabled int=(SELECT TOP 1 VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE LOWER(StatusKey)='enabled');
IF @WorkspaceId IS NULL OR @Enabled IS NULL THROW 50001,'Platform Admin workspace or enabled visibility lookup is missing.',1;
DECLARE @ModuleId int=(SELECT ModuleId FROM dbo.Modules WHERE ModuleKey='platform_foundation');
IF NOT EXISTS(SELECT 1 FROM dbo.Permissions WHERE PermissionKey='platform_admin.dashboard.view') INSERT dbo.Permissions(PermissionKey,PermissionName,ModuleId,Description,IsActive,CreatedAt) VALUES('platform_admin.dashboard.view','View Platform Admin Dashboard',@ModuleId,'View the Platform Admin workspace landing dashboard.',1,GETDATE());
DECLARE @PermissionId int=(SELECT PermissionId FROM dbo.Permissions WHERE PermissionKey='platform_admin.dashboard.view');
IF NOT EXISTS(SELECT 1 FROM dbo.RolePermissions rp JOIN dbo.Roles r ON r.RoleId=rp.RoleId WHERE r.RoleKey='PlatformAdmin' AND rp.PermissionId=@PermissionId) INSERT dbo.RolePermissions(RoleId,PermissionId,IsAllowed,CreatedAt) SELECT RoleId,@PermissionId,1,GETDATE() FROM dbo.Roles WHERE RoleKey='PlatformAdmin';
MERGE dbo.Menus t USING(SELECT 'PLATFORM_ADMIN_DASHBOARD' MenuKey)s ON t.MenuKey=s.MenuKey WHEN MATCHED THEN UPDATE SET WorkspaceId=@WorkspaceId,ModuleId=@ModuleId,MenuName='Dashboard',Route='/platform-admin/dashboard',Icon='Dashboard',PermissionId=@PermissionId,VisibilityStatusId=@Enabled,SortOrder=10,UpdatedAt=GETDATE() WHEN NOT MATCHED THEN INSERT(WorkspaceId,ModuleId,MenuKey,MenuName,Route,Icon,PermissionId,VisibilityStatusId,IsPinned,IsCollapsible,SortOrder,CreatedAt) VALUES(@WorkspaceId,@ModuleId,s.MenuKey,'Dashboard','/platform-admin/dashboard','Dashboard',@PermissionId,@Enabled,1,0,10,GETDATE());
DECLARE @MenuId int=(SELECT MenuId FROM dbo.Menus WHERE MenuKey='PLATFORM_ADMIN_DASHBOARD');
MERGE dbo.WorkspaceMenus t USING(SELECT @WorkspaceId WorkspaceId,@MenuId MenuId)s ON t.WorkspaceId=s.WorkspaceId AND t.MenuId=s.MenuId WHEN MATCHED THEN UPDATE SET GroupKey='PLATFORM',GroupName='Platform',GroupSortOrder=1,IsVisible=1,IsEnabled=1,SortOrder=10,UpdatedAt=GETDATE() WHEN NOT MATCHED THEN INSERT(WorkspaceId,MenuId,GroupKey,GroupName,GroupSortOrder,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.MenuId,'PLATFORM','Platform',1,1,1,10);
UPDATE dbo.Workspaces SET DefaultRoute='/platform-admin/dashboard',UpdatedAt=GETDATE() WHERE WorkspaceId=@WorkspaceId;

DECLARE @MenuPermissions TABLE(MenuKey nvarchar(150),PermissionKey nvarchar(200),PermissionName nvarchar(200));
INSERT @MenuPermissions VALUES
('AUDIT_LOGS','AuditLog.View','View Audit Logs'),('BRANDING_THEME','Branding.View','View Branding'),('BUTTON_MANAGER','Button.View','View Buttons'),
('MAIN_DASHBOARD','SuperAdmin.Dashboard.View','View Super Admin Dashboard'),('FEATURE_FLAGS','FeatureFlag.View','View Feature Flags'),
('MENU_MANAGER','Menu.View','View Menus'),('MODULE_MANAGER','Module.View','View Modules'),('NAVIGATION_MANAGER','Navigation.View','View Navigation'),
('PRINTING','printing.dashboard.view','View Printing Dashboard'),('SYSTEM_SETTINGS','SystemSettings.View','View System Settings'),('WIDGET_MANAGER','Widget.View','View Widgets');
INSERT dbo.Permissions(PermissionKey,PermissionName,ModuleId,Description,IsActive,CreatedAt)
SELECT x.PermissionKey,x.PermissionName,@ModuleId,x.PermissionName,1,GETDATE() FROM @MenuPermissions x WHERE NOT EXISTS(SELECT 1 FROM dbo.Permissions p WHERE p.PermissionKey=x.PermissionKey);
UPDATE m SET PermissionId=p.PermissionId,UpdatedAt=GETDATE() FROM dbo.Menus m JOIN @MenuPermissions x ON x.MenuKey=m.MenuKey JOIN dbo.Permissions p ON p.PermissionKey=x.PermissionKey;
UPDATE dbo.Menus SET VisibilityStatusId=@Enabled,UpdatedAt=GETDATE() WHERE MenuKey IN('teacher_dashboard','teacher_my_requests','teacher_create_request','teacher_reports','teacher_profile','hod_dashboard','hod_pending','hod_approved','hod_rejected','hod_returned','hod_create','hod_profile','hos_dashboard','hos_allocations','hos_profile');
INSERT dbo.RolePermissions(RoleId,PermissionId,IsAllowed,CreatedAt)
SELECT r.RoleId,p.PermissionId,1,GETDATE() FROM dbo.Roles r CROSS JOIN @MenuPermissions x JOIN dbo.Permissions p ON p.PermissionKey=x.PermissionKey WHERE r.RoleKey='SuperAdmin' AND NOT EXISTS(SELECT 1 FROM dbo.RolePermissions rp WHERE rp.RoleId=r.RoleId AND rp.PermissionId=p.PermissionId);
COMMIT;
