SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

DECLARE @EnabledStatusId int = (
    SELECT TOP 1 VisibilityStatusId
    FROM dbo.FeatureVisibilityStatuses
    WHERE LOWER(StatusKey) = 'enabled'
);
DECLARE @SchoolModuleId int = (
    SELECT TOP 1 ModuleId
    FROM dbo.Modules
    WHERE ModuleKey = 'school_configuration'
);
DECLARE @PrintingModuleId int = (
    SELECT TOP 1 ModuleId
    FROM dbo.Modules
    WHERE ModuleKey IN ('printing', 'printing_management')
       OR ModuleName IN ('Printing', 'Printing Management')
    ORDER BY CASE WHEN ModuleKey = 'printing' THEN 0 ELSE 1 END
);
DECLARE @SchoolRootId int = (
    SELECT TOP 1 MenuId
    FROM dbo.Menus
    WHERE MenuKey = 'SCHOOL_CONFIGURATION_ROOT'
);
DECLARE @AccessLevelPermissionId int = (
    SELECT TOP 1 PermissionId
    FROM dbo.Permissions
    WHERE PermissionKey = 'access-levels.view'
);
DECLARE @PrintingMasterPermissionId int = (
    SELECT TOP 1 PermissionId
    FROM dbo.Permissions
    WHERE PermissionKey = 'printing.master-data.view'
);

IF @EnabledStatusId IS NULL
   OR @SchoolModuleId IS NULL
   OR @PrintingModuleId IS NULL
   OR @SchoolRootId IS NULL
BEGIN
    THROW 51000, 'Required navigation records were not found.', 1;
END;

UPDATE dbo.Menus
SET ModuleId = @SchoolModuleId,
    ParentMenuId = @SchoolRootId,
    Route = CASE MenuKey
        WHEN 'SUBJECTS' THEN '/super-admin/school-configuration/subjects'
        WHEN 'DEPARTMENTS' THEN '/super-admin/school-configuration/departments'
        WHEN 'SECTIONS' THEN '/super-admin/school-configuration/sections'
        WHEN 'ACCESS_LEVELS' THEN '/super-admin/school-configuration/access-levels'
    END,
    VisibilityStatusId = @EnabledStatusId,
    SortOrder = CASE MenuKey
        WHEN 'SUBJECTS' THEN 20
        WHEN 'DEPARTMENTS' THEN 30
        WHEN 'SECTIONS' THEN 40
        WHEN 'ACCESS_LEVELS' THEN 50
    END,
    UpdatedAt = GETDATE()
WHERE MenuKey IN ('SUBJECTS', 'DEPARTMENTS', 'SECTIONS', 'ACCESS_LEVELS');

UPDATE dbo.Menus
SET VisibilityStatusId = @EnabledStatusId,
    UpdatedAt = GETDATE()
WHERE MenuId = @SchoolRootId;

UPDATE dbo.Menus
SET ModuleId = @PrintingModuleId,
    ParentMenuId = NULL,
    MenuName = 'Purposes',
    Route = '/printing/purposes',
    Icon = 'fact_check',
    PermissionId = @PrintingMasterPermissionId,
    VisibilityStatusId = @EnabledStatusId,
    SortOrder = 70,
    UpdatedAt = GETDATE()
WHERE MenuKey IN ('PURPOSES', 'PRINTING_MASTER_DATA');

IF NOT EXISTS (
    SELECT 1
    FROM dbo.Menus
    WHERE MenuKey = 'PRINTING_PURPOSES'
)
BEGIN
    UPDATE dbo.Menus
    SET MenuKey = 'PRINTING_PURPOSES'
    WHERE MenuKey = 'PRINTING_MASTER_DATA';
END;

UPDATE dbo.Menus
SET ModuleId = @SchoolModuleId,
    ParentMenuId = @SchoolRootId,
    MenuName = 'Access Levels',
    Route = '/super-admin/school-configuration/access-levels',
    Icon = 'admin_panel_settings',
    PermissionId = @AccessLevelPermissionId,
    VisibilityStatusId = @EnabledStatusId,
    SortOrder = 50,
    UpdatedAt = GETDATE()
WHERE MenuKey = 'PRINTING_ACCESS_LEVELS';

UPDATE wm
SET GroupKey = 'SCHOOL_CONFIGURATION',
    GroupName = 'School Configuration',
    GroupSortOrder = 40,
    ParentMenuId = CASE
        WHEN m.MenuKey = 'SCHOOL_CONFIGURATION_ROOT' THEN NULL
        ELSE @SchoolRootId
    END,
    IsVisible = 1,
    IsEnabled = 1,
    SortOrder = CASE m.MenuKey
        WHEN 'SCHOOL_CONFIGURATION_ROOT' THEN 10
        WHEN 'SUBJECTS' THEN 20
        WHEN 'DEPARTMENTS' THEN 30
        WHEN 'SECTIONS' THEN 40
        WHEN 'ACCESS_LEVELS' THEN 50
        ELSE wm.SortOrder
    END,
    UpdatedAt = GETDATE()
FROM dbo.WorkspaceMenus wm
INNER JOIN dbo.Menus m ON m.MenuId = wm.MenuId
WHERE m.MenuKey IN (
    'SCHOOL_CONFIGURATION_ROOT',
    'SUBJECTS',
    'DEPARTMENTS',
    'SECTIONS',
    'ACCESS_LEVELS'
);

UPDATE wm
SET IsVisible = 0,
    IsEnabled = 0,
    UpdatedAt = GETDATE()
FROM dbo.WorkspaceMenus wm
INNER JOIN dbo.Menus m ON m.MenuId = wm.MenuId
WHERE m.MenuKey = 'PRINTING_ACCESS_LEVELS';

UPDATE wm
SET GroupKey = 'PRINTING_MANAGEMENT',
    GroupName = 'Printing Management',
    GroupSortOrder = 60,
    ParentMenuId = NULL,
    IsVisible = 1,
    IsEnabled = 1,
    SortOrder = 70,
    UpdatedAt = GETDATE()
FROM dbo.WorkspaceMenus wm
INNER JOIN dbo.Menus m ON m.MenuId = wm.MenuId
WHERE m.MenuKey IN ('PURPOSES', 'PRINTING_PURPOSES', 'PRINTING_MASTER_DATA');

COMMIT TRANSACTION;
