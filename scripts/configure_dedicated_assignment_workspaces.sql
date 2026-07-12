SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
  BEGIN TRANSACTION;
  PRINT '=== BEFORE: WORKSPACES ===';
  SELECT WorkspaceKey,WorkspaceName,DefaultRoute,IsDefault,SortOrder,IsActive FROM dbo.Workspaces ORDER BY SortOrder,WorkspaceKey;

  IF COL_LENGTH('dbo.Workspaces','WorkspaceCategory') IS NULL
    EXEC('ALTER TABLE dbo.Workspaces ADD WorkspaceCategory nvarchar(30) NULL;');

  EXEC(N'UPDATE dbo.Workspaces SET WorkspaceCategory=CASE
    WHEN WorkspaceKey IN (''super-admin'',''platform-admin'',''printing-admin'',''admin'',''teacher'') THEN ''CORE''
    WHEN WorkspaceKey IN (''hod'',''hos-secretary'',''year-leader'',''library-admin'',''deputy-head'',''head-of-operations'',''nurse-clinic'') THEN ''ASSIGNMENT''
    WHEN WorkspaceKey IN (''default'',''it'',''printing'',''academic'') THEN ''LEGACY''
    ELSE COALESCE(WorkspaceCategory,''LEGACY'') END;');

  DECLARE @Enabled int=(SELECT TOP 1 VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE LOWER(StatusKey)='enabled');
  IF @Enabled IS NULL THROW 51001,'Enabled visibility status is missing.',1;
  DECLARE @Desired TABLE(WorkspaceKey nvarchar(100),WorkspaceName nvarchar(150),DefaultRoute nvarchar(300),Category nvarchar(30),SortOrder int);
  INSERT @Desired VALUES
  ('super-admin','Super Admin','/super-admin/dashboard','CORE',10),('platform-admin','Platform Admin','/platform-admin/dashboard','CORE',20),
  ('printing-admin','Printing Admin','/printing/dashboard','CORE',30),('admin','Admin','/admin/dashboard','CORE',40),('teacher','Teacher','/teacher/dashboard','CORE',50),
  ('hod','HOD','/hod/dashboard','ASSIGNMENT',100),('hos-secretary','HOS / Secretary','/hos/dashboard','ASSIGNMENT',110),
  ('year-leader','Year Leader','/year-leader/dashboard','ASSIGNMENT',120),('library-admin','Librarian / Library Admin','/library/dashboard','ASSIGNMENT',130),
  ('deputy-head','Deputy Head','/deputy-head/dashboard','ASSIGNMENT',140),('head-of-operations','Head of Operations','/head-of-operations/dashboard','ASSIGNMENT',150),
  ('nurse-clinic','Nurse / Clinic','/clinic/dashboard','ASSIGNMENT',160);
  MERGE dbo.Workspaces t USING @Desired s ON t.WorkspaceKey=s.WorkspaceKey
  WHEN MATCHED THEN UPDATE SET WorkspaceName=s.WorkspaceName,DefaultRoute=s.DefaultRoute,VisibilityStatusId=@Enabled,IsDefault=0,SortOrder=s.SortOrder,IsActive=1,UpdatedAt=GETDATE()
  WHEN NOT MATCHED THEN INSERT(WorkspaceKey,WorkspaceName,Description,Icon,DefaultRoute,VisibilityStatusId,IsDefault,SortOrder,CreatedAt,IsActive)
    VALUES(s.WorkspaceKey,s.WorkspaceName,CONCAT(s.WorkspaceName,' workspace'),'Dashboard',s.DefaultRoute,@Enabled,0,s.SortOrder,GETDATE(),1);
  EXEC(N'UPDATE w SET WorkspaceCategory=d.Category FROM dbo.Workspaces w JOIN (VALUES
    (''super-admin'',''CORE''),(''platform-admin'',''CORE''),(''printing-admin'',''CORE''),(''admin'',''CORE''),(''teacher'',''CORE''),
    (''hod'',''ASSIGNMENT''),(''hos-secretary'',''ASSIGNMENT''),(''year-leader'',''ASSIGNMENT''),(''library-admin'',''ASSIGNMENT''),(''deputy-head'',''ASSIGNMENT''),(''head-of-operations'',''ASSIGNMENT''),(''nurse-clinic'',''ASSIGNMENT''))d(WorkspaceKey,Category) ON d.WorkspaceKey=w.WorkspaceKey;');
  EXEC(N'UPDATE dbo.Workspaces SET WorkspaceCategory=''LEGACY'',IsActive=0,IsDefault=0,UpdatedAt=GETDATE() WHERE WorkspaceKey IN(''default'',''it'',''printing'',''academic'');');
  IF EXISTS(SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('dbo.Workspaces') AND name='WorkspaceCategory' AND is_nullable=1) EXEC('ALTER TABLE dbo.Workspaces ALTER COLUMN WorkspaceCategory nvarchar(30) NOT NULL;');
  IF NOT EXISTS(SELECT 1 FROM sys.check_constraints WHERE name='CK_Workspaces_Category') EXEC('ALTER TABLE dbo.Workspaces ADD CONSTRAINT CK_Workspaces_Category CHECK(WorkspaceCategory IN(''CORE'',''ASSIGNMENT'',''LEGACY''));');
  IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.Workspaces') AND name='IX_Workspaces_Category_Active_Sort') EXEC('CREATE INDEX IX_Workspaces_Category_Active_Sort ON dbo.Workspaces(WorkspaceCategory,IsActive,SortOrder);');

  DECLARE @RoleMap TABLE(RoleKey nvarchar(100),WorkspaceKey nvarchar(100));
  INSERT @RoleMap VALUES('SuperAdmin','super-admin'),('PlatformAdmin','platform-admin'),('PrintingAdmin','printing-admin'),('Admin','admin'),('Teacher','teacher'),('HOD','hod'),('HOS','hos-secretary'),('Secretary','hos-secretary'),('Librarian','library-admin'),('LibraryAdmin','library-admin');
  UPDATE wr SET IsDefault=0 FROM dbo.WorkspaceRoles wr JOIN dbo.Roles r ON r.RoleId=wr.RoleId JOIN @RoleMap x ON x.RoleKey=r.RoleKey;
  MERGE dbo.WorkspaceRoles t USING(SELECT r.RoleId,w.WorkspaceId FROM @RoleMap x JOIN dbo.Roles r ON r.RoleKey=x.RoleKey JOIN dbo.Workspaces w ON w.WorkspaceKey=x.WorkspaceKey)s
    ON t.RoleId=s.RoleId AND t.WorkspaceId=s.WorkspaceId WHEN MATCHED THEN UPDATE SET IsDefault=1 WHEN NOT MATCHED THEN INSERT(WorkspaceId,RoleId,IsDefault,CreatedAt) VALUES(s.WorkspaceId,s.RoleId,1,GETDATE());

  DECLARE @AssignmentMap TABLE(AssignmentKey nvarchar(100),WorkspaceKey nvarchar(100));
  INSERT @AssignmentMap VALUES('HOD','hod'),('HOS','hos-secretary'),('YEAR_LEADER','year-leader'),('DEPUTY_HEAD','deputy-head'),('HEAD_OF_OPERATIONS','head-of-operations'),('NURSE','nurse-clinic'),('HOMEROOM_TEACHER','teacher'),('TEACHING_ASSISTANT','teacher'),('IT_COORDINATOR','platform-admin'),('PRINTING_COORDINATOR','printing-admin');
  UPDATE atw SET IsActive=0,UpdatedAt=GETDATE() FROM dbo.AssignmentTypeWorkspaces atw JOIN dbo.AssignmentTypes a ON a.AssignmentTypeId=atw.AssignmentTypeId JOIN @AssignmentMap x ON x.AssignmentKey=a.AssignmentKey JOIN dbo.Workspaces w ON w.WorkspaceId=atw.WorkspaceId WHERE w.WorkspaceKey<>x.WorkspaceKey AND atw.IsActive=1;
  MERGE dbo.AssignmentTypeWorkspaces t USING(SELECT a.AssignmentTypeId,w.WorkspaceId FROM @AssignmentMap x JOIN dbo.AssignmentTypes a ON a.AssignmentKey=x.AssignmentKey JOIN dbo.Workspaces w ON w.WorkspaceKey=x.WorkspaceKey)s
    ON t.AssignmentTypeId=s.AssignmentTypeId AND t.WorkspaceId=s.WorkspaceId WHEN MATCHED THEN UPDATE SET IsActive=1,UpdatedAt=GETDATE() WHEN NOT MATCHED THEN INSERT(AssignmentTypeId,WorkspaceId,IsActive,CreatedAt) VALUES(s.AssignmentTypeId,s.WorkspaceId,1,GETDATE());

  MERGE dbo.WorkspaceMenus t USING(SELECT w.WorkspaceId,m.MenuId FROM dbo.Workspaces w JOIN @Desired d ON d.WorkspaceKey=w.WorkspaceKey JOIN dbo.Menus m ON m.Route=w.DefaultRoute AND m.PermissionId IS NOT NULL)s ON t.WorkspaceId=s.WorkspaceId AND t.MenuId=s.MenuId
  WHEN MATCHED THEN UPDATE SET GroupKey='MAIN',GroupName='Main',GroupSortOrder=10,IsVisible=1,IsEnabled=1,SortOrder=10,UpdatedAt=GETDATE()
  WHEN NOT MATCHED THEN INSERT(WorkspaceId,MenuId,GroupKey,GroupName,GroupSortOrder,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.MenuId,'MAIN','Main',10,1,1,10);

  IF (SELECT COUNT(*) FROM dbo.Workspaces WHERE WorkspaceKey IN(SELECT WorkspaceKey FROM @Desired) AND IsActive=1)<>12 THROW 51002,'Not all required workspaces are active.',1;
  IF EXISTS(SELECT 1 FROM dbo.Workspaces WHERE WorkspaceKey IN('default','it','printing','academic') AND (IsActive=1 OR IsDefault=1)) THROW 51003,'A legacy workspace remains active/default.',1;
  IF EXISTS(SELECT 1 FROM @AssignmentMap x WHERE NOT EXISTS(SELECT 1 FROM dbo.AssignmentTypeWorkspaces atw JOIN dbo.AssignmentTypes a ON a.AssignmentTypeId=atw.AssignmentTypeId JOIN dbo.Workspaces w ON w.WorkspaceId=atw.WorkspaceId WHERE a.AssignmentKey=x.AssignmentKey AND w.WorkspaceKey=x.WorkspaceKey AND atw.IsActive=1)) THROW 51004,'Assignment workspace mapping validation failed.',1;

  PRINT '=== AFTER: WORKSPACES ===';
  EXEC('SELECT WorkspaceKey,WorkspaceName,WorkspaceCategory,DefaultRoute,IsDefault,SortOrder,IsActive FROM dbo.Workspaces ORDER BY WorkspaceCategory,SortOrder,WorkspaceKey;');
  PRINT '=== ASSIGNMENT TYPE WORKSPACE MAPPINGS ===';
  SELECT a.AssignmentKey,w.WorkspaceKey,atw.IsActive FROM dbo.AssignmentTypeWorkspaces atw JOIN dbo.AssignmentTypes a ON a.AssignmentTypeId=atw.AssignmentTypeId JOIN dbo.Workspaces w ON w.WorkspaceId=atw.WorkspaceId ORDER BY a.AssignmentKey,w.WorkspaceKey;
  PRINT '=== WORKSPACE ROLE MAPPINGS ===';
  SELECT r.RoleKey,w.WorkspaceKey,wr.IsDefault FROM dbo.WorkspaceRoles wr JOIN dbo.Roles r ON r.RoleId=wr.RoleId JOIN dbo.Workspaces w ON w.WorkspaceId=wr.WorkspaceId ORDER BY r.RoleKey,w.WorkspaceKey;
  PRINT 'VALIDATION PASSED. COMMITTING.';
  COMMIT TRANSACTION;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
  THROW;
END CATCH;
