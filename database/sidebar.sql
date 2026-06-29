USE OperationsPlatformDB;
GO

DECLARE @WorkspaceId INT;
DECLARE @EnabledStatusId INT;
DECLARE @HiddenStatusId INT;
DECLARE @SuperAdminModuleId INT;

SELECT TOP (1) @WorkspaceId = WorkspaceId
FROM dbo.Workspaces
ORDER BY WorkspaceId;

SELECT @EnabledStatusId = VisibilityStatusId
FROM dbo.FeatureVisibilityStatuses
WHERE StatusKey = 'Enabled';

SELECT @HiddenStatusId = VisibilityStatusId
FROM dbo.FeatureVisibilityStatuses
WHERE StatusKey = 'Hidden';

SELECT TOP (1) @SuperAdminModuleId = ModuleId
FROM dbo.Modules
WHERE ModuleKey LIKE '%SUPER%'
   OR ModuleName LIKE '%Super%'
ORDER BY ModuleId;

IF @SuperAdminModuleId IS NULL
BEGIN
    SELECT TOP (1) @SuperAdminModuleId = ModuleId
    FROM dbo.Modules
    ORDER BY ModuleId;
END;

-- ============================================
-- MENU GROUPS
-- ============================================

INSERT INTO dbo.MenuGroups
(
    WorkspaceId,
    GroupKey,
    GroupName,
    Icon,
    VisibilityStatusId,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, 'MAIN', 'Main', NULL, @EnabledStatusId, 10, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.MenuGroups WHERE GroupKey = 'MAIN');

INSERT INTO dbo.MenuGroups
(
    WorkspaceId,
    GroupKey,
    GroupName,
    Icon,
    VisibilityStatusId,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, 'ORGANIZATION', 'Organization', NULL, @EnabledStatusId, 20, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.MenuGroups WHERE GroupKey = 'ORGANIZATION');

INSERT INTO dbo.MenuGroups
(
    WorkspaceId,
    GroupKey,
    GroupName,
    Icon,
    VisibilityStatusId,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, 'IDENTITY_ACCESS', 'Identity & Access', NULL, @EnabledStatusId, 30, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.MenuGroups WHERE GroupKey = 'IDENTITY_ACCESS');

INSERT INTO dbo.MenuGroups
(
    WorkspaceId,
    GroupKey,
    GroupName,
    Icon,
    VisibilityStatusId,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, 'OPERATIONS', 'Operations', NULL, @EnabledStatusId, 40, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.MenuGroups WHERE GroupKey = 'OPERATIONS');

INSERT INTO dbo.MenuGroups
(
    WorkspaceId,
    GroupKey,
    GroupName,
    Icon,
    VisibilityStatusId,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, 'SYSTEM_CONFIGURATION', 'System Configuration', NULL, @EnabledStatusId, 50, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.MenuGroups WHERE GroupKey = 'SYSTEM_CONFIGURATION');

INSERT INTO dbo.MenuGroups
(
    WorkspaceId,
    GroupKey,
    GroupName,
    Icon,
    VisibilityStatusId,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, 'SECURITY', 'Security', NULL, @EnabledStatusId, 60, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.MenuGroups WHERE GroupKey = 'SECURITY');

INSERT INTO dbo.MenuGroups
(
    WorkspaceId,
    GroupKey,
    GroupName,
    Icon,
    VisibilityStatusId,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, 'REPORTS_ANALYTICS', 'Reports & Analytics', NULL, @EnabledStatusId, 70, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.MenuGroups WHERE GroupKey = 'REPORTS_ANALYTICS');

INSERT INTO dbo.MenuGroups
(
    WorkspaceId,
    GroupKey,
    GroupName,
    Icon,
    VisibilityStatusId,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, 'DEVELOPER_PLATFORM', 'Developer / Platform', NULL, @EnabledStatusId, 80, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.MenuGroups WHERE GroupKey = 'DEVELOPER_PLATFORM');

-- ============================================
-- ROOT MENUS
-- ============================================

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, NULL, 'SUPER_ADMIN_DASHBOARD', 'Dashboard', '/super-admin/dashboard', 'dashboard', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'SUPER_ADMIN_DASHBOARD');

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, NULL, 'ORGANIZATION_PROFILE', 'Organization Profile', '/super-admin/organization/profile', 'business', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'ORGANIZATION_PROFILE');

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, NULL, 'BRANDING_THEME', 'Branding & Theme', '/super-admin/branding', 'palette', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'BRANDING_THEME');

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, NULL, 'USERS', 'Users', '/super-admin/users', 'people', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'USERS');

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, NULL, 'ROLES', 'Roles', '/super-admin/roles', 'shield', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'ROLES');

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, NULL, 'ACCESS_LEVELS', 'Access Levels', '/super-admin/access-levels', 'admin', @EnabledStatusId, 0, 0, 30, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'ACCESS_LEVELS');

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, NULL, 'IT_ASSET_MANAGEMENT', 'IT Asset Management', '/super-admin/it-assets', 'computer', @EnabledStatusId, 0, 1, 20, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSET_MANAGEMENT');

-- ============================================
-- IT ASSET CHILD MENUS
-- ============================================

DECLARE @ITAssetsMenuId INT;

SELECT @ITAssetsMenuId = MenuId
FROM dbo.Menus
WHERE MenuKey = 'IT_ASSET_MANAGEMENT';

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @ITAssetsMenuId, 'IT_ASSETS_DASHBOARD', 'Dashboard', '/super-admin/it-assets/dashboard', 'dashboard', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_DASHBOARD');

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @ITAssetsMenuId, 'IT_ASSETS_ASSET_MANAGEMENT', 'Asset Management', '/super-admin/it-assets/assets', 'devices', @EnabledStatusId, 0, 1, 20, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_ASSET_MANAGEMENT');

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @ITAssetsMenuId, 'IT_ASSETS_ASSIGNMENTS', 'Asset Assignment', '/super-admin/it-assets/assignments', 'assignment', @EnabledStatusId, 0, 1, 30, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_ASSIGNMENTS');

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @ITAssetsMenuId, 'IT_ASSETS_MAINTENANCE', 'Asset Maintenance', '/super-admin/it-assets/maintenance', 'build', @EnabledStatusId, 0, 1, 40, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_MAINTENANCE');

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @ITAssetsMenuId, 'IT_ASSETS_IMPORT', 'Import Assets', '/super-admin/it-assets/import', 'upload', @EnabledStatusId, 0, 0, 50, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_IMPORT');

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @ITAssetsMenuId, 'IT_ASSETS_MASTER_DATA', 'Master Data', '/super-admin/it-assets/master-data', 'category', @EnabledStatusId, 0, 1, 60, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_MASTER_DATA');

INSERT INTO dbo.Menus
(
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @ITAssetsMenuId, 'IT_ASSETS_REPORTS', 'Reports', '/super-admin/it-assets/reports', 'reports', @EnabledStatusId, 0, 1, 70, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_REPORTS');

-- ============================================
-- GROUP ASSIGNMENTS
-- ============================================

DECLARE @MainGroupId INT = (SELECT MenuGroupId FROM dbo.MenuGroups WHERE GroupKey = 'MAIN');
DECLARE @OrgGroupId INT = (SELECT MenuGroupId FROM dbo.MenuGroups WHERE GroupKey = 'ORGANIZATION');
DECLARE @IdentityGroupId INT = (SELECT MenuGroupId FROM dbo.MenuGroups WHERE GroupKey = 'IDENTITY_ACCESS');
DECLARE @OperationsGroupId INT = (SELECT MenuGroupId FROM dbo.MenuGroups WHERE GroupKey = 'OPERATIONS');

INSERT INTO dbo.MenuGroupItems (MenuGroupId, MenuId, SortOrder)
SELECT @MainGroupId, MenuId, 10
FROM dbo.Menus
WHERE MenuKey = 'SUPER_ADMIN_DASHBOARD'
AND NOT EXISTS (
    SELECT 1 FROM dbo.MenuGroupItems
    WHERE MenuGroupId = @MainGroupId
      AND MenuId = dbo.Menus.MenuId
);

INSERT INTO dbo.MenuGroupItems (MenuGroupId, MenuId, SortOrder)
SELECT @OrgGroupId, MenuId, SortOrder
FROM dbo.Menus
WHERE MenuKey IN ('ORGANIZATION_PROFILE', 'BRANDING_THEME')
AND NOT EXISTS (
    SELECT 1 FROM dbo.MenuGroupItems
    WHERE MenuGroupId = @OrgGroupId
      AND MenuId = dbo.Menus.MenuId
);

INSERT INTO dbo.MenuGroupItems (MenuGroupId, MenuId, SortOrder)
SELECT @IdentityGroupId, MenuId, SortOrder
FROM dbo.Menus
WHERE MenuKey IN ('USERS', 'ROLES', 'ACCESS_LEVELS')
AND NOT EXISTS (
    SELECT 1 FROM dbo.MenuGroupItems
    WHERE MenuGroupId = @IdentityGroupId
      AND MenuId = dbo.Menus.MenuId
);

INSERT INTO dbo.MenuGroupItems (MenuGroupId, MenuId, SortOrder)
SELECT @OperationsGroupId, MenuId, SortOrder
FROM dbo.Menus
WHERE MenuKey = 'IT_ASSET_MANAGEMENT'
AND NOT EXISTS (
    SELECT 1 FROM dbo.MenuGroupItems
    WHERE MenuGroupId = @OperationsGroupId
      AND MenuId = dbo.Menus.MenuId
);

SELECT 'Sidebar seed completed.' AS Message;