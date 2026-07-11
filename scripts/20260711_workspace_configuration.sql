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

DECLARE @FoundationModuleId int=(SELECT TOP 1 ModuleId FROM dbo.Modules WHERE ModuleKey='platform_foundation');
DECLARE @WorkspacePermissions TABLE(PermissionKey nvarchar(200),PermissionName nvarchar(200));
INSERT @WorkspacePermissions VALUES
('workspace.configure','Configure Workspaces'),('workspace.preview','Preview Workspaces'),
('workspace.preview_user','Preview User Workspace'),('workspace.live_mode','Use Workspace Live Mode'),
('workspace.live_as_user','Operate as User in Live Mode');
MERGE dbo.Permissions t USING @WorkspacePermissions s ON t.PermissionKey=s.PermissionKey
WHEN MATCHED THEN UPDATE SET PermissionName=s.PermissionName,IsActive=1,UpdatedAt=GETDATE()
WHEN NOT MATCHED THEN INSERT(PermissionKey,PermissionName,ModuleId,Description,IsActive,CreatedAt)
VALUES(s.PermissionKey,s.PermissionName,@FoundationModuleId,'Workspace security permission',1,GETDATE());

INSERT dbo.RolePermissions(RoleId,PermissionId,IsAllowed,CreatedAt)
SELECT r.RoleId,p.PermissionId,1,GETDATE() FROM dbo.Roles r CROSS JOIN dbo.Permissions p
WHERE r.RoleKey='SuperAdmin' AND p.PermissionKey IN ('workspace.configure','workspace.preview','workspace.preview_user','workspace.live_mode','workspace.live_as_user')
AND NOT EXISTS(SELECT 1 FROM dbo.RolePermissions rp WHERE rp.RoleId=r.RoleId AND rp.PermissionId=p.PermissionId);

DECLARE @DefaultWorkspaceId int=(SELECT TOP 1 WorkspaceId FROM dbo.Workspaces WHERE IsDefault=1 ORDER BY WorkspaceId);
DECLARE @WorkspaceConfigurePermissionId int=(SELECT PermissionId FROM dbo.Permissions WHERE PermissionKey='workspace.configure');
IF NOT EXISTS(SELECT 1 FROM dbo.Menus WHERE MenuKey='workspace_manager')
  INSERT dbo.Menus(WorkspaceId,ModuleId,MenuKey,MenuName,Route,Icon,PermissionId,VisibilityStatusId,IsPinned,IsCollapsible,SortOrder,CreatedAt)
  VALUES(@DefaultWorkspaceId,@FoundationModuleId,'workspace_manager','Workspace Manager','/super-admin/workspaces','DashboardCustomize',@WorkspaceConfigurePermissionId,@Enabled,0,0,65,GETDATE());
ELSE
  UPDATE dbo.Menus SET Route='/super-admin/workspaces',PermissionId=@WorkspaceConfigurePermissionId,VisibilityStatusId=@Enabled,UpdatedAt=GETDATE() WHERE MenuKey='workspace_manager';
DECLARE @WorkspaceMenuId int=(SELECT MenuId FROM dbo.Menus WHERE MenuKey='workspace_manager');
DECLARE @FoundationGroupId int=(SELECT TOP 1 MenuGroupId FROM dbo.MenuGroups WHERE WorkspaceId=@DefaultWorkspaceId AND (GroupKey='PLATFORM_FOUNDATION' OR GroupName='Platform Foundation') ORDER BY MenuGroupId);
IF @FoundationGroupId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.MenuGroupItems WHERE MenuGroupId=@FoundationGroupId AND MenuId=@WorkspaceMenuId)
  INSERT dbo.MenuGroupItems(MenuGroupId,MenuId,SortOrder) VALUES(@FoundationGroupId,@WorkspaceMenuId,65);

COMMIT;
