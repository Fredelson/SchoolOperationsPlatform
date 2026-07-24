/*
  Printing role navigation consolidation

  Purpose
  -------
  Keep the Teacher, HOD, and HOS dashboards as top-level workspace menus.
  Move every other /teacher, /hod, and /hos menu under Printing Management.

  This script is idempotent and can be run more than once in SSMS.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
  BEGIN TRANSACTION;

  IF OBJECT_ID(N'dbo.Modules', N'U') IS NULL
    THROW 51000, 'Required table dbo.Modules was not found.', 1;

  IF OBJECT_ID(N'dbo.Menus', N'U') IS NULL
    THROW 51000, 'Required table dbo.Menus was not found.', 1;

  IF OBJECT_ID(N'dbo.Workspaces', N'U') IS NULL
    THROW 51000, 'Required table dbo.Workspaces was not found.', 1;

  IF OBJECT_ID(N'dbo.WorkspaceModules', N'U') IS NULL
    THROW 51000, 'Required table dbo.WorkspaceModules was not found.', 1;

  IF OBJECT_ID(N'dbo.WorkspaceMenus', N'U') IS NULL
    THROW 51000, 'Required table dbo.WorkspaceMenus was not found.', 1;

  DECLARE @EnabledVisibilityStatusId int;
  DECLARE @PrintingModuleId int;
  DECLARE @PrintingRootMenuId int;

  SELECT TOP (1)
    @EnabledVisibilityStatusId = VisibilityStatusId
  FROM dbo.FeatureVisibilityStatuses
  WHERE LOWER(StatusKey) = N'enabled'
  ORDER BY VisibilityStatusId;

  IF @EnabledVisibilityStatusId IS NULL
    THROW 51000, 'Enabled visibility status was not found.', 1;

  SELECT
    @PrintingModuleId = ModuleId
  FROM dbo.Modules
  WHERE ModuleKey = N'printing_management';

  IF @PrintingModuleId IS NULL
  BEGIN
    INSERT INTO dbo.Modules
    (
      ModuleKey,
      ModuleName,
      Description,
      Icon,
      BaseRoute,
      VisibilityStatusId,
      IsActive,
      SortOrder,
      CreatedAt,
      UpdatedAt
    )
    VALUES
    (
      N'printing_management',
      N'Printing Management',
      N'Printing requests, approvals, queue, inventory, limits, reports, and settings.',
      N'print',
      N'/printing',
      @EnabledVisibilityStatusId,
      1,
      4,
      GETDATE(),
      NULL
    );

    SET @PrintingModuleId = SCOPE_IDENTITY();
  END;
  ELSE
  BEGIN
    UPDATE dbo.Modules
    SET
      ModuleName = N'Printing Management',
      VisibilityStatusId = @EnabledVisibilityStatusId,
      IsActive = 1,
      UpdatedAt = GETDATE()
    WHERE ModuleId = @PrintingModuleId;
  END;

  DECLARE @TargetWorkspaces TABLE
  (
    WorkspaceId int NOT NULL PRIMARY KEY,
    WorkspaceKey nvarchar(100) NOT NULL,
    RoutePrefix nvarchar(20) NOT NULL,
    DashboardRoute nvarchar(150) NOT NULL
  );

  INSERT INTO @TargetWorkspaces
  (
    WorkspaceId,
    WorkspaceKey,
    RoutePrefix,
    DashboardRoute
  )
  SELECT
    WorkspaceId,
    WorkspaceKey,
    CASE
      WHEN WorkspaceKey = N'teacher' THEN N'/teacher/'
      WHEN WorkspaceKey = N'hod' THEN N'/hod/'
      ELSE N'/hos/'
    END,
    CASE
      WHEN WorkspaceKey = N'teacher' THEN N'/teacher/dashboard'
      WHEN WorkspaceKey = N'hod' THEN N'/hod/dashboard'
      ELSE N'/hos/dashboard'
    END
  FROM dbo.Workspaces
  WHERE WorkspaceKey IN (N'teacher', N'hod', N'hos-secretary', N'hos')
    AND IsActive = 1;

  IF NOT EXISTS (
    SELECT 1 FROM @TargetWorkspaces WHERE WorkspaceKey = N'teacher'
  )
    THROW 51000, 'Active teacher workspace was not found.', 1;

  IF NOT EXISTS (
    SELECT 1 FROM @TargetWorkspaces WHERE WorkspaceKey = N'hod'
  )
    THROW 51000, 'Active HOD workspace was not found.', 1;

  IF NOT EXISTS (
    SELECT 1
    FROM @TargetWorkspaces
    WHERE WorkspaceKey IN (N'hos-secretary', N'hos')
  )
    THROW 51000, 'Active HOS workspace was not found.', 1;

  SELECT TOP (1)
    @PrintingRootMenuId = MenuId
  FROM dbo.Menus
  WHERE MenuKey IN (N'PRINTING_MANAGEMENT_ROOT', N'PRINTING_MANAGEMENT')
  ORDER BY
    CASE
      WHEN MenuKey = N'PRINTING_MANAGEMENT_ROOT' THEN 0
      ELSE 1
    END,
    MenuId;

  IF @PrintingRootMenuId IS NULL
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
      @PrintingModuleId,
      NULL,
      N'PRINTING_MANAGEMENT_ROOT',
      N'Printing Management',
      NULL,
      N'print',
      NULL,
      NULL,
      NULL,
      @EnabledVisibilityStatusId,
      0,
      1,
      20,
      GETDATE(),
      NULL
    );

    SET @PrintingRootMenuId = SCOPE_IDENTITY();
  END;
  ELSE
  BEGIN
    UPDATE dbo.Menus
    SET
      ModuleId = @PrintingModuleId,
      ParentMenuId = NULL,
      MenuName = N'Printing Management',
      Route = NULL,
      Icon = N'print',
      VisibilityStatusId = @EnabledVisibilityStatusId,
      IsCollapsible = 1,
      UpdatedAt = GETDATE()
    WHERE MenuId = @PrintingRootMenuId;
  END;

  DECLARE @RoleMenus TABLE
  (
    WorkspaceId int NOT NULL,
    MenuId int NOT NULL,
    Route nvarchar(150) NOT NULL,
    IsDashboard bit NOT NULL,
    ChildSortOrder int NOT NULL,
    PRIMARY KEY (WorkspaceId, MenuId)
  );

  INSERT INTO @RoleMenus
  (
    WorkspaceId,
    MenuId,
    Route,
    IsDashboard,
    ChildSortOrder
  )
  SELECT
    workspace.WorkspaceId,
    menu.MenuId,
    menu.Route,
    CONVERT(
      bit,
      CASE
        WHEN LOWER(menu.Route) = LOWER(workspace.DashboardRoute) THEN 1
        ELSE 0
      END
    ),
    menu.SortOrder
  FROM @TargetWorkspaces workspace
  INNER JOIN dbo.Menus menu
    ON LOWER(menu.Route) LIKE LOWER(workspace.RoutePrefix) + N'%';

  IF NOT EXISTS (SELECT 1 FROM @RoleMenus)
    THROW 51000, 'No Teacher, HOD, or HOS menus were found.', 1;

  /*
    Dashboard menus stay outside Printing Management.
    Their module ownership is intentionally left unchanged.
  */
  UPDATE menu
  SET
    ParentMenuId = NULL,
    UpdatedAt = GETDATE()
  FROM dbo.Menus menu
  INNER JOIN @RoleMenus roleMenu
    ON roleMenu.MenuId = menu.MenuId
  WHERE roleMenu.IsDashboard = 1
    AND menu.ParentMenuId IS NOT NULL;

  /*
    Every non-dashboard role menu becomes a Printing Management child.
    Existing permissions remain attached so role access is preserved.
  */
  UPDATE menu
  SET
    ModuleId = @PrintingModuleId,
    ParentMenuId = @PrintingRootMenuId,
    UpdatedAt = GETDATE()
  FROM dbo.Menus menu
  INNER JOIN @RoleMenus roleMenu
    ON roleMenu.MenuId = menu.MenuId
  WHERE roleMenu.IsDashboard = 0;

  /*
    Ensure Printing Management is enabled for all three role workspaces.
  */
  UPDATE workspaceModule
  SET
    IsVisible = 1,
    IsEnabled = 1,
    SortOrder = 4,
    UpdatedAt = GETDATE()
  FROM dbo.WorkspaceModules workspaceModule
  INNER JOIN @TargetWorkspaces workspace
    ON workspace.WorkspaceId = workspaceModule.WorkspaceId
  WHERE workspaceModule.ModuleId = @PrintingModuleId;

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
  SELECT
    workspace.WorkspaceId,
    @PrintingModuleId,
    1,
    1,
    4,
    GETDATE(),
    NULL
  FROM @TargetWorkspaces workspace
  WHERE NOT EXISTS
  (
    SELECT 1
    FROM dbo.WorkspaceModules existing
    WHERE existing.WorkspaceId = workspace.WorkspaceId
      AND existing.ModuleId = @PrintingModuleId
  );

  /*
    Add or update the Printing Management parent in each role workspace.
  */
  UPDATE workspaceMenu
  SET
    GroupKey = N'PRINTING_MANAGEMENT',
    GroupName = N'Printing Management',
    GroupSortOrder = 20,
    ParentMenuId = NULL,
    IsVisible = 1,
    IsEnabled = 1,
    SortOrder = 20,
    UpdatedAt = GETDATE()
  FROM dbo.WorkspaceMenus workspaceMenu
  INNER JOIN @TargetWorkspaces workspace
    ON workspace.WorkspaceId = workspaceMenu.WorkspaceId
  WHERE workspaceMenu.MenuId = @PrintingRootMenuId;

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
  SELECT
    workspace.WorkspaceId,
    @PrintingRootMenuId,
    N'PRINTING_MANAGEMENT',
    N'Printing Management',
    20,
    NULL,
    1,
    1,
    20,
    GETDATE(),
    NULL
  FROM @TargetWorkspaces workspace
  WHERE NOT EXISTS
  (
    SELECT 1
    FROM dbo.WorkspaceMenus existing
    WHERE existing.WorkspaceId = workspace.WorkspaceId
      AND existing.MenuId = @PrintingRootMenuId
  );

  /*
    Keep dashboards top-level in Main.
  */
  UPDATE workspaceMenu
  SET
    GroupKey = N'MAIN',
    GroupName = N'Main',
    GroupSortOrder = 10,
    ParentMenuId = NULL,
    IsVisible = 1,
    IsEnabled = 1,
    SortOrder = 10,
    UpdatedAt = GETDATE()
  FROM dbo.WorkspaceMenus workspaceMenu
  INNER JOIN @RoleMenus roleMenu
    ON roleMenu.WorkspaceId = workspaceMenu.WorkspaceId
    AND roleMenu.MenuId = workspaceMenu.MenuId
  WHERE roleMenu.IsDashboard = 1;

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
  SELECT
    roleMenu.WorkspaceId,
    roleMenu.MenuId,
    N'MAIN',
    N'Main',
    10,
    NULL,
    1,
    1,
    10,
    GETDATE(),
    NULL
  FROM @RoleMenus roleMenu
  WHERE roleMenu.IsDashboard = 1
    AND NOT EXISTS
    (
      SELECT 1
      FROM dbo.WorkspaceMenus existing
      WHERE existing.WorkspaceId = roleMenu.WorkspaceId
        AND existing.MenuId = roleMenu.MenuId
    );

  /*
    Put all non-dashboard role menus below Printing Management.
  */
  UPDATE workspaceMenu
  SET
    GroupKey = N'PRINTING_MANAGEMENT',
    GroupName = N'Printing Management',
    GroupSortOrder = 20,
    ParentMenuId = @PrintingRootMenuId,
    IsVisible = 1,
    IsEnabled = 1,
    SortOrder = roleMenu.ChildSortOrder,
    UpdatedAt = GETDATE()
  FROM dbo.WorkspaceMenus workspaceMenu
  INNER JOIN @RoleMenus roleMenu
    ON roleMenu.WorkspaceId = workspaceMenu.WorkspaceId
    AND roleMenu.MenuId = workspaceMenu.MenuId
  WHERE roleMenu.IsDashboard = 0;

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
  SELECT
    roleMenu.WorkspaceId,
    roleMenu.MenuId,
    N'PRINTING_MANAGEMENT',
    N'Printing Management',
    20,
    @PrintingRootMenuId,
    1,
    1,
    roleMenu.ChildSortOrder,
    GETDATE(),
    NULL
  FROM @RoleMenus roleMenu
  WHERE roleMenu.IsDashboard = 0
    AND NOT EXISTS
    (
      SELECT 1
      FROM dbo.WorkspaceMenus existing
      WHERE existing.WorkspaceId = roleMenu.WorkspaceId
        AND existing.MenuId = roleMenu.MenuId
    );

  COMMIT TRANSACTION;

  PRINT 'Teacher, HOD, and HOS menus were consolidated under Printing Management.';
  PRINT 'Dashboards remain top-level.';

  SELECT
    workspace.WorkspaceKey,
    menu.MenuKey,
    menu.MenuName,
    menu.Route,
    module.ModuleKey,
    parent.MenuName AS ParentMenuName,
    workspaceMenu.GroupKey,
    workspaceMenu.SortOrder,
    workspaceMenu.IsVisible,
    workspaceMenu.IsEnabled
  FROM @TargetWorkspaces workspace
  INNER JOIN dbo.WorkspaceMenus workspaceMenu
    ON workspaceMenu.WorkspaceId = workspace.WorkspaceId
  INNER JOIN dbo.Menus menu
    ON menu.MenuId = workspaceMenu.MenuId
  INNER JOIN dbo.Modules module
    ON module.ModuleId = menu.ModuleId
  LEFT JOIN dbo.Menus parent
    ON parent.MenuId = workspaceMenu.ParentMenuId
  WHERE menu.MenuId = @PrintingRootMenuId
     OR EXISTS
     (
       SELECT 1
       FROM @RoleMenus roleMenu
       WHERE roleMenu.WorkspaceId = workspace.WorkspaceId
         AND roleMenu.MenuId = menu.MenuId
     )
  ORDER BY
    workspace.WorkspaceKey,
    CASE WHEN workspaceMenu.ParentMenuId IS NULL THEN 0 ELSE 1 END,
    workspaceMenu.SortOrder,
    menu.MenuName;
END TRY
BEGIN CATCH
  IF XACT_STATE() <> 0
    ROLLBACK TRANSACTION;

  THROW;
END CATCH;

SET NOCOUNT OFF;
