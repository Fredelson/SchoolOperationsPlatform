SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @Enabled int=(SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey='Enabled');
DECLARE @Hidden int=(SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey='Hidden');
DECLARE @Workspace int=(SELECT TOP 1 WorkspaceId FROM dbo.Workspaces WHERE IsDefault=1 ORDER BY WorkspaceId);
DECLARE @PlatformModule int=(SELECT ModuleId FROM dbo.Modules WHERE ModuleKey='platform_foundation');
DECLARE @UserModule int=(SELECT ModuleId FROM dbo.Modules WHERE ModuleKey='user_access');
DECLARE @PrintingModule int=(SELECT ModuleId FROM dbo.Modules WHERE ModuleKey='printing_management');
DECLARE @ItModule int=(SELECT ModuleId FROM dbo.Modules WHERE ModuleKey='it_operations');
DECLARE @SchoolModule int=(SELECT ModuleId FROM dbo.Modules WHERE ModuleKey='school_configuration');

-- Preserve stable module keys; hide overlapping/future modules.
UPDATE dbo.Modules SET VisibilityStatusId=@Hidden,UpdatedAt=GETDATE()
WHERE ModuleKey IN('system_control','system_tools','platform','communication','communication_center','reports_analytics','facilities_management','id_management','observations','academic_operations','hr_management','workflow_engine','inventory','it_service_desk');
UPDATE dbo.Modules SET VisibilityStatusId=@Enabled,IsActive=1,UpdatedAt=GETDATE()
WHERE ModuleKey IN('platform_foundation','user_access','school_configuration','printing_management','it_operations');

-- Supported groups only. Existing groups remain preserved but hidden.
UPDATE dbo.MenuGroups SET VisibilityStatusId=@Hidden,UpdatedAt=GETDATE();
UPDATE dbo.MenuGroups SET VisibilityStatusId=@Enabled,UpdatedAt=GETDATE() WHERE GroupKey IN('MAIN','PLATFORM_FOUNDATION','USER_ACCESS','SCHOOL_CONFIGURATION');
IF NOT EXISTS(SELECT 1 FROM dbo.MenuGroups WHERE GroupKey='IT_OPERATIONS')
 INSERT dbo.MenuGroups(WorkspaceId,GroupKey,GroupName,Icon,VisibilityStatusId,SortOrder,CreatedAt) VALUES(@Workspace,'IT_OPERATIONS','IT Operations','devices',@Enabled,50,GETDATE());
IF NOT EXISTS(SELECT 1 FROM dbo.MenuGroups WHERE GroupKey='PRINTING_MANAGEMENT')
 INSERT dbo.MenuGroups(WorkspaceId,GroupKey,GroupName,Icon,VisibilityStatusId,SortOrder,CreatedAt) VALUES(@Workspace,'PRINTING_MANAGEMENT','Printing Management','print',@Enabled,60,GETDATE());
UPDATE dbo.MenuGroups SET GroupName='IT Operations',VisibilityStatusId=@Enabled,SortOrder=50 WHERE GroupKey='IT_OPERATIONS';
UPDATE dbo.MenuGroups SET GroupName='Printing Management',VisibilityStatusId=@Enabled,SortOrder=60 WHERE GroupKey='PRINTING_MANAGEMENT';

-- Ensure permission registry entries used by navigation and APIs.
DECLARE @P TABLE(PermissionKey nvarchar(100),PermissionName nvarchar(150),ModuleId int);
INSERT @P VALUES
('users.view','View Users',@UserModule),('roles.view','View Roles',@UserModule),('permissions.view','View Permissions',@UserModule),
('permission-groups.view','View Permission Groups',@UserModule),('role-permissions.view','View Role Permissions',@UserModule),
('printing.dashboard.view','View Printing Dashboard',@PrintingModule),('printing.queue.view','View Printing Queue',@PrintingModule),
('printing.inventory.view','View Printing Inventory',@PrintingModule),('printing.purchases.view','View Printing Purchases',@PrintingModule),
('printing.distributions.view','View Printing Distributions',@PrintingModule),('printing.master-data.view','View Printing Master Data',@PrintingModule),
('printing.access-levels.view','View Printing Access Levels',@PrintingModule);
INSERT dbo.Permissions(PermissionKey,PermissionName,ModuleId,PermissionGroupId,Description,IsActive,CreatedAt)
SELECT PermissionKey,PermissionName,ModuleId,NULL,PermissionName,1,GETDATE() FROM @P p WHERE NOT EXISTS(SELECT 1 FROM dbo.Permissions x WHERE x.PermissionKey=p.PermissionKey);

-- Ensure operational roles referenced by protected frontend/backend routes exist.
DECLARE @OperationalAccessLevel int=(SELECT TOP 1 AccessLevelId FROM dbo.AccessLevels WHERE AccessLevelKey='PLATFORM_ADMIN_LEVEL' OR AccessLevelName='PlatformAdminLevel' ORDER BY AccessLevelId DESC);
IF NOT EXISTS(SELECT 1 FROM dbo.Roles WHERE RoleKey='PrintingAdmin')
 INSERT dbo.Roles(RoleKey,RoleName,DisplayName,AccessLevelId,Description,IsSystemRole,IsProtected,IsActive,CreatedAt) VALUES('PrintingAdmin','Printing Admin','Printing Admin',@OperationalAccessLevel,'Printing operations administrator',1,0,1,GETDATE());
IF NOT EXISTS(SELECT 1 FROM dbo.Roles WHERE RoleKey='ITAdmin')
 INSERT dbo.Roles(RoleKey,RoleName,DisplayName,AccessLevelId,Description,IsSystemRole,IsProtected,IsActive,CreatedAt) VALUES('ITAdmin','IT Admin','IT Admin',@OperationalAccessLevel,'IT operations administrator',1,0,1,GETDATE());

-- Administrative roles receive platform permissions; operational roles receive only their module permissions.
INSERT dbo.RolePermissions(RoleId,PermissionId,IsAllowed,CreatedAt)
SELECT r.RoleId,p.PermissionId,1,GETDATE() FROM dbo.Roles r CROSS JOIN dbo.Permissions p
WHERE r.RoleKey IN('SuperAdmin','PlatformAdmin') AND p.ModuleId IN(@PlatformModule,@UserModule,@PrintingModule,@ItModule,@SchoolModule)
AND NOT EXISTS(SELECT 1 FROM dbo.RolePermissions x WHERE x.RoleId=r.RoleId AND x.PermissionId=p.PermissionId);
INSERT dbo.RolePermissions(RoleId,PermissionId,IsAllowed,CreatedAt)
SELECT r.RoleId,p.PermissionId,1,GETDATE() FROM dbo.Roles r JOIN dbo.Permissions p ON p.ModuleId=CASE r.RoleKey WHEN 'PrintingAdmin' THEN @PrintingModule WHEN 'ITAdmin' THEN @ItModule END
WHERE r.RoleKey IN('PrintingAdmin','ITAdmin') AND NOT EXISTS(SELECT 1 FROM dbo.RolePermissions x WHERE x.RoleId=r.RoleId AND x.PermissionId=p.PermissionId);

-- Remove only read-only grants introduced by the earlier cleanup draft; Admin is not authorized for /super-admin routes.
DELETE rp FROM dbo.RolePermissions rp JOIN dbo.Roles r ON r.RoleId=rp.RoleId JOIN dbo.Permissions p ON p.PermissionId=rp.PermissionId
WHERE r.RoleKey='Admin' AND p.PermissionKey IN('users.view','roles.view','permissions.view','permission-groups.view','role-permissions.view','access-levels.view','assignment-types.view','user-assignments.view','user-permission-overrides.view');

-- Add missing implemented manager menus while retaining existing IDs where present.
DECLARE @Menus TABLE(MenuKey nvarchar(100),MenuName nvarchar(150),Route nvarchar(150),Icon nvarchar(100),ModuleId int,PermissionKey nvarchar(100),GroupKey nvarchar(100),SortOrder int);
INSERT @Menus VALUES
('MAIN_DASHBOARD','Dashboard','/super-admin/dashboard','dashboard',@PlatformModule,NULL,'MAIN',10),
('MODULE_MANAGER','Module Manager','/super-admin/modules','apps',@PlatformModule,NULL,'PLATFORM_FOUNDATION',10),
('MENU_MANAGER','Menu Manager','/super-admin/menus','menu',@PlatformModule,NULL,'PLATFORM_FOUNDATION',20),
('NAVIGATION_MANAGER','Navigation Manager','/super-admin/navigation-manager','account_tree',@PlatformModule,NULL,'PLATFORM_FOUNDATION',30),
('BUTTON_MANAGER','Button Manager','/super-admin/buttons','touch_app',@PlatformModule,NULL,'PLATFORM_FOUNDATION',40),
('WIDGET_MANAGER','Widget Manager','/super-admin/widgets','widgets',@PlatformModule,NULL,'PLATFORM_FOUNDATION',50),
('FEATURE_FLAGS','Feature Flags','/super-admin/feature-flags','flag',@PlatformModule,NULL,'PLATFORM_FOUNDATION',60),
('SYSTEM_SETTINGS','System Settings','/super-admin/settings','settings',@PlatformModule,NULL,'PLATFORM_FOUNDATION',70),
('AUDIT_LOGS','Audit Logs','/super-admin/audit-logs','history',@PlatformModule,NULL,'PLATFORM_FOUNDATION',80),
('USERS','Users','/super-admin/users','people',@UserModule,'users.view','USER_ACCESS',10),
('ROLES','Roles','/super-admin/roles','shield',@UserModule,'roles.view','USER_ACCESS',20),
('PERMISSIONS','Permissions','/super-admin/permissions','security',@UserModule,'permissions.view','USER_ACCESS',30),
('PERMISSION_GROUPS','Permission Groups','/super-admin/permission-groups','folder_shared',@UserModule,'permission-groups.view','USER_ACCESS',40),
('ROLE_PERMISSIONS','Role Permissions','/super-admin/role-permissions','policy',@UserModule,'role-permissions.view','USER_ACCESS',50),
('ACCESS_LEVELS','Access Levels','/super-admin/access-levels','admin_panel_settings',@UserModule,'access-levels.view','USER_ACCESS',60),
('ASSIGNMENT_TYPES','Assignment Types','/super-admin/assignment-types','assignment',@UserModule,'assignment-types.view','USER_ACCESS',70),
('USER_ASSIGNMENTS','User Assignments','/super-admin/user-assignments','hub',@UserModule,'user-assignments.view','USER_ACCESS',80),
('USER_PERMISSION_OVERRIDES','User Permission Overrides','/super-admin/user-permission-overrides','manage_accounts',@UserModule,'user-permission-overrides.view','USER_ACCESS',90),
('BRANDING_THEME','Branding & Theme','/system/branding','palette',@SchoolModule,NULL,'SCHOOL_CONFIGURATION',10),
('IT_DASHBOARD','Dashboard','/it-assets/dashboard','dashboard',@ItModule,'it_assets.dashboard.view','IT_OPERATIONS',10),
('IT_ASSET_MANAGEMENT','Asset Management','/it-assets/assets','devices',@ItModule,'it_assets.assets.view','IT_OPERATIONS',20),
('IT_ASSET_TAG_PRINTER','Asset Tag Printer','/it-assets/asset-tag-printer','qr_code',@ItModule,'it_assets.tags.print','IT_OPERATIONS',30),
('IT_ASSIGNMENTS','Assignments','/it-assets/assignments','assignment_ind',@ItModule,'it_assets.assignment.manage','IT_OPERATIONS',40),
('IT_BORROW_RETURN','Borrow & Return','/it-assets/borrow','laptop_chromebook',@ItModule,'it_assets.borrow.manage','IT_OPERATIONS',50),
('IT_TRANSFERS','Transfers','/it-assets/transfers','swap_horiz',@ItModule,'it_assets.transfer.manage','IT_OPERATIONS',60),
('IT_ISSUES','Issues','/it-assets/issues','report_problem',@ItModule,'it_assets.issues.manage','IT_OPERATIONS',70),
('IT_MAINTENANCE','Maintenance','/it-assets/maintenance','build',@ItModule,'it_assets.maintenance.manage','IT_OPERATIONS',80),
('IT_DISPOSALS','Disposals','/it-assets/disposals','delete_outline',@ItModule,'it_assets.disposal.manage','IT_OPERATIONS',90),
('IT_REPORTS','Reports','/it-assets/reports','assessment',@ItModule,'it_assets.reports.view','IT_OPERATIONS',100),
('PRINTING_DASHBOARD','Dashboard','/printing/dashboard','dashboard',@PrintingModule,'printing.dashboard.view','PRINTING_MANAGEMENT',10),
('PAPER_INVENTORY','Paper Stock','/printing/paper-stock','inventory_2',@PrintingModule,'printing.inventory.view','PRINTING_MANAGEMENT',20),
('PRINTING_INVENTORY_TRANSACTIONS','Inventory Transactions','/printing/inventory-transactions','receipt_long',@PrintingModule,'printing.inventory.view','PRINTING_MANAGEMENT',30),
('PAPER_PURCHASES','Purchases','/printing/purchases','shopping_cart',@PrintingModule,'printing.purchases.view','PRINTING_MANAGEMENT',40),
('PRINTING_DISTRIBUTIONS','Distributions','/printing/distributions','local_shipping',@PrintingModule,'printing.distributions.view','PRINTING_MANAGEMENT',50),
('PRINTING_USER_MANAGEMENT','User Management','/printing/user-management','people',@PrintingModule,'users.view','PRINTING_MANAGEMENT',60),
('PRINTING_MASTER_DATA','Master Data','/printing/master-data','settings',@PrintingModule,'printing.master-data.view','PRINTING_MANAGEMENT',70),
('PRINTING_ACCESS_LEVELS','Access Levels','/printing/access-levels','admin_panel_settings',@PrintingModule,'printing.access-levels.view','PRINTING_MANAGEMENT',80);

INSERT dbo.Menus(WorkspaceId,ModuleId,ParentMenuId,MenuKey,MenuName,Route,Icon,PermissionId,FeatureFlagId,BadgeQueryKey,VisibilityStatusId,IsPinned,IsCollapsible,SortOrder,CreatedAt)
SELECT @Workspace,x.ModuleId,NULL,x.MenuKey,x.MenuName,x.Route,x.Icon,p.PermissionId,NULL,NULL,@Enabled,0,0,x.SortOrder,GETDATE()
FROM @Menus x LEFT JOIN dbo.Permissions p ON p.PermissionKey=x.PermissionKey WHERE NOT EXISTS(SELECT 1 FROM dbo.Menus m WHERE m.MenuKey=x.MenuKey);

-- Hide every menu first, then enable and normalize only supported entries.
UPDATE dbo.Menus SET VisibilityStatusId=@Hidden,BadgeQueryKey=NULL,UpdatedAt=GETDATE();
UPDATE m SET m.ModuleId=x.ModuleId,m.ParentMenuId=NULL,m.MenuName=x.MenuName,m.Route=x.Route,m.Icon=x.Icon,m.PermissionId=p.PermissionId,m.SortOrder=x.SortOrder,m.VisibilityStatusId=@Enabled,m.BadgeQueryKey=NULL,m.UpdatedAt=GETDATE()
FROM dbo.Menus m JOIN @Menus x ON x.MenuKey=m.MenuKey LEFT JOIN dbo.Permissions p ON p.PermissionKey=x.PermissionKey;

-- Rebuild group membership using only enabled, root-level supported records.
DELETE FROM dbo.MenuGroupItems;
INSERT dbo.MenuGroupItems(MenuGroupId,MenuId,SortOrder)
SELECT g.MenuGroupId,m.MenuId,x.SortOrder FROM @Menus x JOIN dbo.Menus m ON m.MenuKey=x.MenuKey JOIN dbo.MenuGroups g ON g.GroupKey=x.GroupKey;

COMMIT TRANSACTION;
