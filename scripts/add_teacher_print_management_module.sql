/* Add Teacher Print Management to the Teacher workspace. */

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
  BEGIN TRANSACTION;

  DECLARE @VisibilityStatusId int;
  DECLARE @WorkspaceId int;
  DECLARE @ModuleId int;
  DECLARE @ParentMenuId int;
  DECLARE @MenuId int;

  SELECT TOP (1)
    @VisibilityStatusId = VisibilityStatusId
  FROM dbo.FeatureVisibilityStatuses
  WHERE LOWER(StatusKey) = N'enabled'
  ORDER BY VisibilityStatusId;

  SELECT @WorkspaceId = WorkspaceId
  FROM dbo.Workspaces
  WHERE WorkspaceKey = N'teacher'
    AND IsActive = 1;

  IF @VisibilityStatusId IS NULL
    THROW 51000, 'Enabled visibility status was not found.', 1;

  IF @WorkspaceId IS NULL
    THROW 51000, 'Active teacher workspace was not found.', 1;

  SELECT @ModuleId = ModuleId
  FROM dbo.Modules
  WHERE ModuleKey = N'teacher_print_management';

  IF @ModuleId IS NULL
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
      N'teacher_print_management',
      N'Teacher Print Management',
      N'Create, track, and manage teacher printing requests.',
      N'print',
      N'/teacher/print-management',
      @VisibilityStatusId,
      1,
      5,
      GETDATE(),
      NULL
    );

    SET @ModuleId = SCOPE_IDENTITY();
  END
  ELSE
  BEGIN
    UPDATE dbo.Modules
    SET
      ModuleName = N'Teacher Print Management',
      Description = N'Create, track, and manage teacher printing requests.',
      Icon = N'print',
      BaseRoute = N'/teacher/print-management',
      VisibilityStatusId = @VisibilityStatusId,
      IsActive = 1,
      UpdatedAt = GETDATE()
    WHERE ModuleId = @ModuleId;
  END;

  IF NOT EXISTS
  (
    SELECT 1
    FROM dbo.WorkspaceModules
    WHERE WorkspaceId = @WorkspaceId
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
      @WorkspaceId,
      @ModuleId,
      1,
      1,
      5,
      GETDATE(),
      NULL
    );
  END
  ELSE
  BEGIN
    UPDATE dbo.WorkspaceModules
    SET
      IsVisible = 1,
      IsEnabled = 1,
      SortOrder = 5,
      UpdatedAt = GETDATE()
    WHERE WorkspaceId = @WorkspaceId
      AND ModuleId = @ModuleId;
  END;

  /* Create a distinct, assignable Teacher Printing parent menu. */
  SELECT @ParentMenuId = MenuId
  FROM dbo.Menus
  WHERE MenuKey = N'TEACHER_PRINTING_ROOT';

  IF @ParentMenuId IS NULL
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
      N'TEACHER_PRINTING_ROOT',
      N'Teacher Printing',
      NULL,
      N'print',
      NULL,
      NULL,
      NULL,
      @VisibilityStatusId,
      0,
      1,
      5,
      GETDATE(),
      NULL
    );

    SET @ParentMenuId = SCOPE_IDENTITY();
  END
  ELSE
  BEGIN
    UPDATE dbo.Menus
    SET
      WorkspaceId = NULL,
      ModuleId = @ModuleId,
      ParentMenuId = NULL,
      MenuName = N'Teacher Printing',
      Route = NULL,
      Icon = N'print',
      VisibilityStatusId = @VisibilityStatusId,
      IsCollapsible = 1,
      SortOrder = 5,
      UpdatedAt = GETDATE()
    WHERE MenuId = @ParentMenuId;
  END;

  SELECT @MenuId = MenuId
  FROM dbo.Menus
  WHERE MenuKey = N'TEACHER_PRINT_MANAGEMENT';

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
      @ParentMenuId,
      N'TEACHER_PRINT_MANAGEMENT',
      N'Teacher Print Management',
      N'/teacher/print-management',
      N'print',
      NULL,
      NULL,
      NULL,
      @VisibilityStatusId,
      0,
      0,
      5,
      GETDATE(),
      NULL
    );

    SET @MenuId = SCOPE_IDENTITY();
  END
  ELSE
  BEGIN
    UPDATE dbo.Menus
    SET
      WorkspaceId = NULL,
      ModuleId = @ModuleId,
      ParentMenuId = @ParentMenuId,
      MenuName = N'Teacher Print Management',
      Route = N'/teacher/print-management',
      Icon = N'print',
      VisibilityStatusId = @VisibilityStatusId,
      IsCollapsible = 0,
      SortOrder = 5,
      UpdatedAt = GETDATE()
    WHERE MenuId = @MenuId;
  END;

  IF NOT EXISTS
  (
    SELECT 1
    FROM dbo.WorkspaceMenus
    WHERE WorkspaceId = @WorkspaceId
      AND MenuId = @ParentMenuId
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
      @WorkspaceId,
      @ParentMenuId,
      N'MAIN',
      N'Main',
      10,
      NULL,
      1,
      1,
      5,
      GETDATE(),
      NULL
    );
  END
  ELSE
  BEGIN
    UPDATE dbo.WorkspaceMenus
    SET
      GroupKey = N'MAIN',
      GroupName = N'Main',
      GroupSortOrder = 10,
      ParentMenuId = NULL,
      IsVisible = 1,
      IsEnabled = 1,
      SortOrder = 5,
      UpdatedAt = GETDATE()
    WHERE WorkspaceId = @WorkspaceId
      AND MenuId = @ParentMenuId;
  END;

  IF NOT EXISTS
  (
    SELECT 1
    FROM dbo.WorkspaceMenus
    WHERE WorkspaceId = @WorkspaceId
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
      @WorkspaceId,
      @MenuId,
      N'MAIN',
      N'Main',
      10,
      @ParentMenuId,
      1,
      1,
      5,
      GETDATE(),
      NULL
    );
  END
  ELSE
  BEGIN
    UPDATE dbo.WorkspaceMenus
    SET
      GroupKey = N'MAIN',
      GroupName = N'Main',
      GroupSortOrder = 10,
      ParentMenuId = @ParentMenuId,
      IsVisible = 1,
      IsEnabled = 1,
      SortOrder = 5,
      UpdatedAt = GETDATE()
    WHERE WorkspaceId = @WorkspaceId
      AND MenuId = @MenuId;
  END;

  DECLARE @TeacherChildMenus TABLE
  (
    MenuKey nvarchar(100) NOT NULL,
    MenuName nvarchar(150) NOT NULL,
    Route nvarchar(150) NOT NULL PRIMARY KEY,
    Icon nvarchar(100) NOT NULL,
    SortOrder int NOT NULL
  );

  INSERT INTO @TeacherChildMenus (MenuKey, MenuName, Route, Icon, SortOrder)
  VALUES
    (N'teacher_dashboard', N'Dashboard', N'/teacher/dashboard', N'dashboard', 5),
    (N'teacher_create_request', N'Create Print Request', N'/teacher/create-request', N'add_circle', 10),
    (N'teacher_my_requests', N'My Requests', N'/teacher/my-requests', N'description', 20),
    (N'teacher_attachments', N'Attachments', N'/teacher/attachments', N'attach_file', 30),
    (N'teacher_reports', N'Reports', N'/teacher/reports', N'bar_chart', 40);

  /* Ensure all teacher print actions exist as assignable menu records. */
  UPDATE menu
  SET
    WorkspaceId = NULL,
    ModuleId = @ModuleId,
    ParentMenuId = @ParentMenuId,
    MenuName = childMenu.MenuName,
    Icon = childMenu.Icon,
    VisibilityStatusId = @VisibilityStatusId,
    IsCollapsible = 0,
    SortOrder = childMenu.SortOrder,
    UpdatedAt = GETDATE()
  FROM dbo.Menus menu
  INNER JOIN @TeacherChildMenus childMenu
    ON childMenu.Route = menu.Route;

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
  SELECT
    NULL,
    @ModuleId,
    @ParentMenuId,
    childMenu.MenuKey,
    childMenu.MenuName,
    childMenu.Route,
    childMenu.Icon,
    NULL,
    NULL,
    NULL,
    @VisibilityStatusId,
    0,
    0,
    childMenu.SortOrder,
    GETDATE(),
    NULL
  FROM @TeacherChildMenus childMenu
  WHERE NOT EXISTS
  (
    SELECT 1
    FROM dbo.Menus existing
    WHERE existing.Route = childMenu.Route
  );

  UPDATE workspaceMenu
  SET
    GroupKey = N'MAIN',
    GroupName = N'Main',
    GroupSortOrder = 10,
    ParentMenuId = @ParentMenuId,
    IsVisible = 1,
    IsEnabled = 1,
    SortOrder = childMenu.SortOrder,
    UpdatedAt = GETDATE()
  FROM dbo.WorkspaceMenus workspaceMenu
  INNER JOIN dbo.Menus menu
    ON menu.MenuId = workspaceMenu.MenuId
  INNER JOIN @TeacherChildMenus childMenu
    ON childMenu.Route = menu.Route
  WHERE workspaceMenu.WorkspaceId = @WorkspaceId;

  /* Assign the Teacher Printing links to the Teacher workspace. */
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
    @WorkspaceId,
    menu.MenuId,
    N'MAIN',
    N'Main',
    10,
    @ParentMenuId,
    1,
    1,
    childMenu.SortOrder,
    GETDATE(),
    NULL
  FROM dbo.Menus menu
  INNER JOIN @TeacherChildMenus childMenu
    ON childMenu.Route = menu.Route
    AND NOT EXISTS
    (
      SELECT 1
      FROM dbo.WorkspaceMenus existing
      WHERE existing.WorkspaceId = @WorkspaceId
        AND existing.MenuId = menu.MenuId
    );

  COMMIT TRANSACTION;
  PRINT 'Teacher Printing parent and Teacher Print Management child registered.';

  SELECT
    workspace.WorkspaceKey,
    menu.MenuKey,
    menu.MenuName,
    menu.Route,
    parent.MenuName AS ParentMenuName,
    workspaceMenu.IsVisible AS IsAssigned,
    workspaceMenu.IsEnabled
  FROM dbo.WorkspaceMenus workspaceMenu
  INNER JOIN dbo.Workspaces workspace
    ON workspace.WorkspaceId = workspaceMenu.WorkspaceId
  INNER JOIN dbo.Menus menu
    ON menu.MenuId = workspaceMenu.MenuId
  LEFT JOIN dbo.Menus parent
    ON parent.MenuId = workspaceMenu.ParentMenuId
  WHERE workspaceMenu.WorkspaceId = @WorkspaceId
    AND
    (
      menu.MenuId = @ParentMenuId
      OR workspaceMenu.ParentMenuId = @ParentMenuId
    )
  ORDER BY
    CASE WHEN workspaceMenu.ParentMenuId IS NULL THEN 0 ELSE 1 END,
    workspaceMenu.SortOrder;
END TRY
BEGIN CATCH
  IF XACT_STATE() <> 0
    ROLLBACK TRANSACTION;
  THROW;
END CATCH;
