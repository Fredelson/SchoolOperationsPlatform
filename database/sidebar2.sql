USE OperationsPlatformDB;
GO

DECLARE @WorkspaceId INT;
DECLARE @EnabledStatusId INT;
DECLARE @SuperAdminModuleId INT;

SELECT TOP (1) @WorkspaceId = WorkspaceId
FROM dbo.Workspaces
ORDER BY WorkspaceId;

SELECT @EnabledStatusId = VisibilityStatusId
FROM dbo.FeatureVisibilityStatuses
WHERE StatusKey = 'Enabled';

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

DECLARE @AssetManagementMenuId INT;
DECLARE @AssignmentMenuId INT;
DECLARE @MaintenanceMenuId INT;
DECLARE @MasterDataMenuId INT;
DECLARE @ReportsMenuId INT;

SELECT @AssetManagementMenuId = MenuId
FROM dbo.Menus
WHERE MenuKey = 'IT_ASSETS_ASSET_MANAGEMENT';

SELECT @AssignmentMenuId = MenuId
FROM dbo.Menus
WHERE MenuKey = 'IT_ASSETS_ASSIGNMENTS';

SELECT @MaintenanceMenuId = MenuId
FROM dbo.Menus
WHERE MenuKey = 'IT_ASSETS_MAINTENANCE';

SELECT @MasterDataMenuId = MenuId
FROM dbo.Menus
WHERE MenuKey = 'IT_ASSETS_MASTER_DATA';

SELECT @ReportsMenuId = MenuId
FROM dbo.Menus
WHERE MenuKey = 'IT_ASSETS_REPORTS';

-- ============================================
-- ASSET MANAGEMENT CHILDREN
-- ============================================

INSERT INTO dbo.Menus
(
    WorkspaceId, ModuleId, ParentMenuId,
    MenuKey, MenuName, Route, Icon,
    VisibilityStatusId, IsPinned, IsCollapsible,
    SortOrder, CreatedAt, UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssetManagementMenuId,
       'IT_ASSETS_ALL_ASSETS', 'All Assets', '/super-admin/it-assets/assets/all', 'dot',
       @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_ALL_ASSETS');

INSERT INTO dbo.Menus
(
    WorkspaceId, ModuleId, ParentMenuId,
    MenuKey, MenuName, Route, Icon,
    VisibilityStatusId, IsPinned, IsCollapsible,
    SortOrder, CreatedAt, UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssetManagementMenuId,
       'IT_ASSETS_COMPUTERS', 'Computers', '/super-admin/it-assets/assets/computers', 'dot',
       @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_COMPUTERS');

INSERT INTO dbo.Menus
(
    WorkspaceId, ModuleId, ParentMenuId,
    MenuKey, MenuName, Route, Icon,
    VisibilityStatusId, IsPinned, IsCollapsible,
    SortOrder, CreatedAt, UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssetManagementMenuId,
       'IT_ASSETS_PRINTERS_COPIERS', 'Printers & Copiers', '/super-admin/it-assets/assets/printers-copiers', 'dot',
       @EnabledStatusId, 0, 0, 30, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_PRINTERS_COPIERS');

INSERT INTO dbo.Menus
(
    WorkspaceId, ModuleId, ParentMenuId,
    MenuKey, MenuName, Route, Icon,
    VisibilityStatusId, IsPinned, IsCollapsible,
    SortOrder, CreatedAt, UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssetManagementMenuId,
       'IT_ASSETS_PROJECTORS', 'Projectors', '/super-admin/it-assets/assets/projectors', 'dot',
       @EnabledStatusId, 0, 0, 40, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_PROJECTORS');

INSERT INTO dbo.Menus
(
    WorkspaceId, ModuleId, ParentMenuId,
    MenuKey, MenuName, Route, Icon,
    VisibilityStatusId, IsPinned, IsCollapsible,
    SortOrder, CreatedAt, UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssetManagementMenuId,
       'IT_ASSETS_NETWORK_DEVICES', 'Network Devices', '/super-admin/it-assets/assets/network-devices', 'dot',
       @EnabledStatusId, 0, 0, 50, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_NETWORK_DEVICES');

INSERT INTO dbo.Menus
(
    WorkspaceId, ModuleId, ParentMenuId,
    MenuKey, MenuName, Route, Icon,
    VisibilityStatusId, IsPinned, IsCollapsible,
    SortOrder, CreatedAt, UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssetManagementMenuId,
       'IT_ASSETS_CCTV_CAMERAS', 'CCTV Cameras', '/super-admin/it-assets/assets/cctv-cameras', 'dot',
       @EnabledStatusId, 0, 0, 60, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_CCTV_CAMERAS');

INSERT INTO dbo.Menus
(
    WorkspaceId, ModuleId, ParentMenuId,
    MenuKey, MenuName, Route, Icon,
    VisibilityStatusId, IsPinned, IsCollapsible,
    SortOrder, CreatedAt, UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssetManagementMenuId,
       'IT_ASSETS_IP_PHONES', 'IP Phones', '/super-admin/it-assets/assets/ip-phones', 'dot',
       @EnabledStatusId, 0, 0, 70, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_IP_PHONES');

INSERT INTO dbo.Menus
(
    WorkspaceId, ModuleId, ParentMenuId,
    MenuKey, MenuName, Route, Icon,
    VisibilityStatusId, IsPinned, IsCollapsible,
    SortOrder, CreatedAt, UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssetManagementMenuId,
       'IT_ASSETS_LED_SCREENS', 'LED Screens', '/super-admin/it-assets/assets/led-screens', 'dot',
       @EnabledStatusId, 0, 0, 80, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_LED_SCREENS');

INSERT INTO dbo.Menus
(
    WorkspaceId, ModuleId, ParentMenuId,
    MenuKey, MenuName, Route, Icon,
    VisibilityStatusId, IsPinned, IsCollapsible,
    SortOrder, CreatedAt, UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssetManagementMenuId,
       'IT_ASSETS_TABLETS', 'Tablets', '/super-admin/it-assets/assets/tablets', 'dot',
       @EnabledStatusId, 0, 0, 90, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_TABLETS');

INSERT INTO dbo.Menus
(
    WorkspaceId, ModuleId, ParentMenuId,
    MenuKey, MenuName, Route, Icon,
    VisibilityStatusId, IsPinned, IsCollapsible,
    SortOrder, CreatedAt, UpdatedAt
)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssetManagementMenuId,
       'IT_ASSETS_CLASSROOM_AUDIO', 'Classroom Audio', '/super-admin/it-assets/assets/classroom-audio', 'dot',
       @EnabledStatusId, 0, 0, 100, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_CLASSROOM_AUDIO');

-- ============================================
-- ASSIGNMENT CHILDREN
-- ============================================

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssignmentMenuId, 'IT_ASSETS_CURRENT_ASSIGNMENTS', 'Current Assignments', '/super-admin/it-assets/assignments/current', 'dot', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_CURRENT_ASSIGNMENTS');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssignmentMenuId, 'IT_ASSETS_TRANSFER_REQUESTS', 'Transfer Requests', '/super-admin/it-assets/assignments/transfers', 'dot', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_TRANSFER_REQUESTS');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssignmentMenuId, 'IT_ASSETS_NEEDED_LAPTOPS', 'Needed Laptops', '/super-admin/it-assets/assignments/needed-laptops', 'dot', @EnabledStatusId, 0, 0, 30, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_NEEDED_LAPTOPS');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @AssignmentMenuId, 'IT_ASSETS_ASSIGNMENT_HISTORY', 'Assignment History', '/super-admin/it-assets/assignments/history', 'dot', @EnabledStatusId, 0, 0, 40, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_ASSIGNMENT_HISTORY');

-- ============================================
-- MAINTENANCE CHILDREN
-- ============================================

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @MaintenanceMenuId, 'IT_ASSETS_ISSUES', 'Issues', '/super-admin/it-assets/maintenance/issues', 'dot', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_ISSUES');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @MaintenanceMenuId, 'IT_ASSETS_MAINTENANCE_LOGS', 'Maintenance Logs', '/super-admin/it-assets/maintenance/logs', 'dot', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_MAINTENANCE_LOGS');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @MaintenanceMenuId, 'IT_ASSETS_MAINTENANCE_SCHEDULE', 'Maintenance Schedule', '/super-admin/it-assets/maintenance/schedule', 'dot', @EnabledStatusId, 0, 0, 30, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_MAINTENANCE_SCHEDULE');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @MaintenanceMenuId, 'IT_ASSETS_DISPOSAL', 'Disposal', '/super-admin/it-assets/maintenance/disposal', 'dot', @EnabledStatusId, 0, 0, 40, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_DISPOSAL');

-- ============================================
-- MASTER DATA CHILDREN
-- ============================================

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @MasterDataMenuId, 'IT_ASSETS_CATEGORIES', 'Categories', '/super-admin/it-assets/master-data/categories', 'dot', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_CATEGORIES');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @MasterDataMenuId, 'IT_ASSETS_BRANDS', 'Brands', '/super-admin/it-assets/master-data/brands', 'dot', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_BRANDS');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @MasterDataMenuId, 'IT_ASSETS_MODELS', 'Models', '/super-admin/it-assets/master-data/models', 'dot', @EnabledStatusId, 0, 0, 30, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_MODELS');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @MasterDataMenuId, 'IT_ASSETS_STATUSES', 'Statuses', '/super-admin/it-assets/master-data/statuses', 'dot', @EnabledStatusId, 0, 0, 40, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_STATUSES');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @MasterDataMenuId, 'IT_ASSETS_CONDITIONS', 'Conditions', '/super-admin/it-assets/master-data/conditions', 'dot', @EnabledStatusId, 0, 0, 50, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_CONDITIONS');

-- ============================================
-- REPORT CHILDREN
-- ============================================

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @ReportsMenuId, 'IT_ASSETS_REPORT_INVENTORY', 'Inventory', '/super-admin/it-assets/reports/inventory', 'dot', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_REPORT_INVENTORY');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @ReportsMenuId, 'IT_ASSETS_REPORT_ASSIGNMENT', 'Assignment', '/super-admin/it-assets/reports/assignment', 'dot', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_REPORT_ASSIGNMENT');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @ReportsMenuId, 'IT_ASSETS_REPORT_MAINTENANCE', 'Maintenance', '/super-admin/it-assets/reports/maintenance', 'dot', @EnabledStatusId, 0, 0, 30, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_REPORT_MAINTENANCE');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @ReportsMenuId, 'IT_ASSETS_REPORT_ISSUES', 'Issues', '/super-admin/it-assets/reports/issues', 'dot', @EnabledStatusId, 0, 0, 40, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_REPORT_ISSUES');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
SELECT @WorkspaceId, @SuperAdminModuleId, @ReportsMenuId, 'IT_ASSETS_REPORT_DISPOSAL', 'Disposal', '/super-admin/it-assets/reports/disposal', 'dot', @EnabledStatusId, 0, 0, 50, GETDATE(), GETDATE()
WHERE NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_REPORT_DISPOSAL');

SELECT 'IT Asset nested sidebar menus seeded.' AS Message;