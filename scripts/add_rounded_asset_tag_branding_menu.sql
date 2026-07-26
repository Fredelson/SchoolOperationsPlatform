-- ============================================================
-- Restore Rounded Asset Tag Branding in Workspace Manager
-- ============================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

DECLARE @ModuleId int = (
  SELECT TOP 1 ModuleId
  FROM dbo.Modules
  WHERE ModuleKey = N'school_configuration'
    AND IsActive = 1
);

IF @ModuleId IS NULL
BEGIN
  SELECT TOP 1 @ModuleId = ModuleId
  FROM dbo.Modules
  WHERE ModuleKey = N'platform_foundation'
    AND IsActive = 1;
END;

IF @ModuleId IS NULL
  THROW 51000, 'School Configuration or Platform Foundation module was not found.', 1;

DECLARE @EnabledStatusId int = (
  SELECT TOP 1 VisibilityStatusId
  FROM dbo.FeatureVisibilityStatuses
  WHERE LOWER(StatusKey) = N'enabled'
);

IF @EnabledStatusId IS NULL
  THROW 51000, 'Enabled feature visibility status was not found.', 1;

DECLARE @ViewPermissionId int;
DECLARE @ManagePermissionId int;

SELECT @ViewPermissionId = PermissionId
FROM dbo.Permissions
WHERE PermissionKey = N'asset_tag_branding.rounded.view';

IF @ViewPermissionId IS NULL
BEGIN
  INSERT INTO dbo.Permissions
  (
    PermissionKey,
    PermissionName,
    ModuleId,
    PermissionGroupId,
    Description,
    IsActive,
    CreatedAt,
    UpdatedAt,
    GroupKey,
    GroupName
  )
  VALUES
  (
    N'asset_tag_branding.rounded.view',
    N'View Rounded Asset Tag Branding',
    @ModuleId,
    NULL,
    N'View rounded asset tag branding and print calibration settings.',
    1,
    GETDATE(),
    NULL,
    N'school_configuration',
    N'School Configuration'
  );

  SET @ViewPermissionId = SCOPE_IDENTITY();
END
ELSE
BEGIN
  UPDATE dbo.Permissions
  SET PermissionName = N'View Rounded Asset Tag Branding',
      ModuleId = @ModuleId,
      Description = N'View rounded asset tag branding and print calibration settings.',
      IsActive = 1,
      UpdatedAt = GETDATE(),
      GroupKey = N'school_configuration',
      GroupName = N'School Configuration'
  WHERE PermissionId = @ViewPermissionId;
END;

SELECT @ManagePermissionId = PermissionId
FROM dbo.Permissions
WHERE PermissionKey = N'asset_tag_branding.rounded.manage';

IF @ManagePermissionId IS NULL
BEGIN
  INSERT INTO dbo.Permissions
  (
    PermissionKey,
    PermissionName,
    ModuleId,
    PermissionGroupId,
    Description,
    IsActive,
    CreatedAt,
    UpdatedAt,
    GroupKey,
    GroupName
  )
  VALUES
  (
    N'asset_tag_branding.rounded.manage',
    N'Manage Rounded Asset Tag Branding',
    @ModuleId,
    NULL,
    N'Manage rounded asset tag branding, templates, and print calibration settings.',
    1,
    GETDATE(),
    NULL,
    N'school_configuration',
    N'School Configuration'
  );

  SET @ManagePermissionId = SCOPE_IDENTITY();
END
ELSE
BEGIN
  UPDATE dbo.Permissions
  SET PermissionName = N'Manage Rounded Asset Tag Branding',
      ModuleId = @ModuleId,
      Description = N'Manage rounded asset tag branding, templates, and print calibration settings.',
      IsActive = 1,
      UpdatedAt = GETDATE(),
      GroupKey = N'school_configuration',
      GroupName = N'School Configuration'
  WHERE PermissionId = @ManagePermissionId;
END;

DECLARE @MenuId int;

SELECT TOP 1 @MenuId = MenuId
FROM dbo.Menus
WHERE MenuKey = N'SCHOOL_ROUNDED_ASSET_TAG_BRANDING'
   OR Route = N'/system/rounded-asset-tag-branding'
ORDER BY CASE WHEN MenuKey = N'SCHOOL_ROUNDED_ASSET_TAG_BRANDING' THEN 0 ELSE 1 END;

IF @MenuId IS NULL
BEGIN
  INSERT INTO dbo.Menus
  (
    WorkspaceId,
    ModuleId,
    ParentMenuId,
    MenuKey,
    MenuName,
    Route,
    Icon,
    PermissionId,
    FeatureFlagId,
    BadgeQueryKey,
    VisibilityStatusId,
    IsPinned,
    IsCollapsible,
    SortOrder,
    CreatedAt,
    UpdatedAt
  )
  VALUES
  (
    NULL,
    @ModuleId,
    NULL,
    N'SCHOOL_ROUNDED_ASSET_TAG_BRANDING',
    N'Rounded Asset Tag Branding',
    N'/system/rounded-asset-tag-branding',
    N'palette',
    @ViewPermissionId,
    NULL,
    NULL,
    @EnabledStatusId,
    0,
    0,
    20,
    GETDATE(),
    NULL
  );

  SET @MenuId = SCOPE_IDENTITY();
END
ELSE
BEGIN
  UPDATE dbo.Menus
  SET WorkspaceId = NULL,
      ModuleId = @ModuleId,
      ParentMenuId = NULL,
      MenuKey = N'SCHOOL_ROUNDED_ASSET_TAG_BRANDING',
      MenuName = N'Rounded Asset Tag Branding',
      Route = N'/system/rounded-asset-tag-branding',
      Icon = N'palette',
      PermissionId = @ViewPermissionId,
      VisibilityStatusId = @EnabledStatusId,
      IsPinned = 0,
      IsCollapsible = 0,
      SortOrder = 20,
      UpdatedAt = GETDATE()
  WHERE MenuId = @MenuId;
END;

DECLARE @SuperAdminWorkspaceId int = (
  SELECT TOP 1 WorkspaceId
  FROM dbo.Workspaces
  WHERE WorkspaceKey = N'super-admin'
    AND IsActive = 1
);

IF @SuperAdminWorkspaceId IS NOT NULL
BEGIN
  IF NOT EXISTS
  (
    SELECT 1
    FROM dbo.WorkspaceModules
    WHERE WorkspaceId = @SuperAdminWorkspaceId
      AND ModuleId = @ModuleId
  )
  BEGIN
    INSERT INTO dbo.WorkspaceModules
    (
      WorkspaceId,
      ModuleId,
      IsVisible,
      IsEnabled,
      SortOrder,
      CreatedAt,
      UpdatedAt
    )
    VALUES
    (
      @SuperAdminWorkspaceId,
      @ModuleId,
      1,
      1,
      40,
      GETDATE(),
      NULL
    );
  END
  ELSE
  BEGIN
    UPDATE dbo.WorkspaceModules
    SET IsVisible = 1,
        IsEnabled = 1,
        UpdatedAt = GETDATE()
    WHERE WorkspaceId = @SuperAdminWorkspaceId
      AND ModuleId = @ModuleId;
  END;

  IF NOT EXISTS
  (
    SELECT 1
    FROM dbo.WorkspaceMenus
    WHERE WorkspaceId = @SuperAdminWorkspaceId
      AND MenuId = @MenuId
  )
  BEGIN
    INSERT INTO dbo.WorkspaceMenus
    (
      WorkspaceId,
      MenuId,
      GroupKey,
      GroupName,
      GroupSortOrder,
      ParentMenuId,
      IsVisible,
      IsEnabled,
      SortOrder,
      CreatedAt,
      UpdatedAt
    )
    VALUES
    (
      @SuperAdminWorkspaceId,
      @MenuId,
      N'SCHOOL_CONFIGURATION',
      N'School Configuration',
      40,
      NULL,
      1,
      1,
      20,
      GETDATE(),
      NULL
    );
  END
  ELSE
  BEGIN
    UPDATE dbo.WorkspaceMenus
    SET GroupKey = N'SCHOOL_CONFIGURATION',
        GroupName = N'School Configuration',
        GroupSortOrder = 40,
        ParentMenuId = NULL,
        IsVisible = 1,
        IsEnabled = 1,
        SortOrder = 20,
        UpdatedAt = GETDATE()
    WHERE WorkspaceId = @SuperAdminWorkspaceId
      AND MenuId = @MenuId;
  END;
END;

INSERT INTO dbo.RolePermissions
(
  RoleId,
  PermissionId,
  IsAllowed,
  CreatedAt
)
SELECT
  role.RoleId,
  permission.PermissionId,
  1,
  GETDATE()
FROM dbo.Roles role
CROSS JOIN
(
  SELECT @ViewPermissionId AS PermissionId
  UNION ALL
  SELECT @ManagePermissionId
) permission
WHERE role.RoleKey IN (N'SuperAdmin', N'PLATFORMADMIN', N'PlatformAdmin')
  AND role.IsActive = 1
  AND NOT EXISTS
  (
    SELECT 1
    FROM dbo.RolePermissions existing
    WHERE existing.RoleId = role.RoleId
      AND existing.PermissionId = permission.PermissionId
  );

UPDATE existing
SET existing.IsAllowed = 1
FROM dbo.RolePermissions existing
INNER JOIN dbo.Roles role
  ON role.RoleId = existing.RoleId
WHERE role.RoleKey IN (N'SuperAdmin', N'PLATFORMADMIN', N'PlatformAdmin')
  AND existing.PermissionId IN (@ViewPermissionId, @ManagePermissionId);

COMMIT TRANSACTION;

SELECT
  menu.MenuId,
  menu.MenuKey,
  menu.MenuName,
  menu.Route,
  module.ModuleKey,
  permission.PermissionKey,
  workspace.WorkspaceKey,
  workspaceMenu.IsVisible,
  workspaceMenu.IsEnabled,
  workspaceMenu.GroupName,
  workspaceMenu.SortOrder
FROM dbo.Menus menu
INNER JOIN dbo.Modules module
  ON module.ModuleId = menu.ModuleId
LEFT JOIN dbo.Permissions permission
  ON permission.PermissionId = menu.PermissionId
LEFT JOIN dbo.WorkspaceMenus workspaceMenu
  ON workspaceMenu.MenuId = menu.MenuId
LEFT JOIN dbo.Workspaces workspace
  ON workspace.WorkspaceId = workspaceMenu.WorkspaceId
WHERE menu.MenuKey = N'SCHOOL_ROUNDED_ASSET_TAG_BRANDING';
