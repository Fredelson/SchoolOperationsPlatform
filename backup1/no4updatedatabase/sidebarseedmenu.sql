USE OperationsPlatformDB;
GO

DECLARE @WorkspaceId INT;
DECLARE @ModuleId INT;
DECLARE @EnabledStatusId INT;
DECLARE @SoonStatusId INT;

SELECT TOP (1) @WorkspaceId = WorkspaceId FROM dbo.Workspaces ORDER BY WorkspaceId;
SELECT TOP (1) @ModuleId = ModuleId FROM dbo.Modules ORDER BY ModuleId;

SELECT @EnabledStatusId = VisibilityStatusId
FROM dbo.FeatureVisibilityStatuses
WHERE StatusKey = 'Enabled';

SELECT @SoonStatusId = VisibilityStatusId
FROM dbo.FeatureVisibilityStatuses
WHERE StatusKey = 'Hidden';

-- =========================
-- MENU GROUPS
-- =========================

INSERT INTO dbo.MenuGroups (WorkspaceId, GroupKey, GroupName, Icon, VisibilityStatusId, SortOrder, CreatedAt, UpdatedAt)
VALUES
(@WorkspaceId, 'MAIN', 'Main', NULL, @EnabledStatusId, 10, GETDATE(), GETDATE()),
(@WorkspaceId, 'ORGANIZATION', 'Organization', NULL, @EnabledStatusId, 20, GETDATE(), GETDATE()),
(@WorkspaceId, 'IDENTITY_ACCESS', 'Identity & Access', NULL, @EnabledStatusId, 30, GETDATE(), GETDATE()),
(@WorkspaceId, 'OPERATIONS', 'Operations', NULL, @EnabledStatusId, 40, GETDATE(), GETDATE()),
(@WorkspaceId, 'SYSTEM_CONFIGURATION', 'System Configuration', NULL, @EnabledStatusId, 50, GETDATE(), GETDATE()),
(@WorkspaceId, 'SECURITY', 'Security', NULL, @EnabledStatusId, 60, GETDATE(), GETDATE()),
(@WorkspaceId, 'REPORTS_ANALYTICS', 'Reports & Analytics', NULL, @EnabledStatusId, 70, GETDATE(), GETDATE()),
(@WorkspaceId, 'DEVELOPER_PLATFORM', 'Developer / Platform', NULL, @EnabledStatusId, 80, GETDATE(), GETDATE());

-- =========================
-- ROOT MENUS
-- =========================

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
VALUES
(@WorkspaceId, @ModuleId, NULL, 'DASHBOARD', 'Dashboard', '/super-admin/dashboard', 'dashboard', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()),

(@WorkspaceId, @ModuleId, NULL, 'ORGANIZATION_PROFILE', 'Organization Profile', '/super-admin/organization/profile', 'business', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'BRANDING_THEME', 'Branding & Theme', '/super-admin/branding', 'palette', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()),

(@WorkspaceId, @ModuleId, NULL, 'USERS', 'Users', '/super-admin/users', 'people', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'ROLES', 'Roles', '/super-admin/roles', 'shield', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'ACCESS_LEVELS', 'Access Levels', '/super-admin/access-levels', 'admin', @EnabledStatusId, 0, 0, 30, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'ASSIGNMENT_TYPES', 'Assignment Types', '/super-admin/assignment-types', 'assignment', @EnabledStatusId, 0, 0, 40, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'USER_ASSIGNMENTS', 'User Assignments', '/super-admin/user-assignments', 'hub', @EnabledStatusId, 0, 0, 50, GETDATE(), GETDATE()),

(@WorkspaceId, @ModuleId, NULL, 'PRINTING', 'Printing', '/super-admin/printing', 'print', @SoonStatusId, 0, 0, 10, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'IT_ASSET_MANAGEMENT', 'IT Asset Management', '/super-admin/it-assets', 'computer', @EnabledStatusId, 0, 1, 20, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'IT_HELP_DESK', 'IT Help Desk', '/super-admin/helpdesk', 'ticket', @SoonStatusId, 0, 0, 30, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'INVENTORY', 'Inventory', '/super-admin/inventory', 'inventory', @SoonStatusId, 0, 0, 40, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'HR', 'HR', '/super-admin/hr', 'people', @SoonStatusId, 0, 0, 50, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'ACADEMIC_OPERATIONS', 'Academic Operations', '/super-admin/academic', 'school', @SoonStatusId, 0, 0, 60, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'COMMUNICATION', 'Communication', '/super-admin/communication', 'campaign', @SoonStatusId, 0, 0, 70, GETDATE(), GETDATE()),

(@WorkspaceId, @ModuleId, NULL, 'DEPARTMENTS', 'Departments', '/super-admin/settings/departments', 'settings', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'SECTIONS', 'Sections', '/super-admin/settings/sections', 'settings', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'SUBJECTS', 'Subjects', '/super-admin/settings/subjects', 'settings', @EnabledStatusId, 0, 0, 30, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'PURPOSES', 'Purposes', '/super-admin/settings/purposes', 'settings', @EnabledStatusId, 0, 0, 40, GETDATE(), GETDATE()),

(@WorkspaceId, @ModuleId, NULL, 'AUDIT_LOGS', 'Audit Logs', '/super-admin/security/audit-logs', 'security', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'PLATFORM_REPORTS', 'Platform Reports', '/super-admin/reports', 'reports', @SoonStatusId, 0, 0, 10, GETDATE(), GETDATE()),

(@WorkspaceId, @ModuleId, NULL, 'MODULE_MANAGER', 'Module Manager', '/super-admin/platform/modules', 'developer', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, NULL, 'SYSTEM_HEALTH', 'System Health', '/super-admin/platform/system-health', 'search', @SoonStatusId, 0, 0, 20, GETDATE(), GETDATE());

-- =========================
-- IT ASSET CHILDREN
-- =========================

DECLARE @ITAssetId INT = (SELECT MenuId FROM dbo.Menus WHERE MenuKey = 'IT_ASSET_MANAGEMENT');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
VALUES
(@WorkspaceId, @ModuleId, @ITAssetId, 'IT_ASSETS_DASHBOARD', 'Dashboard', '/super-admin/it-assets/dashboard', 'dashboard', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @ITAssetId, 'IT_ASSETS_ASSET_MANAGEMENT', 'Asset Management', '/super-admin/it-assets/assets', 'devices', @EnabledStatusId, 0, 1, 20, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @ITAssetId, 'IT_ASSETS_ASSIGNMENT', 'Asset Assignment', '/super-admin/it-assets/assignments', 'assignment', @EnabledStatusId, 0, 1, 30, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @ITAssetId, 'IT_ASSETS_MAINTENANCE', 'Asset Maintenance', '/super-admin/it-assets/maintenance', 'build', @EnabledStatusId, 0, 1, 40, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @ITAssetId, 'IT_ASSETS_IMPORT', 'Import Assets', '/super-admin/it-assets/import', 'upload', @EnabledStatusId, 0, 0, 50, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @ITAssetId, 'IT_ASSETS_GROUPS', 'Asset Groups', '/super-admin/it-assets/groups', 'groups', @EnabledStatusId, 0, 0, 60, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @ITAssetId, 'IT_ASSETS_MASTER_DATA', 'Master Data', '/super-admin/it-assets/master-data', 'category', @EnabledStatusId, 0, 1, 70, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @ITAssetId, 'IT_ASSETS_REPORTS', 'Reports', '/super-admin/it-assets/reports', 'reports', @EnabledStatusId, 0, 1, 80, GETDATE(), GETDATE());

-- =========================
-- THIRD LEVEL CHILDREN
-- =========================

DECLARE @AssetMgmtId INT = (SELECT MenuId FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_ASSET_MANAGEMENT');
DECLARE @AssignmentId INT = (SELECT MenuId FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_ASSIGNMENT');
DECLARE @MaintenanceId INT = (SELECT MenuId FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_MAINTENANCE');
DECLARE @MasterDataId INT = (SELECT MenuId FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_MASTER_DATA');
DECLARE @ReportsId INT = (SELECT MenuId FROM dbo.Menus WHERE MenuKey = 'IT_ASSETS_REPORTS');

INSERT INTO dbo.Menus
(WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
VALUES
(@WorkspaceId, @ModuleId, @AssetMgmtId, 'IT_ASSETS_ALL', 'All Assets', '/super-admin/it-assets/assets/all', 'dot', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @AssetMgmtId, 'IT_ASSETS_COMPUTERS', 'Computers', '/super-admin/it-assets/assets/computers', 'dot', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @AssetMgmtId, 'IT_ASSETS_PRINTERS_COPIERS', 'Printers & Copiers', '/super-admin/it-assets/assets/printers-copiers', 'dot', @EnabledStatusId, 0, 0, 30, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @AssetMgmtId, 'IT_ASSETS_PROJECTORS', 'Projectors', '/super-admin/it-assets/assets/projectors', 'dot', @EnabledStatusId, 0, 0, 40, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @AssetMgmtId, 'IT_ASSETS_NETWORK_DEVICES', 'Network Devices', '/super-admin/it-assets/assets/network-devices', 'dot', @EnabledStatusId, 0, 0, 50, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @AssetMgmtId, 'IT_ASSETS_CCTV_CAMERAS', 'CCTV Cameras', '/super-admin/it-assets/assets/cctv-cameras', 'dot', @EnabledStatusId, 0, 0, 60, GETDATE(), GETDATE()),

(@WorkspaceId, @ModuleId, @AssignmentId, 'IT_ASSETS_CURRENT_ASSIGNMENTS', 'Current Assignments', '/super-admin/it-assets/assignments/current', 'dot', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @AssignmentId, 'IT_ASSETS_TRANSFER_REQUESTS', 'Transfer Requests', '/super-admin/it-assets/assignments/transfers', 'dot', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @AssignmentId, 'IT_ASSETS_NEEDED_LAPTOPS', 'Needed Laptops', '/super-admin/it-assets/assignments/needed-laptops', 'dot', @EnabledStatusId, 0, 0, 30, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @AssignmentId, 'IT_ASSETS_ASSIGNMENT_HISTORY', 'Assignment History', '/super-admin/it-assets/assignments/history', 'dot', @EnabledStatusId, 0, 0, 40, GETDATE(), GETDATE()),

(@WorkspaceId, @ModuleId, @MaintenanceId, 'IT_ASSETS_ISSUES', 'Issues', '/super-admin/it-assets/maintenance/issues', 'dot', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @MaintenanceId, 'IT_ASSETS_MAINTENANCE_LOGS', 'Maintenance Logs', '/super-admin/it-assets/maintenance/logs', 'dot', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @MaintenanceId, 'IT_ASSETS_MAINTENANCE_SCHEDULE', 'Maintenance Schedule', '/super-admin/it-assets/maintenance/schedule', 'dot', @EnabledStatusId, 0, 0, 30, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @MaintenanceId, 'IT_ASSETS_DISPOSAL', 'Disposal', '/super-admin/it-assets/maintenance/disposal', 'dot', @EnabledStatusId, 0, 0, 40, GETDATE(), GETDATE()),

(@WorkspaceId, @ModuleId, @MasterDataId, 'IT_ASSETS_CATEGORIES', 'Categories', '/super-admin/it-assets/master-data/categories', 'dot', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @MasterDataId, 'IT_ASSETS_BRANDS', 'Brands', '/super-admin/it-assets/master-data/brands', 'dot', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @MasterDataId, 'IT_ASSETS_MODELS', 'Models', '/super-admin/it-assets/master-data/models', 'dot', @EnabledStatusId, 0, 0, 30, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @MasterDataId, 'IT_ASSETS_STATUSES', 'Statuses', '/super-admin/it-assets/master-data/statuses', 'dot', @EnabledStatusId, 0, 0, 40, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @MasterDataId, 'IT_ASSETS_CONDITIONS', 'Conditions', '/super-admin/it-assets/master-data/conditions', 'dot', @EnabledStatusId, 0, 0, 50, GETDATE(), GETDATE()),

(@WorkspaceId, @ModuleId, @ReportsId, 'IT_ASSETS_REPORT_INVENTORY', 'Inventory', '/super-admin/it-assets/reports/inventory', 'dot', @EnabledStatusId, 0, 0, 10, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @ReportsId, 'IT_ASSETS_REPORT_ASSIGNMENT', 'Assignment', '/super-admin/it-assets/reports/assignment', 'dot', @EnabledStatusId, 0, 0, 20, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @ReportsId, 'IT_ASSETS_REPORT_MAINTENANCE', 'Maintenance', '/super-admin/it-assets/reports/maintenance', 'dot', @EnabledStatusId, 0, 0, 30, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @ReportsId, 'IT_ASSETS_REPORT_ISSUES', 'Issues', '/super-admin/it-assets/reports/issues', 'dot', @EnabledStatusId, 0, 0, 40, GETDATE(), GETDATE()),
(@WorkspaceId, @ModuleId, @ReportsId, 'IT_ASSETS_REPORT_DISPOSAL', 'Disposal', '/super-admin/it-assets/reports/disposal', 'dot', @EnabledStatusId, 0, 0, 50, GETDATE(), GETDATE());

-- =========================
-- GROUP ASSIGNMENTS
-- =========================

INSERT INTO dbo.MenuGroupItems (MenuGroupId, MenuId, SortOrder)
SELECT g.MenuGroupId, m.MenuId, m.SortOrder
FROM dbo.MenuGroups g
JOIN dbo.Menus m ON
    (g.GroupKey = 'MAIN' AND m.MenuKey IN ('DASHBOARD'))
 OR (g.GroupKey = 'ORGANIZATION' AND m.MenuKey IN ('ORGANIZATION_PROFILE', 'BRANDING_THEME'))
 OR (g.GroupKey = 'IDENTITY_ACCESS' AND m.MenuKey IN ('USERS', 'ROLES', 'ACCESS_LEVELS', 'ASSIGNMENT_TYPES', 'USER_ASSIGNMENTS'))
 OR (g.GroupKey = 'OPERATIONS' AND m.MenuKey IN ('PRINTING', 'IT_ASSET_MANAGEMENT', 'IT_HELP_DESK', 'INVENTORY', 'HR', 'ACADEMIC_OPERATIONS', 'COMMUNICATION'))
 OR (g.GroupKey = 'SYSTEM_CONFIGURATION' AND m.MenuKey IN ('DEPARTMENTS', 'SECTIONS', 'SUBJECTS', 'PURPOSES'))
 OR (g.GroupKey = 'SECURITY' AND m.MenuKey IN ('AUDIT_LOGS'))
 OR (g.GroupKey = 'REPORTS_ANALYTICS' AND m.MenuKey IN ('PLATFORM_REPORTS'))
 OR (g.GroupKey = 'DEVELOPER_PLATFORM' AND m.MenuKey IN ('MODULE_MANAGER', 'SYSTEM_HEALTH'));

SELECT 'Organized sidebar seed completed.' AS Message;