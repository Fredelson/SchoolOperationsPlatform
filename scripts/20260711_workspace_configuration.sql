SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID('dbo.WorkspaceModules','U') IS NULL
BEGIN
  CREATE TABLE dbo.WorkspaceModules (
    WorkspaceModuleId int IDENTITY(1,1) PRIMARY KEY,
    WorkspaceId int NOT NULL REFERENCES dbo.Workspaces(WorkspaceId),
    ModuleId int NOT NULL REFERENCES dbo.Modules(ModuleId),
    IsVisible bit NOT NULL CONSTRAINT DF_WorkspaceModules_Visible DEFAULT 1,
    IsEnabled bit NOT NULL CONSTRAINT DF_WorkspaceModules_Enabled DEFAULT 1,
    SortOrder int NOT NULL CONSTRAINT DF_WorkspaceModules_Sort DEFAULT 0,
    CreatedAt datetime NOT NULL CONSTRAINT DF_WorkspaceModules_Created DEFAULT GETDATE(),
    UpdatedAt datetime NULL,
    CONSTRAINT UQ_WorkspaceModules UNIQUE(WorkspaceId,ModuleId)
  );
END;

IF OBJECT_ID('dbo.WorkspaceButtons','U') IS NULL
BEGIN
  CREATE TABLE dbo.WorkspaceButtons (
    WorkspaceButtonId int IDENTITY(1,1) PRIMARY KEY,
    WorkspaceId int NOT NULL REFERENCES dbo.Workspaces(WorkspaceId),
    ButtonId int NOT NULL REFERENCES dbo.Buttons(ButtonId),
    IsVisible bit NOT NULL CONSTRAINT DF_WorkspaceButtons_Visible DEFAULT 1,
    IsEnabled bit NOT NULL CONSTRAINT DF_WorkspaceButtons_Enabled DEFAULT 1,
    SortOrder int NOT NULL CONSTRAINT DF_WorkspaceButtons_Sort DEFAULT 0,
    CONSTRAINT UQ_WorkspaceButtons UNIQUE(WorkspaceId,ButtonId)
  );
END;

IF OBJECT_ID('dbo.WorkspaceWidgets','U') IS NULL
BEGIN
  CREATE TABLE dbo.WorkspaceWidgets (
    WorkspaceWidgetId int IDENTITY(1,1) PRIMARY KEY,
    WorkspaceId int NOT NULL REFERENCES dbo.Workspaces(WorkspaceId),
    WidgetId int NOT NULL REFERENCES dbo.Widgets(WidgetId),
    IsVisible bit NOT NULL CONSTRAINT DF_WorkspaceWidgets_Visible DEFAULT 1,
    IsEnabled bit NOT NULL CONSTRAINT DF_WorkspaceWidgets_Enabled DEFAULT 1,
    SortOrder int NOT NULL CONSTRAINT DF_WorkspaceWidgets_Sort DEFAULT 0,
    CONSTRAINT UQ_WorkspaceWidgets UNIQUE(WorkspaceId,WidgetId)
  );
END;

IF OBJECT_ID('dbo.WorkspaceMenus','U') IS NULL
BEGIN
  CREATE TABLE dbo.WorkspaceMenus (
    WorkspaceMenuId int IDENTITY(1,1) PRIMARY KEY,
    WorkspaceId int NOT NULL REFERENCES dbo.Workspaces(WorkspaceId),
    MenuId int NOT NULL REFERENCES dbo.Menus(MenuId),
    GroupKey nvarchar(100) NOT NULL,
    GroupName nvarchar(150) NOT NULL,
    GroupSortOrder int NOT NULL DEFAULT 0,
    ParentMenuId int NULL REFERENCES dbo.Menus(MenuId),
    IsVisible bit NOT NULL DEFAULT 1,
    IsEnabled bit NOT NULL DEFAULT 1,
    SortOrder int NOT NULL DEFAULT 0,
    CreatedAt datetime NOT NULL DEFAULT GETDATE(),
    UpdatedAt datetime NULL,
    CONSTRAINT UQ_WorkspaceMenus UNIQUE(WorkspaceId,MenuId)
  );
END;

IF OBJECT_ID('dbo.WorkspaceLiveSessions','U') IS NULL
BEGIN
  CREATE TABLE dbo.WorkspaceLiveSessions (
    LiveSessionId uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
    ActorUserId int NOT NULL REFERENCES dbo.Users(UserId),
    TargetUserId int NOT NULL REFERENCES dbo.Users(UserId),
    Reason nvarchar(500) NOT NULL,
    StartedAt datetime NOT NULL DEFAULT GETDATE(),
    ExitedAt datetime NULL,
    LastRoute nvarchar(500) NULL,
    IsActive bit NOT NULL DEFAULT 1
  );
END;

IF COL_LENGTH('dbo.Workspaces','DefaultDashboardId') IS NULL
BEGIN
  ALTER TABLE dbo.Workspaces ADD DefaultDashboardId int NULL;
  ALTER TABLE dbo.Workspaces ADD CONSTRAINT FK_Workspaces_DefaultDashboard FOREIGN KEY(DefaultDashboardId) REFERENCES dbo.Dashboards(DashboardId);
END;

DECLARE @Enabled int=(SELECT TOP 1 VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE LOWER(StatusKey)='enabled');
DECLARE @Required TABLE (WorkspaceKey nvarchar(100),WorkspaceName nvarchar(150),DefaultRoute nvarchar(300),SortOrder int);
INSERT @Required VALUES
('super-admin','Super Admin','/super-admin/dashboard',10),
('platform-admin','Platform Admin','/printing/dashboard',20),
('printing-admin','Printing Admin','/printing/dashboard',30),
('teacher','Teacher','/teacher/dashboard',40),
('hod','HOD','/hod/dashboard',50),
('hos-secretary','HOS / Secretary','/hos/dashboard',60),
('library-admin','Librarian / Library Admin','/library/dashboard',70);
MERGE dbo.Workspaces AS t USING @Required AS s ON t.WorkspaceKey=s.WorkspaceKey
WHEN MATCHED THEN UPDATE SET WorkspaceName=s.WorkspaceName,DefaultRoute=s.DefaultRoute,SortOrder=s.SortOrder,VisibilityStatusId=@Enabled,IsActive=1,UpdatedAt=GETDATE()
WHEN NOT MATCHED THEN INSERT(WorkspaceKey,WorkspaceName,DefaultRoute,VisibilityStatusId,IsDefault,SortOrder,CreatedAt,IsActive)
VALUES(s.WorkspaceKey,s.WorkspaceName,s.DefaultRoute,@Enabled,0,s.SortOrder,GETDATE(),1);

;WITH RoleMap AS (
 SELECT r.RoleId,w.WorkspaceId FROM dbo.Roles r JOIN dbo.Workspaces w ON w.WorkspaceKey=CASE r.RoleKey
 WHEN 'SuperAdmin' THEN 'super-admin' WHEN 'PlatformAdmin' THEN 'platform-admin' WHEN 'PrintingAdmin' THEN 'printing-admin'
 WHEN 'ITAdmin' THEN 'it'
 WHEN 'Teacher' THEN 'teacher' WHEN 'HOD' THEN 'hod' WHEN 'HOS' THEN 'hos-secretary' WHEN 'Secretary' THEN 'hos-secretary'
 WHEN 'Librarian' THEN 'library-admin' WHEN 'LibraryAdmin' THEN 'library-admin' END
)
MERGE dbo.WorkspaceRoles t USING RoleMap s ON t.WorkspaceId=s.WorkspaceId AND t.RoleId=s.RoleId
WHEN NOT MATCHED THEN INSERT(WorkspaceId,RoleId,IsDefault,CreatedAt) VALUES(s.WorkspaceId,s.RoleId,1,GETDATE());

MERGE dbo.WorkspaceModules t USING (
 SELECT mg.WorkspaceId,m.ModuleId,MIN(m.SortOrder) SortOrder FROM dbo.MenuGroups mg
 JOIN dbo.MenuGroupItems mgi ON mgi.MenuGroupId=mg.MenuGroupId JOIN dbo.Menus m ON m.MenuId=mgi.MenuId
 GROUP BY mg.WorkspaceId,m.ModuleId
) s ON t.WorkspaceId=s.WorkspaceId AND t.ModuleId=s.ModuleId
WHEN NOT MATCHED THEN INSERT(WorkspaceId,ModuleId,SortOrder) VALUES(s.WorkspaceId,s.ModuleId,s.SortOrder);

;WITH RequiredModuleMap AS (
 SELECT w.WorkspaceId,m.ModuleId,m.SortOrder FROM dbo.Workspaces w CROSS JOIN dbo.Modules m WHERE
 (w.WorkspaceKey='super-admin') OR
 (w.WorkspaceKey IN ('platform-admin','printing-admin') AND m.ModuleKey IN ('printing_management','it_operations','it_service_desk','reports_analytics')) OR
 (w.WorkspaceKey='it' AND m.ModuleKey IN ('it_operations','it_service_desk')) OR
 (w.WorkspaceKey IN ('teacher','hod','hos-secretary') AND m.ModuleKey IN ('academic_operations','printing_management','communication','communication_center')) OR
 (w.WorkspaceKey='library-admin' AND m.ModuleKey IN ('communication','communication_center'))
)
MERGE dbo.WorkspaceModules t USING RequiredModuleMap s ON t.WorkspaceId=s.WorkspaceId AND t.ModuleId=s.ModuleId
WHEN NOT MATCHED THEN INSERT(WorkspaceId,ModuleId,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.ModuleId,1,1,s.SortOrder);

MERGE dbo.WorkspaceButtons t USING (SELECT wm.WorkspaceId,b.ButtonId,b.ButtonId SortOrder FROM dbo.WorkspaceModules wm JOIN dbo.Buttons b ON b.ModuleId=wm.ModuleId WHERE wm.IsVisible=1 AND wm.IsEnabled=1) s ON t.WorkspaceId=s.WorkspaceId AND t.ButtonId=s.ButtonId
WHEN NOT MATCHED THEN INSERT(WorkspaceId,ButtonId,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.ButtonId,1,1,s.SortOrder);
MERGE dbo.WorkspaceWidgets t USING (SELECT wm.WorkspaceId,w.WidgetId,w.SortOrder FROM dbo.WorkspaceModules wm JOIN dbo.Widgets w ON w.ModuleId=wm.ModuleId WHERE wm.IsVisible=1 AND wm.IsEnabled=1) s ON t.WorkspaceId=s.WorkspaceId AND t.WidgetId=s.WidgetId
WHEN NOT MATCHED THEN INSERT(WorkspaceId,WidgetId,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.WidgetId,1,1,s.SortOrder);

;WITH LegacyNavigation AS (
 SELECT mg.WorkspaceId,m.MenuId,mg.GroupKey,mg.GroupName,mg.SortOrder GroupSortOrder,m.ParentMenuId,ISNULL(mgi.SortOrder,m.SortOrder) SortOrder
 FROM dbo.MenuGroups mg JOIN dbo.MenuGroupItems mgi ON mgi.MenuGroupId=mg.MenuGroupId JOIN dbo.Menus m ON m.MenuId=mgi.MenuId
 UNION ALL
 SELECT mg.WorkspaceId,c.MenuId,mg.GroupKey,mg.GroupName,mg.SortOrder,c.ParentMenuId,c.SortOrder
 FROM dbo.MenuGroups mg JOIN dbo.MenuGroupItems mgi ON mgi.MenuGroupId=mg.MenuGroupId JOIN dbo.Menus root ON root.MenuId=mgi.MenuId JOIN dbo.Menus c ON c.ParentMenuId=root.MenuId
), SharedNavigation AS (
 SELECT wm.WorkspaceId,m.MenuId,COALESCE(src.GroupKey,'MAIN') GroupKey,COALESCE(src.GroupName,'Main') GroupName,COALESCE(src.GroupSortOrder,999) GroupSortOrder,m.ParentMenuId,m.SortOrder
 FROM dbo.WorkspaceModules wm JOIN dbo.Menus m ON m.ModuleId=wm.ModuleId OUTER APPLY(SELECT TOP 1 * FROM LegacyNavigation n WHERE n.MenuId=COALESCE(m.ParentMenuId,m.MenuId) ORDER BY n.WorkspaceId) src
 WHERE wm.IsVisible=1 AND wm.IsEnabled=1
)
MERGE dbo.WorkspaceMenus t USING SharedNavigation s ON t.WorkspaceId=s.WorkspaceId AND t.MenuId=s.MenuId
WHEN NOT MATCHED THEN INSERT(WorkspaceId,MenuId,GroupKey,GroupName,GroupSortOrder,ParentMenuId,IsVisible,IsEnabled,SortOrder)
VALUES(s.WorkspaceId,s.MenuId,s.GroupKey,s.GroupName,s.GroupSortOrder,s.ParentMenuId,1,1,s.SortOrder);

DECLARE @FoundationModuleId int=(SELECT TOP 1 ModuleId FROM dbo.Modules WHERE ModuleKey='platform_foundation');
DECLARE @PrintingModuleId int=(SELECT TOP 1 ModuleId FROM dbo.Modules WHERE ModuleKey='printing_management');
DECLARE @WorkspacePermissions TABLE(PermissionKey nvarchar(200),PermissionName nvarchar(200));
INSERT @WorkspacePermissions VALUES
('workspace.configure','Configure Workspaces'),('workspace.preview','Preview Workspaces'),
('workspace.preview_user','Preview User Workspace'),('workspace.live_mode','Use Workspace Live Mode'),
('workspace.live_as_user','Operate as User in Live Mode');
MERGE dbo.Permissions t USING @WorkspacePermissions s ON t.PermissionKey=s.PermissionKey
WHEN MATCHED THEN UPDATE SET PermissionName=s.PermissionName,IsActive=1,UpdatedAt=GETDATE()
WHEN NOT MATCHED THEN INSERT(PermissionKey,PermissionName,ModuleId,Description,IsActive,CreatedAt)
VALUES(s.PermissionKey,s.PermissionName,@FoundationModuleId,'Workspace security permission',1,GETDATE());
IF NOT EXISTS(SELECT 1 FROM dbo.Permissions WHERE PermissionKey='printing.limits.view') INSERT dbo.Permissions(PermissionKey,PermissionName,ModuleId,Description,IsActive,CreatedAt) VALUES('printing.limits.view','View Printing Limits',@PrintingModuleId,'View department print limits',1,GETDATE());
UPDATE dbo.Menus SET Route='/printing/department-limits',PermissionId=(SELECT PermissionId FROM dbo.Permissions WHERE PermissionKey='printing.limits.view'),UpdatedAt=GETDATE() WHERE MenuKey='PRINT_LIMITS' OR Route='/printing/limits';
INSERT dbo.RolePermissions(RoleId,PermissionId,IsAllowed,CreatedAt) SELECT r.RoleId,p.PermissionId,1,GETDATE() FROM dbo.Roles r CROSS JOIN dbo.Permissions p WHERE r.RoleKey IN ('SuperAdmin','PlatformAdmin','PrintingAdmin') AND p.PermissionKey='printing.limits.view' AND NOT EXISTS(SELECT 1 FROM dbo.RolePermissions rp WHERE rp.RoleId=r.RoleId AND rp.PermissionId=p.PermissionId);

INSERT dbo.RolePermissions(RoleId,PermissionId,IsAllowed,CreatedAt)
SELECT r.RoleId,p.PermissionId,1,GETDATE() FROM dbo.Roles r CROSS JOIN dbo.Permissions p
WHERE r.RoleKey='SuperAdmin' AND p.PermissionKey IN ('workspace.configure','workspace.preview','workspace.preview_user','workspace.live_mode','workspace.live_as_user')
AND NOT EXISTS(SELECT 1 FROM dbo.RolePermissions rp WHERE rp.RoleId=r.RoleId AND rp.PermissionId=p.PermissionId);
DELETE rp FROM dbo.RolePermissions rp JOIN dbo.Roles r ON r.RoleId=rp.RoleId JOIN dbo.Permissions p ON p.PermissionId=rp.PermissionId WHERE r.RoleKey<>'SuperAdmin' AND p.PermissionKey IN ('workspace.configure','workspace.live_mode','workspace.live_as_user');
DELETE upo FROM dbo.UserPermissionOverrides upo JOIN dbo.Users u ON u.UserId=upo.UserId JOIN dbo.Roles r ON r.RoleId=u.RoleId JOIN dbo.Permissions p ON p.PermissionId=upo.PermissionId WHERE r.RoleKey<>'SuperAdmin' AND p.PermissionKey IN ('workspace.configure','workspace.live_mode','workspace.live_as_user');

DECLARE @DefaultWorkspaceId int=(SELECT TOP 1 WorkspaceId FROM dbo.Workspaces WHERE IsDefault=1 ORDER BY WorkspaceId);
DECLARE @WorkspaceConfigurePermissionId int=(SELECT PermissionId FROM dbo.Permissions WHERE PermissionKey='workspace.preview');
IF NOT EXISTS(SELECT 1 FROM dbo.Menus WHERE MenuKey='workspace_manager')
  INSERT dbo.Menus(WorkspaceId,ModuleId,MenuKey,MenuName,Route,Icon,PermissionId,VisibilityStatusId,IsPinned,IsCollapsible,SortOrder,CreatedAt)
  VALUES(@DefaultWorkspaceId,@FoundationModuleId,'workspace_manager','Workspace Manager','/super-admin/workspaces','DashboardCustomize',@WorkspaceConfigurePermissionId,@Enabled,0,0,65,GETDATE());
ELSE
  UPDATE dbo.Menus SET Route='/super-admin/workspaces',PermissionId=@WorkspaceConfigurePermissionId,VisibilityStatusId=@Enabled,UpdatedAt=GETDATE() WHERE MenuKey='workspace_manager';
DECLARE @WorkspaceMenuId int=(SELECT MenuId FROM dbo.Menus WHERE MenuKey='workspace_manager');
DECLARE @FoundationGroupId int=(SELECT TOP 1 MenuGroupId FROM dbo.MenuGroups WHERE WorkspaceId=@DefaultWorkspaceId AND (GroupKey='PLATFORM_FOUNDATION' OR GroupName='Platform Foundation') ORDER BY MenuGroupId);
IF @FoundationGroupId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.MenuGroupItems WHERE MenuGroupId=@FoundationGroupId AND MenuId=@WorkspaceMenuId)
  INSERT dbo.MenuGroupItems(MenuGroupId,MenuId,SortOrder) VALUES(@FoundationGroupId,@WorkspaceMenuId,65);
DECLARE @PlatformAdminWorkspaceId int=(SELECT WorkspaceId FROM dbo.Workspaces WHERE WorkspaceKey='platform-admin');
IF @PlatformAdminWorkspaceId IS NOT NULL
MERGE dbo.WorkspaceMenus t USING (SELECT @PlatformAdminWorkspaceId WorkspaceId,@WorkspaceMenuId MenuId) s ON t.WorkspaceId=s.WorkspaceId AND t.MenuId=s.MenuId
WHEN NOT MATCHED THEN INSERT(WorkspaceId,MenuId,GroupKey,GroupName,GroupSortOrder,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.MenuId,'PLATFORM_TOOLS','Platform Tools',90,1,1,10)
WHEN MATCHED THEN UPDATE SET IsVisible=1,IsEnabled=1,UpdatedAt=GETDATE();

DECLARE @ImplementedRoutes TABLE(Route nvarchar(300) PRIMARY KEY);
INSERT @ImplementedRoutes VALUES
('/super-admin/dashboard'),('/super-admin/modules'),('/super-admin/workspaces'),('/super-admin/menus'),('/super-admin/navigation-manager'),('/super-admin/buttons'),('/super-admin/widgets'),('/super-admin/feature-flags'),('/super-admin/users'),('/super-admin/roles'),('/super-admin/access-levels'),('/super-admin/user-assignments'),('/super-admin/assignment-types'),('/super-admin/permissions'),('/super-admin/permission-groups'),('/super-admin/role-permissions'),('/super-admin/user-permission-overrides'),('/super-admin/printing'),('/super-admin/assets'),('/super-admin/audit-logs'),('/super-admin/settings'),
('/it-assets/dashboard'),('/it-assets/assets'),('/it-assets/asset-tag-printer'),('/it-assets/assignments'),('/it-assets/borrow'),('/it-assets/transfers'),('/it-assets/issues'),('/it-assets/maintenance'),('/it-assets/disposals'),('/it-assets/reports'),
('/printing/dashboard'),('/printing/paper-stock'),('/printing/inventory-transactions'),('/printing/purchases'),('/printing/distributions'),('/printing/user-management'),('/printing/access-levels'),('/printing/master-data'),('/printing/department-limits'),
('/teacher/dashboard'),('/teacher/profile'),('/teacher/my-requests'),('/teacher/create-request'),('/teacher/attachments'),('/teacher/reports'),
('/hod/dashboard'),('/hod/profile'),('/hod/pending-requests'),('/hod/approved-requests'),('/hod/rejected-requests'),('/hod/returned-requests'),('/hod/my-requests'),('/hod/create-request'),('/hod/attachments'),
('/hos/dashboard'),('/hos/profile'),('/hos/subject-allocation'),('/system/branding'),
('/library/dashboard'),('/library/books'),('/library/categories'),('/library/members'),('/library/borrowing'),('/library/returns'),('/library/reservations'),('/library/overdue'),('/library/inventory'),('/library/reports'),('/library/settings');
UPDATE wm SET IsVisible=CASE WHEN ir.Route IS NULL THEN 0 ELSE 1 END,UpdatedAt=GETDATE()
FROM dbo.WorkspaceMenus wm JOIN dbo.Menus m ON m.MenuId=wm.MenuId LEFT JOIN @ImplementedRoutes ir ON ir.Route=m.Route
WHERE m.Route IS NOT NULL;
UPDATE parent SET IsVisible=CASE WHEN EXISTS(SELECT 1 FROM dbo.WorkspaceMenus child WHERE child.WorkspaceId=parent.WorkspaceId AND child.ParentMenuId=parent.MenuId AND child.IsVisible=1) THEN 1 ELSE 0 END,UpdatedAt=GETDATE()
FROM dbo.WorkspaceMenus parent JOIN dbo.Menus m ON m.MenuId=parent.MenuId WHERE m.Route IS NULL;

DECLARE @RoleWorkspacePermissions TABLE(PermissionKey nvarchar(200),PermissionName nvarchar(200),RoleKey nvarchar(100),WorkspaceKey nvarchar(100));
UPDATE dbo.Modules SET VisibilityStatusId=@Enabled,IsActive=1,UpdatedAt=GETDATE() WHERE ModuleKey='academic_operations';
INSERT @RoleWorkspacePermissions VALUES('workspace.teacher.use','Use Teacher Workspace','Teacher','teacher'),('workspace.hod.use','Use HOD Workspace','HOD','hod'),('workspace.hos.use','Use HOS Workspace','HOS','hos-secretary'),('workspace.hos.use','Use HOS Workspace','Secretary','hos-secretary');
MERGE dbo.Permissions t USING (SELECT DISTINCT PermissionKey,PermissionName FROM @RoleWorkspacePermissions) s ON t.PermissionKey=s.PermissionKey
WHEN NOT MATCHED THEN INSERT(PermissionKey,PermissionName,ModuleId,Description,IsActive,CreatedAt) VALUES(s.PermissionKey,s.PermissionName,(SELECT ModuleId FROM dbo.Modules WHERE ModuleKey='academic_operations'),'Workspace navigation access',1,GETDATE());
INSERT dbo.RolePermissions(RoleId,PermissionId,IsAllowed,CreatedAt)
SELECT r.RoleId,p.PermissionId,1,GETDATE() FROM @RoleWorkspacePermissions x JOIN dbo.Roles r ON r.RoleKey=x.RoleKey JOIN dbo.Permissions p ON p.PermissionKey=x.PermissionKey
WHERE NOT EXISTS(SELECT 1 FROM dbo.RolePermissions rp WHERE rp.RoleId=r.RoleId AND rp.PermissionId=p.PermissionId);
DECLARE @RoleMenus TABLE(WorkspaceKey nvarchar(100),PermissionKey nvarchar(200),MenuKey nvarchar(150),MenuName nvarchar(150),Route nvarchar(300),SortOrder int);
INSERT @RoleMenus VALUES
('teacher','workspace.teacher.use','teacher_dashboard','Dashboard','/teacher/dashboard',10),('teacher','workspace.teacher.use','teacher_create_request','Create Print Request','/teacher/create-request',20),('teacher','workspace.teacher.use','teacher_my_requests','My Requests','/teacher/my-requests',30),('teacher','workspace.teacher.use','teacher_reports','Request History','/teacher/reports',40),('teacher','workspace.teacher.use','teacher_profile','Profile','/teacher/profile',50),
('hod','workspace.hod.use','hod_dashboard','HOD Dashboard','/hod/dashboard',10),('hod','workspace.hod.use','hod_pending','Pending Approvals','/hod/pending-requests',20),('hod','workspace.hod.use','hod_approved','Approval History','/hod/approved-requests',30),('hod','workspace.hod.use','hod_create','Create Request','/hod/create-request',40),('hod','workspace.hod.use','hod_profile','Profile','/hod/profile',50),
('hos-secretary','workspace.hos.use','hos_dashboard','HOS Dashboard','/hos/dashboard',10),('hos-secretary','workspace.hos.use','hos_allocations','Subject Allocations','/hos/subject-allocation',20),('hos-secretary','workspace.hos.use','hos_profile','Profile','/hos/profile',30);
MERGE dbo.Menus t USING (SELECT x.*,w.WorkspaceId,p.PermissionId FROM @RoleMenus x JOIN dbo.Workspaces w ON w.WorkspaceKey=x.WorkspaceKey JOIN dbo.Permissions p ON p.PermissionKey=x.PermissionKey) s ON t.MenuKey=s.MenuKey
WHEN NOT MATCHED THEN INSERT(WorkspaceId,ModuleId,MenuKey,MenuName,Route,Icon,PermissionId,VisibilityStatusId,IsPinned,IsCollapsible,SortOrder,CreatedAt) VALUES(s.WorkspaceId,(SELECT ModuleId FROM dbo.Modules WHERE ModuleKey='academic_operations'),s.MenuKey,s.MenuName,s.Route,'Dashboard',s.PermissionId,@Enabled,0,0,s.SortOrder,GETDATE());
MERGE dbo.WorkspaceMenus t USING (SELECT w.WorkspaceId,m.MenuId,'MAIN' GroupKey,'Main' GroupName,1 GroupSortOrder,m.SortOrder FROM @RoleMenus x JOIN dbo.Workspaces w ON w.WorkspaceKey=x.WorkspaceKey JOIN dbo.Menus m ON m.MenuKey=x.MenuKey) s ON t.WorkspaceId=s.WorkspaceId AND t.MenuId=s.MenuId
WHEN NOT MATCHED THEN INSERT(WorkspaceId,MenuId,GroupKey,GroupName,GroupSortOrder,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.MenuId,s.GroupKey,s.GroupName,s.GroupSortOrder,1,1,s.SortOrder)
WHEN MATCHED THEN UPDATE SET IsVisible=1,IsEnabled=1,SortOrder=s.SortOrder,UpdatedAt=GETDATE();

COMMIT;
