SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRY
 BEGIN TRANSACTION;
 PRINT 'FINAL RELEASE MIGRATION - BEFORE STATE';
 SELECT WorkspaceCategory,IsActive,COUNT(*) WorkspaceCount FROM dbo.Workspaces GROUP BY WorkspaceCategory,IsActive;

 DECLARE @Enabled int=(SELECT TOP 1 VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE LOWER(StatusKey)='enabled');
 IF @Enabled IS NULL THROW 51000,'Enabled visibility status is missing.',1;

 IF NOT EXISTS(SELECT 1 FROM dbo.Workspaces WHERE WorkspaceKey='homeroom-teacher')
  INSERT dbo.Workspaces(WorkspaceKey,WorkspaceName,Description,Icon,DefaultRoute,WorkspaceCategory,VisibilityStatusId,IsDefault,IsActive,SortOrder,CreatedAt)
  VALUES('homeroom-teacher','Homeroom Teacher','Class-scoped homeroom experience.','School','/homeroom/dashboard','ASSIGNMENT',@Enabled,0,1,130,GETDATE());
 ELSE UPDATE dbo.Workspaces SET WorkspaceName='Homeroom Teacher',DefaultRoute='/homeroom/dashboard',WorkspaceCategory='ASSIGNMENT',IsActive=1,IsDefault=0,SortOrder=130,UpdatedAt=GETDATE() WHERE WorkspaceKey='homeroom-teacher';

 UPDATE dbo.Workspaces SET WorkspaceCategory='CORE',IsActive=1,SortOrder=CASE WorkspaceKey WHEN 'super-admin' THEN 10 WHEN 'platform-admin' THEN 20 WHEN 'printing-admin' THEN 30 WHEN 'admin' THEN 40 ELSE 50 END,UpdatedAt=GETDATE() WHERE WorkspaceKey IN('super-admin','platform-admin','printing-admin','admin','teacher');
 UPDATE dbo.Workspaces SET WorkspaceCategory='LEGACY',IsActive=0,IsDefault=0,UpdatedAt=GETDATE() WHERE WorkspaceKey IN('default','it','printing','academic');
 UPDATE dbo.Workspaces SET WorkspaceCategory='ASSIGNMENT',IsActive=1,SortOrder=CASE WorkspaceKey WHEN 'hod' THEN 100 WHEN 'hos-secretary' THEN 110 WHEN 'year-leader' THEN 120 WHEN 'homeroom-teacher' THEN 130 WHEN 'library-admin' THEN 140 WHEN 'deputy-head' THEN 150 WHEN 'head-of-operations' THEN 160 ELSE 170 END,UpdatedAt=GETDATE() WHERE WorkspaceKey IN('hod','hos-secretary','year-leader','homeroom-teacher','library-admin','deputy-head','head-of-operations','nurse-clinic');

 DECLARE @PlatformModuleId int=(SELECT ModuleId FROM dbo.Modules WHERE ModuleKey='platform_foundation');
 IF @PlatformModuleId IS NULL THROW 51002,'Platform foundation module is missing.',1;
 DECLARE @DashboardResources TABLE(WorkspaceKey nvarchar(100),MenuKey nvarchar(100),MenuName nvarchar(150),Route nvarchar(150),PermissionKey nvarchar(100),PermissionName nvarchar(150));
 INSERT @DashboardResources VALUES
 ('admin','admin_dashboard','Administration Dashboard','/admin/dashboard','workspace.admin.use','Use Administration Workspace'),('year-leader','year_leader_dashboard','Year Leader Dashboard','/year-leader/dashboard','workspace.year_leader.use','Use Year Leader Workspace'),('homeroom-teacher','homeroom_dashboard','Homeroom Dashboard','/homeroom/dashboard','workspace.homeroom.use','Use Homeroom Workspace'),('deputy-head','deputy_head_dashboard','Deputy Head Dashboard','/deputy-head/dashboard','workspace.deputy_head.use','Use Deputy Head Workspace'),('head-of-operations','operations_dashboard','Operations Dashboard','/head-of-operations/dashboard','workspace.operations.use','Use Operations Workspace'),('nurse-clinic','clinic_dashboard','Clinic Dashboard','/clinic/dashboard','workspace.clinic.use','Use Clinic Workspace');
 MERGE dbo.Permissions t USING(SELECT DISTINCT PermissionKey,PermissionName FROM @DashboardResources)s ON s.PermissionKey=t.PermissionKey WHEN MATCHED THEN UPDATE SET PermissionName=s.PermissionName,ModuleId=@PlatformModuleId,IsActive=1,UpdatedAt=GETDATE() WHEN NOT MATCHED THEN INSERT(PermissionKey,PermissionName,ModuleId,Description,IsActive,CreatedAt) VALUES(s.PermissionKey,s.PermissionName,@PlatformModuleId,'Dedicated workspace access.',1,GETDATE());
 MERGE dbo.Menus t USING(SELECT d.*,w.WorkspaceId,p.PermissionId FROM @DashboardResources d JOIN dbo.Workspaces w ON w.WorkspaceKey=d.WorkspaceKey JOIN dbo.Permissions p ON p.PermissionKey=d.PermissionKey)s ON t.MenuKey=s.MenuKey WHEN MATCHED THEN UPDATE SET WorkspaceId=s.WorkspaceId,ModuleId=@PlatformModuleId,MenuName=s.MenuName,Route=s.Route,Icon='Dashboard',PermissionId=s.PermissionId,VisibilityStatusId=@Enabled,SortOrder=10,UpdatedAt=GETDATE() WHEN NOT MATCHED THEN INSERT(WorkspaceId,ModuleId,MenuKey,MenuName,Route,Icon,PermissionId,VisibilityStatusId,IsPinned,IsCollapsible,SortOrder,CreatedAt) VALUES(s.WorkspaceId,@PlatformModuleId,s.MenuKey,s.MenuName,s.Route,'Dashboard',s.PermissionId,@Enabled,0,0,10,GETDATE());
 MERGE dbo.WorkspaceModules t USING(SELECT DISTINCT w.WorkspaceId,@PlatformModuleId ModuleId FROM @DashboardResources d JOIN dbo.Workspaces w ON w.WorkspaceKey=d.WorkspaceKey)s ON s.WorkspaceId=t.WorkspaceId AND s.ModuleId=t.ModuleId WHEN MATCHED THEN UPDATE SET IsVisible=1,IsEnabled=1,SortOrder=10,UpdatedAt=GETDATE() WHEN NOT MATCHED THEN INSERT(WorkspaceId,ModuleId,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.ModuleId,1,1,10);
 MERGE dbo.WorkspaceMenus t USING(SELECT w.WorkspaceId,m.MenuId FROM @DashboardResources d JOIN dbo.Workspaces w ON w.WorkspaceKey=d.WorkspaceKey JOIN dbo.Menus m ON m.MenuKey=d.MenuKey)s ON s.WorkspaceId=t.WorkspaceId AND s.MenuId=t.MenuId WHEN MATCHED THEN UPDATE SET GroupKey='MAIN',GroupName='Main',GroupSortOrder=10,IsVisible=1,IsEnabled=1,SortOrder=10,UpdatedAt=GETDATE() WHEN NOT MATCHED THEN INSERT(WorkspaceId,MenuId,GroupKey,GroupName,GroupSortOrder,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.MenuId,'MAIN','Main',10,1,1,10);
 INSERT dbo.RolePermissions(RoleId,PermissionId,IsAllowed,CreatedAt) SELECT r.RoleId,p.PermissionId,1,GETDATE() FROM dbo.Roles r JOIN dbo.Permissions p ON p.PermissionKey IN('workspace.admin.use','workspace.year_leader.use','workspace.homeroom.use','workspace.deputy_head.use','workspace.operations.use','workspace.clinic.use') WHERE (r.RoleKey='Admin' OR (r.RoleKey='Teacher' AND p.PermissionKey IN('workspace.year_leader.use','workspace.homeroom.use'))) AND NOT EXISTS(SELECT 1 FROM dbo.RolePermissions x WHERE x.RoleId=r.RoleId AND x.PermissionId=p.PermissionId);

 MERGE dbo.WorkspaceModules t USING(
   SELECT w.WorkspaceId,m.ModuleId,CASE m.ModuleKey WHEN 'printing_management' THEN 10 ELSE 20 END SortOrder
   FROM dbo.Workspaces w CROSS JOIN dbo.Modules m
   WHERE w.WorkspaceKey IN('super-admin','platform-admin','printing-admin') AND m.ModuleKey IN('printing_management','it_operations') AND m.IsActive=1
 )s ON s.WorkspaceId=t.WorkspaceId AND s.ModuleId=t.ModuleId
 WHEN MATCHED THEN UPDATE SET IsVisible=1,IsEnabled=1,SortOrder=s.SortOrder,UpdatedAt=GETDATE()
 WHEN NOT MATCHED THEN INSERT(WorkspaceId,ModuleId,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.ModuleId,1,1,s.SortOrder);

 UPDATE wm SET IsVisible=0,IsEnabled=0,UpdatedAt=GETDATE()
 FROM dbo.WorkspaceMenus wm JOIN dbo.Menus m ON m.MenuId=wm.MenuId
 WHERE wm.IsVisible=1 AND wm.IsEnabled=1 AND m.Route IS NOT NULL AND m.PermissionId IS NULL;

 DECLARE @NewTypes TABLE(AssignmentKey nvarchar(100),AssignmentName nvarchar(150),SortOrder int);
 INSERT @NewTypes VALUES('SECRETARY','Secretary',115),('LIBRARIAN','Librarian',140),('LIBRARY_ADMIN','Library Administrator',141);
 INSERT dbo.AssignmentTypes(AssignmentKey,AssignmentName,Description,IsSystemAssignment,IsActive,SortOrder,CreatedAt)
 SELECT n.AssignmentKey,n.AssignmentName,'Specialized responsibility migrated from compatibility role.',1,1,n.SortOrder,GETDATE() FROM @NewTypes n WHERE NOT EXISTS(SELECT 1 FROM dbo.AssignmentTypes a WHERE a.AssignmentKey=n.AssignmentKey);

 DECLARE @Mappings TABLE(AssignmentKey nvarchar(100),WorkspaceKey nvarchar(100));
 INSERT @Mappings VALUES('HOD','hod'),('HOS','hos-secretary'),('YEAR_LEADER','year-leader'),('HOMEROOM_TEACHER','homeroom-teacher'),('DEPUTY_HEAD','deputy-head'),('HEAD_OF_OPERATIONS','head-of-operations'),('NURSE','nurse-clinic'),('TEACHING_ASSISTANT','teacher'),('IT_COORDINATOR','platform-admin'),('PRINTING_COORDINATOR','printing-admin'),('SECRETARY','hos-secretary'),('LIBRARIAN','library-admin'),('LIBRARY_ADMIN','library-admin');
 UPDATE atw SET IsActive=0,UpdatedAt=GETDATE() FROM dbo.AssignmentTypeWorkspaces atw JOIN dbo.AssignmentTypes a ON a.AssignmentTypeId=atw.AssignmentTypeId JOIN @Mappings m ON m.AssignmentKey=a.AssignmentKey JOIN dbo.Workspaces w ON w.WorkspaceId=atw.WorkspaceId WHERE w.WorkspaceKey<>m.WorkspaceKey AND atw.IsActive=1;
 INSERT dbo.AssignmentTypeWorkspaces(AssignmentTypeId,WorkspaceId,IsActive,CreatedAt)
 SELECT a.AssignmentTypeId,w.WorkspaceId,1,GETDATE() FROM @Mappings m JOIN dbo.AssignmentTypes a ON a.AssignmentKey=m.AssignmentKey JOIN dbo.Workspaces w ON w.WorkspaceKey=m.WorkspaceKey WHERE NOT EXISTS(SELECT 1 FROM dbo.AssignmentTypeWorkspaces x WHERE x.AssignmentTypeId=a.AssignmentTypeId AND x.WorkspaceId=w.WorkspaceId AND x.IsActive=1);

 DECLARE @RoleMigration TABLE(RoleKey nvarchar(100),MainRoleKey nvarchar(100),AssignmentKey nvarchar(100));
 INSERT @RoleMigration VALUES('HOD','Admin','HOD'),('HOS','Admin','HOS'),('Secretary','Admin','SECRETARY'),('Librarian','Admin','LIBRARIAN'),('LibraryAdmin','Admin','LIBRARY_ADMIN');
 INSERT dbo.UserAssignments(UserId,AssignmentTypeId,StartDate,IsPrimary,IsActive,CreatedAt)
 SELECT u.UserId,a.AssignmentTypeId,CONVERT(date,GETDATE()),1,1,GETDATE() FROM dbo.Users u JOIN dbo.Roles oldr ON oldr.RoleId=u.RoleId JOIN @RoleMigration m ON m.RoleKey=oldr.RoleKey JOIN dbo.AssignmentTypes a ON a.AssignmentKey=m.AssignmentKey WHERE NOT EXISTS(SELECT 1 FROM dbo.UserAssignments ua WHERE ua.UserId=u.UserId AND ua.AssignmentTypeId=a.AssignmentTypeId AND ua.IsActive=1);
 UPDATE u SET RoleId=nr.RoleId,LegacyRole=nr.RoleKey,UpdatedAt=GETDATE() FROM dbo.Users u JOIN dbo.Roles oldr ON oldr.RoleId=u.RoleId JOIN @RoleMigration m ON m.RoleKey=oldr.RoleKey JOIN dbo.Roles nr ON nr.RoleKey=m.MainRoleKey;
 UPDATE u SET RoleId=nr.RoleId,LegacyRole=nr.RoleKey,UpdatedAt=GETDATE() FROM dbo.Users u JOIN dbo.Roles oldr ON oldr.RoleId=u.RoleId JOIN dbo.Roles nr ON nr.RoleKey='PlatformAdmin' WHERE oldr.RoleKey='ITAdmin';

 IF EXISTS(SELECT 1 FROM dbo.Users u JOIN dbo.Roles r ON r.RoleId=u.RoleId WHERE r.RoleKey NOT IN('SuperAdmin','PlatformAdmin','PrintingAdmin','Admin','Teacher') AND r.RoleKey IN('HOD','HOS','Secretary','Librarian','LibraryAdmin','ITAdmin')) THROW 51001,'Specialized user migration validation failed.',1;
 PRINT 'After';
 SELECT WorkspaceKey,WorkspaceCategory,IsActive,SortOrder,DefaultRoute FROM dbo.Workspaces WHERE WorkspaceCategory IN('CORE','ASSIGNMENT') ORDER BY SortOrder;
 SELECT a.AssignmentKey,w.WorkspaceKey FROM dbo.AssignmentTypeWorkspaces x JOIN dbo.AssignmentTypes a ON a.AssignmentTypeId=x.AssignmentTypeId JOIN dbo.Workspaces w ON w.WorkspaceId=x.WorkspaceId WHERE x.IsActive=1 ORDER BY a.AssignmentKey;
 IF TRY_CONVERT(bit,SESSION_CONTEXT(N'OperationsPlatformDryRun'))=1
 BEGIN
   PRINT 'DRY RUN VALIDATION PASSED. ROLLING BACK EVERY CHANGE.';
   ROLLBACK TRANSACTION;
 END
 ELSE
 BEGIN
   PRINT 'FINAL MIGRATION VALIDATION PASSED. COMMITTING.';
   COMMIT TRANSACTION;
 END
END TRY
BEGIN CATCH
 IF XACT_STATE()<>0 ROLLBACK TRANSACTION;
 THROW;
END CATCH;
