SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRY
 BEGIN TRANSACTION;
 PRINT 'FINAL RELEASE MIGRATION - BEFORE STATE';
 SELECT WorkspaceCategory,IsActive,COUNT(*) WorkspaceCount FROM dbo.Workspaces GROUP BY WorkspaceCategory,IsActive;

 DECLARE @Enabled int=(SELECT TOP 1 VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE LOWER(StatusKey)='enabled');
 IF @Enabled IS NULL THROW 51000,'Enabled visibility status is missing.',1;
 DECLARE @Hidden int=(SELECT TOP 1 VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE LOWER(StatusKey)='hidden');
 IF OBJECT_ID('dbo.AssetTagBranding','U') IS NULL
  CREATE TABLE dbo.AssetTagBranding(
   AssetTagBrandingId int IDENTITY PRIMARY KEY,
   BrandingType nvarchar(30) NOT NULL,
   SettingsJson nvarchar(max) NOT NULL,
   IsActive bit NOT NULL CONSTRAINT DF_AssetTagBranding_IsActive DEFAULT 1,
   CreatedBy int NULL REFERENCES dbo.Users(UserId),
   UpdatedBy int NULL REFERENCES dbo.Users(UserId),
   CreatedAt datetime NOT NULL CONSTRAINT DF_AssetTagBranding_CreatedAt DEFAULT GETDATE(),
   UpdatedAt datetime NULL,
   CONSTRAINT UQ_AssetTagBranding_Type UNIQUE(BrandingType),
   CONSTRAINT CK_AssetTagBranding_Type CHECK(BrandingType IN('rounded','rectangular')),
   CONSTRAINT CK_AssetTagBranding_Json CHECK(ISJSON(SettingsJson)=1)
  );

 DECLARE @RoundedAssetTagDefaults nvarchar(max)=N'{"schoolTagline":"BEST VALUE BRITISH EDUCATION","departmentLabel":"IT DEPARTMENT","propertyLabel":"PROPERTY OF","establishedYear":"1975","websiteQrInstruction":"SCAN FOR SCHOOL WEBSITE","assetQrInstruction":"SCAN FOR ASSET INFORMATION","colors":{"outerRing":"#061B3D","innerRing":"#006B3C","accent":"#E6A000","background":"#FFFFFF","mainText":"#061B3D","secondaryText":"#006B3C","border":"#061B3D","barcode":"#000000","qrForeground":"#000000","qrBackground":"#FFFFFF","propertyText":"#006B3C","assetCode":"#000000","departmentText":"#061B3D"},"visibility":{"showWebsite":true,"showAddress":true,"showEstablishedYear":true,"showPropertyLabel":true,"showSocialIcons":false,"showSchoolLogo":true,"showSchoolTagline":true,"showWebsiteQr":true,"showAssetQr":true,"showBarcode":true},"print":{"templateKey":"FULL_A4","pageSize":"A4","orientation":"portrait","labelDiameter":190,"marginTop":12,"marginBottom":12,"marginLeft":10,"marginRight":10,"horizontalOffset":0,"verticalOffset":0,"printScale":1,"rows":1,"columns":1,"gapHorizontal":0,"gapVertical":0}}';
 DECLARE @RectangularAssetTagDefaults nvarchar(max)=N'{"contentLabel":"IT ASSET","propertyLabel":"PROPERTY OF","visibility":{"showQrCode":true,"showBarcode":true,"showLogo":true,"showBorder":true},"colors":{"border":"#000000","mainText":"#000000","background":"#FFFFFF","accent":"#E6A000","barcode":"#000000","qrForeground":"#000000","qrBackground":"#FFFFFF"},"print":{"templateKey":"RECTANGULAR_A4_GRID","pageSize":"A4","orientation":"portrait","printScale":1}}';
 MERGE dbo.AssetTagBranding t
 USING(VALUES('rounded',@RoundedAssetTagDefaults),('rectangular',@RectangularAssetTagDefaults))s(BrandingType,SettingsJson)
 ON t.BrandingType=s.BrandingType
 WHEN MATCHED THEN UPDATE SET IsActive=1,UpdatedAt=COALESCE(t.UpdatedAt,GETDATE())
 WHEN NOT MATCHED THEN INSERT(BrandingType,SettingsJson,IsActive,CreatedAt,UpdatedAt) VALUES(s.BrandingType,s.SettingsJson,1,GETDATE(),GETDATE());

 IF NOT EXISTS(SELECT 1 FROM dbo.Workspaces WHERE WorkspaceKey='homeroom-teacher')
  INSERT dbo.Workspaces(WorkspaceKey,WorkspaceName,Description,Icon,DefaultRoute,WorkspaceCategory,VisibilityStatusId,IsDefault,IsActive,SortOrder,CreatedAt)
  VALUES('homeroom-teacher','Homeroom Teacher','Class-scoped homeroom experience.','School','/homeroom/dashboard','ASSIGNMENT',@Enabled,0,1,130,GETDATE());
 ELSE UPDATE dbo.Workspaces SET WorkspaceName='Homeroom Teacher',DefaultRoute='/homeroom/dashboard',WorkspaceCategory='ASSIGNMENT',IsActive=1,IsDefault=0,SortOrder=130,UpdatedAt=GETDATE() WHERE WorkspaceKey='homeroom-teacher';

 UPDATE dbo.Workspaces SET WorkspaceCategory='CORE',IsActive=1,SortOrder=CASE WorkspaceKey WHEN 'super-admin' THEN 10 WHEN 'platform-admin' THEN 20 WHEN 'printing-admin' THEN 30 WHEN 'admin' THEN 40 ELSE 50 END,UpdatedAt=GETDATE() WHERE WorkspaceKey IN('super-admin','platform-admin','printing-admin','admin','teacher');
 UPDATE dbo.Workspaces SET WorkspaceCategory='LEGACY',IsActive=0,IsDefault=0,UpdatedAt=GETDATE() WHERE WorkspaceKey IN('default','it','printing','academic');
 UPDATE dbo.Workspaces SET WorkspaceCategory='ASSIGNMENT',IsActive=1,SortOrder=CASE WorkspaceKey WHEN 'hod' THEN 100 WHEN 'hos-secretary' THEN 110 WHEN 'year-leader' THEN 120 WHEN 'homeroom-teacher' THEN 130 WHEN 'library-admin' THEN 140 WHEN 'deputy-head' THEN 150 WHEN 'head-of-operations' THEN 160 ELSE 170 END,UpdatedAt=GETDATE() WHERE WorkspaceKey IN('hod','hos-secretary','year-leader','homeroom-teacher','library-admin','deputy-head','head-of-operations','nurse-clinic');

 DECLARE @PlatformModuleId int=(SELECT ModuleId FROM dbo.Modules WHERE ModuleKey='platform_foundation');
 IF @PlatformModuleId IS NULL THROW 51002,'Platform foundation module is missing.',1;
 DECLARE @ItModuleId int=(SELECT ModuleId FROM dbo.Modules WHERE ModuleKey='it_operations');
 IF @ItModuleId IS NULL THROW 51003,'IT operations module is missing.',1;
 DECLARE @TagPermissions TABLE(PermissionKey nvarchar(100),PermissionName nvarchar(150),ModuleId int);
 INSERT @TagPermissions VALUES
  ('asset_tags.rounded.view','Rounded Printer View',@ItModuleId),
  ('asset_tags.rounded.print','Rounded Printer Print',@ItModuleId),
  ('asset_tags.rectangular.view','Rectangular Printer View',@ItModuleId),
  ('asset_tags.rectangular.print','Rectangular Printer Print',@ItModuleId),
  ('asset_tag_branding.rounded.view','Rounded Branding View',@PlatformModuleId),
  ('asset_tag_branding.rounded.manage','Rounded Branding Manage',@PlatformModuleId),
  ('asset_tag_branding.rectangular.view','Rectangular Branding View',@PlatformModuleId),
  ('asset_tag_branding.rectangular.manage','Rectangular Branding Manage',@PlatformModuleId);
 MERGE dbo.Permissions t USING @TagPermissions s ON s.PermissionKey=t.PermissionKey WHEN MATCHED THEN UPDATE SET PermissionName=s.PermissionName,ModuleId=s.ModuleId,IsActive=1,UpdatedAt=GETDATE() WHEN NOT MATCHED THEN INSERT(PermissionKey,PermissionName,ModuleId,Description,IsActive,CreatedAt) VALUES(s.PermissionKey,s.PermissionName,s.ModuleId,'Asset tag printing and branding.',1,GETDATE());
 INSERT dbo.RolePermissions(RoleId,PermissionId,IsAllowed,CreatedAt) SELECT r.RoleId,p.PermissionId,1,GETDATE() FROM dbo.Roles r JOIN dbo.Permissions p ON p.PermissionKey IN('asset_tags.rounded.view','asset_tags.rounded.print','asset_tags.rectangular.view','asset_tags.rectangular.print','asset_tag_branding.rounded.view','asset_tag_branding.rounded.manage','asset_tag_branding.rectangular.view','asset_tag_branding.rectangular.manage') WHERE r.RoleKey='SuperAdmin' AND NOT EXISTS(SELECT 1 FROM dbo.RolePermissions x WHERE x.RoleId=r.RoleId AND x.PermissionId=p.PermissionId);
 INSERT dbo.RolePermissions(RoleId,PermissionId,IsAllowed,CreatedAt) SELECT r.RoleId,p.PermissionId,1,GETDATE() FROM dbo.Roles r JOIN dbo.Permissions p ON p.PermissionKey IN('asset_tags.rounded.view','asset_tags.rounded.print','asset_tags.rectangular.view','asset_tags.rectangular.print') WHERE r.RoleKey IN('PlatformAdmin','PrintingAdmin') AND NOT EXISTS(SELECT 1 FROM dbo.RolePermissions x WHERE x.RoleId=r.RoleId AND x.PermissionId=p.PermissionId);

 DECLARE @CanonicalMenuId int;

 SELECT TOP 1 @CanonicalMenuId=MenuId
 FROM dbo.Menus
 WHERE MenuKey='IT_RECTANGULAR_ASSET_TAG_PRINTER'
    OR MenuKey IN('IT_ASSET_TAG_PRINTER','rectangular_asset_tag_printer')
    OR Route='/it-assets/asset-tag-printer'
 ORDER BY CASE MenuKey WHEN 'IT_RECTANGULAR_ASSET_TAG_PRINTER' THEN 0 WHEN 'rectangular_asset_tag_printer' THEN 1 WHEN 'IT_ASSET_TAG_PRINTER' THEN 2 ELSE 3 END,MenuId;
 IF @CanonicalMenuId IS NOT NULL
  UPDATE dbo.Menus SET MenuKey='IT_RECTANGULAR_ASSET_TAG_PRINTER',MenuName='Rectangular Asset Tag Printer',Route='/it-assets/asset-tag-printer',Icon='print',VisibilityStatusId=@Enabled,UpdatedAt=GETDATE() WHERE MenuId=@CanonicalMenuId;
 UPDATE wm SET IsVisible=0,IsEnabled=0,UpdatedAt=GETDATE()
 FROM dbo.WorkspaceMenus wm JOIN dbo.Menus m ON m.MenuId=wm.MenuId
 WHERE m.MenuId<>ISNULL(@CanonicalMenuId,-1) AND (m.Route='/it-assets/asset-tag-printer' OR m.MenuKey IN('IT_ASSET_TAG_PRINTER','rectangular_asset_tag_printer','IT_RECTANGULAR_ASSET_TAG_PRINTER'));
 UPDATE dbo.Menus SET Route=NULL,VisibilityStatusId=COALESCE(@Hidden,@Enabled),UpdatedAt=GETDATE() WHERE MenuId<>ISNULL(@CanonicalMenuId,-1) AND (Route='/it-assets/asset-tag-printer' OR MenuKey IN('IT_ASSET_TAG_PRINTER','rectangular_asset_tag_printer','IT_RECTANGULAR_ASSET_TAG_PRINTER'));

 SET @CanonicalMenuId=NULL;
 SELECT TOP 1 @CanonicalMenuId=MenuId
 FROM dbo.Menus
 WHERE MenuKey='IT_ROUNDED_ASSET_TAG_PRINTER'
    OR MenuKey='rounded_asset_tag_printer'
    OR Route='/it-assets/rounded-asset-tag-printer'
 ORDER BY CASE MenuKey WHEN 'IT_ROUNDED_ASSET_TAG_PRINTER' THEN 0 WHEN 'rounded_asset_tag_printer' THEN 1 ELSE 2 END,MenuId;
 IF @CanonicalMenuId IS NOT NULL
  UPDATE dbo.Menus SET MenuKey='IT_ROUNDED_ASSET_TAG_PRINTER',MenuName='Rounded Asset Tag Printer',Route='/it-assets/rounded-asset-tag-printer',Icon='print',VisibilityStatusId=@Enabled,UpdatedAt=GETDATE() WHERE MenuId=@CanonicalMenuId;
 UPDATE wm SET IsVisible=0,IsEnabled=0,UpdatedAt=GETDATE()
 FROM dbo.WorkspaceMenus wm JOIN dbo.Menus m ON m.MenuId=wm.MenuId
 WHERE m.MenuId<>ISNULL(@CanonicalMenuId,-1) AND (m.Route='/it-assets/rounded-asset-tag-printer' OR m.MenuKey IN('rounded_asset_tag_printer','IT_ROUNDED_ASSET_TAG_PRINTER'));
 UPDATE dbo.Menus SET Route=NULL,VisibilityStatusId=COALESCE(@Hidden,@Enabled),UpdatedAt=GETDATE() WHERE MenuId<>ISNULL(@CanonicalMenuId,-1) AND (Route='/it-assets/rounded-asset-tag-printer' OR MenuKey IN('rounded_asset_tag_printer','IT_ROUNDED_ASSET_TAG_PRINTER'));

 SET @CanonicalMenuId=NULL;
 SELECT TOP 1 @CanonicalMenuId=MenuId
 FROM dbo.Menus
 WHERE MenuKey='SCHOOL_ROUNDED_ASSET_TAG_BRANDING'
    OR MenuKey='rounded_asset_tag_branding'
    OR Route='/system/rounded-asset-tag-branding'
 ORDER BY CASE MenuKey WHEN 'SCHOOL_ROUNDED_ASSET_TAG_BRANDING' THEN 0 WHEN 'rounded_asset_tag_branding' THEN 1 ELSE 2 END,MenuId;
 IF @CanonicalMenuId IS NOT NULL
  UPDATE dbo.Menus SET MenuKey='SCHOOL_ROUNDED_ASSET_TAG_BRANDING',MenuName='Rounded Asset Tag Branding',Route='/system/rounded-asset-tag-branding',Icon='palette',VisibilityStatusId=@Enabled,UpdatedAt=GETDATE() WHERE MenuId=@CanonicalMenuId;
 UPDATE wm SET IsVisible=0,IsEnabled=0,UpdatedAt=GETDATE()
 FROM dbo.WorkspaceMenus wm JOIN dbo.Menus m ON m.MenuId=wm.MenuId
 WHERE m.MenuId<>ISNULL(@CanonicalMenuId,-1) AND (m.Route='/system/rounded-asset-tag-branding' OR m.MenuKey IN('rounded_asset_tag_branding','SCHOOL_ROUNDED_ASSET_TAG_BRANDING'));
 UPDATE dbo.Menus SET Route=NULL,VisibilityStatusId=COALESCE(@Hidden,@Enabled),UpdatedAt=GETDATE() WHERE MenuId<>ISNULL(@CanonicalMenuId,-1) AND (Route='/system/rounded-asset-tag-branding' OR MenuKey IN('rounded_asset_tag_branding','SCHOOL_ROUNDED_ASSET_TAG_BRANDING'));

 SET @CanonicalMenuId=NULL;
 SELECT TOP 1 @CanonicalMenuId=MenuId
 FROM dbo.Menus
 WHERE MenuKey='SCHOOL_RECTANGULAR_ASSET_TAG_BRANDING'
    OR MenuKey='rectangular_asset_tag_branding'
    OR Route='/system/rectangular-asset-tag-branding'
 ORDER BY CASE MenuKey WHEN 'SCHOOL_RECTANGULAR_ASSET_TAG_BRANDING' THEN 0 WHEN 'rectangular_asset_tag_branding' THEN 1 ELSE 2 END,MenuId;
 IF @CanonicalMenuId IS NOT NULL
  UPDATE dbo.Menus SET MenuKey='SCHOOL_RECTANGULAR_ASSET_TAG_BRANDING',MenuName='Rectangular Asset Tag Branding',Route='/system/rectangular-asset-tag-branding',Icon='palette',VisibilityStatusId=@Enabled,UpdatedAt=GETDATE() WHERE MenuId=@CanonicalMenuId;
 UPDATE wm SET IsVisible=0,IsEnabled=0,UpdatedAt=GETDATE()
 FROM dbo.WorkspaceMenus wm JOIN dbo.Menus m ON m.MenuId=wm.MenuId
 WHERE m.MenuId<>ISNULL(@CanonicalMenuId,-1) AND (m.Route='/system/rectangular-asset-tag-branding' OR m.MenuKey IN('rectangular_asset_tag_branding','SCHOOL_RECTANGULAR_ASSET_TAG_BRANDING'));
 UPDATE dbo.Menus SET Route=NULL,VisibilityStatusId=COALESCE(@Hidden,@Enabled),UpdatedAt=GETDATE() WHERE MenuId<>ISNULL(@CanonicalMenuId,-1) AND (Route='/system/rectangular-asset-tag-branding' OR MenuKey IN('rectangular_asset_tag_branding','SCHOOL_RECTANGULAR_ASSET_TAG_BRANDING'));

 DECLARE @AssetTagMenus TABLE(ParentMenuKey nvarchar(100),ModuleId int,MenuKey nvarchar(100),MenuName nvarchar(150),Route nvarchar(150),Icon nvarchar(100),PermissionKey nvarchar(100),SortOrder int);
 INSERT @AssetTagMenus VALUES
  ('IT_OPERATIONS_ROOT',@ItModuleId,'IT_RECTANGULAR_ASSET_TAG_PRINTER','Rectangular Asset Tag Printer','/it-assets/asset-tag-printer','print','asset_tags.rectangular.view',25),
  ('IT_OPERATIONS_ROOT',@ItModuleId,'IT_ROUNDED_ASSET_TAG_PRINTER','Rounded Asset Tag Printer','/it-assets/rounded-asset-tag-printer','print','asset_tags.rounded.view',26),
  ('SCHOOL_CONFIGURATION_ROOT',@PlatformModuleId,'SCHOOL_ROUNDED_ASSET_TAG_BRANDING','Rounded Asset Tag Branding','/system/rounded-asset-tag-branding','palette','asset_tag_branding.rounded.view',25),
  ('SCHOOL_CONFIGURATION_ROOT',@PlatformModuleId,'SCHOOL_RECTANGULAR_ASSET_TAG_BRANDING','Rectangular Asset Tag Branding','/system/rectangular-asset-tag-branding','palette','asset_tag_branding.rectangular.view',26);

 MERGE dbo.Menus t
 USING(
  SELECT a.*,parent.MenuId ParentMenuId,p.PermissionId
  FROM @AssetTagMenus a
  JOIN dbo.Menus parent ON parent.MenuKey=a.ParentMenuKey
  JOIN dbo.Permissions p ON p.PermissionKey=a.PermissionKey
 )s ON t.MenuKey=s.MenuKey
 WHEN MATCHED THEN UPDATE SET ModuleId=s.ModuleId,ParentMenuId=s.ParentMenuId,MenuName=s.MenuName,Route=s.Route,Icon=s.Icon,PermissionId=s.PermissionId,VisibilityStatusId=@Enabled,IsPinned=0,IsCollapsible=0,SortOrder=s.SortOrder,UpdatedAt=GETDATE()
 WHEN NOT MATCHED THEN INSERT(ModuleId,ParentMenuId,MenuKey,MenuName,Route,Icon,PermissionId,VisibilityStatusId,IsPinned,IsCollapsible,SortOrder,CreatedAt) VALUES(s.ModuleId,s.ParentMenuId,s.MenuKey,s.MenuName,s.Route,s.Icon,s.PermissionId,@Enabled,0,0,s.SortOrder,GETDATE());

 DECLARE @AssetTagRootBindings TABLE(WorkspaceKey nvarchar(100),MenuKey nvarchar(100),GroupKey nvarchar(100),GroupName nvarchar(150),GroupSortOrder int,SortOrder int);
 INSERT @AssetTagRootBindings VALUES
  ('super-admin','IT_OPERATIONS_ROOT','OPERATIONS','Operations',20,30),
  ('platform-admin','IT_OPERATIONS_ROOT','OPERATIONS','Operations',20,30),
  ('printing-admin','IT_OPERATIONS_ROOT','OPERATIONS','Operations',20,30),
  ('super-admin','SCHOOL_CONFIGURATION_ROOT','CONFIGURATION','Configuration',30,10);
 MERGE dbo.WorkspaceMenus t
 USING(SELECT w.WorkspaceId,m.MenuId,b.GroupKey,b.GroupName,b.GroupSortOrder,b.SortOrder FROM @AssetTagRootBindings b JOIN dbo.Workspaces w ON w.WorkspaceKey=b.WorkspaceKey JOIN dbo.Menus m ON m.MenuKey=b.MenuKey)s
 ON s.WorkspaceId=t.WorkspaceId AND s.MenuId=t.MenuId
 WHEN MATCHED THEN UPDATE SET GroupKey=s.GroupKey,GroupName=s.GroupName,GroupSortOrder=s.GroupSortOrder,ParentMenuId=NULL,IsVisible=1,IsEnabled=1,SortOrder=s.SortOrder,UpdatedAt=GETDATE()
 WHEN NOT MATCHED THEN INSERT(WorkspaceId,MenuId,GroupKey,GroupName,GroupSortOrder,ParentMenuId,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.MenuId,s.GroupKey,s.GroupName,s.GroupSortOrder,NULL,1,1,s.SortOrder);

 DECLARE @AssetTagChildBindings TABLE(WorkspaceKey nvarchar(100),MenuKey nvarchar(100),ParentMenuKey nvarchar(100),GroupKey nvarchar(100),GroupName nvarchar(150),GroupSortOrder int,SortOrder int);
 INSERT @AssetTagChildBindings VALUES
  ('super-admin','IT_RECTANGULAR_ASSET_TAG_PRINTER','IT_OPERATIONS_ROOT','OPERATIONS','Operations',20,25),
  ('platform-admin','IT_RECTANGULAR_ASSET_TAG_PRINTER','IT_OPERATIONS_ROOT','OPERATIONS','Operations',20,25),
  ('printing-admin','IT_RECTANGULAR_ASSET_TAG_PRINTER','IT_OPERATIONS_ROOT','OPERATIONS','Operations',20,25),
  ('super-admin','IT_ROUNDED_ASSET_TAG_PRINTER','IT_OPERATIONS_ROOT','OPERATIONS','Operations',20,26),
  ('platform-admin','IT_ROUNDED_ASSET_TAG_PRINTER','IT_OPERATIONS_ROOT','OPERATIONS','Operations',20,26),
  ('printing-admin','IT_ROUNDED_ASSET_TAG_PRINTER','IT_OPERATIONS_ROOT','OPERATIONS','Operations',20,26),
  ('super-admin','SCHOOL_ROUNDED_ASSET_TAG_BRANDING','SCHOOL_CONFIGURATION_ROOT','CONFIGURATION','Configuration',30,25),
  ('super-admin','SCHOOL_RECTANGULAR_ASSET_TAG_BRANDING','SCHOOL_CONFIGURATION_ROOT','CONFIGURATION','Configuration',30,26);
 MERGE dbo.WorkspaceMenus t
 USING(SELECT w.WorkspaceId,m.MenuId,parent.MenuId ParentMenuId,b.GroupKey,b.GroupName,b.GroupSortOrder,b.SortOrder FROM @AssetTagChildBindings b JOIN dbo.Workspaces w ON w.WorkspaceKey=b.WorkspaceKey JOIN dbo.Menus m ON m.MenuKey=b.MenuKey JOIN dbo.Menus parent ON parent.MenuKey=b.ParentMenuKey)s
 ON s.WorkspaceId=t.WorkspaceId AND s.MenuId=t.MenuId
 WHEN MATCHED THEN UPDATE SET GroupKey=s.GroupKey,GroupName=s.GroupName,GroupSortOrder=s.GroupSortOrder,ParentMenuId=s.ParentMenuId,IsVisible=1,IsEnabled=1,SortOrder=s.SortOrder,UpdatedAt=GETDATE()
 WHEN NOT MATCHED THEN INSERT(WorkspaceId,MenuId,GroupKey,GroupName,GroupSortOrder,ParentMenuId,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.MenuId,s.GroupKey,s.GroupName,s.GroupSortOrder,s.ParentMenuId,1,1,s.SortOrder);
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
