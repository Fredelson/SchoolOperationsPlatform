/* Add assignable HOD and HOS role-specific printing menu hierarchies. */

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

  DECLARE @VisibilityStatusId int;
  DECLARE @PrintingModuleId int;

  SELECT TOP (1) @VisibilityStatusId = VisibilityStatusId
  FROM dbo.FeatureVisibilityStatuses
  WHERE LOWER(StatusKey) = N'enabled'
  ORDER BY VisibilityStatusId;

  SELECT @PrintingModuleId = ModuleId
  FROM dbo.Modules
  WHERE ModuleKey = N'printing_management';

  IF @VisibilityStatusId IS NULL
    THROW 51000, 'Enabled visibility status was not found.', 1;
  IF @PrintingModuleId IS NULL
    THROW 51000, 'Printing Management module was not found. Run its setup script first.', 1;

  DECLARE @TargetWorkspaces TABLE
  (
    WorkspaceId int NOT NULL PRIMARY KEY,
    WorkspaceKey nvarchar(100) NOT NULL,
    WorkflowRole nvarchar(10) NOT NULL
  );

  INSERT INTO @TargetWorkspaces (WorkspaceId, WorkspaceKey, WorkflowRole)
  SELECT WorkspaceId, WorkspaceKey,
         CASE WHEN WorkspaceKey = N'hod' THEN N'HOD' ELSE N'HOS' END
  FROM dbo.Workspaces
  WHERE IsActive = 1
    AND WorkspaceKey IN (N'hod', N'hos', N'hos-secretary');

  IF NOT EXISTS (SELECT 1 FROM @TargetWorkspaces WHERE WorkflowRole = N'HOD')
    THROW 51000, 'Active HOD workspace was not found.', 1;
  IF NOT EXISTS (SELECT 1 FROM @TargetWorkspaces WHERE WorkflowRole = N'HOS')
    THROW 51000, 'Active HOS or HOS Secretary workspace was not found.', 1;

  DECLARE @ParentDefinitions TABLE
  (
    MenuKey nvarchar(100) NOT NULL PRIMARY KEY,
    WorkflowRole nvarchar(10) NOT NULL,
    MenuName nvarchar(150) NOT NULL,
    Icon nvarchar(100) NOT NULL,
    SortOrder int NOT NULL
  );

  INSERT INTO @ParentDefinitions (MenuKey, WorkflowRole, MenuName, Icon, SortOrder)
  VALUES
    (N'HOD_APPROVAL_WORKFLOW_ROOT', N'HOD', N'HOD Printing', N'print', 20),
    (N'HOS_APPROVAL_WORKFLOW_ROOT', N'HOS', N'HOS Printing', N'print', 20);

  UPDATE menu
  SET
    WorkspaceId = NULL,
    ModuleId = @PrintingModuleId,
    ParentMenuId = NULL,
    MenuName = parentDefinition.MenuName,
    Route = NULL,
    Icon = parentDefinition.Icon,
    VisibilityStatusId = @VisibilityStatusId,
    IsCollapsible = 1,
    SortOrder = parentDefinition.SortOrder,
    UpdatedAt = GETDATE()
  FROM dbo.Menus menu
  INNER JOIN @ParentDefinitions parentDefinition
    ON parentDefinition.MenuKey = menu.MenuKey;

  INSERT INTO dbo.Menus
  (
    WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon,
    PermissionId, FeatureFlagId, BadgeQueryKey, VisibilityStatusId,
    IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt
  )
  SELECT
    NULL, @PrintingModuleId, NULL, parentDefinition.MenuKey,
    parentDefinition.MenuName, NULL, parentDefinition.Icon,
    NULL, NULL, NULL, @VisibilityStatusId,
    0, 1, parentDefinition.SortOrder, GETDATE(), NULL
  FROM @ParentDefinitions parentDefinition
  WHERE NOT EXISTS
  (
    SELECT 1 FROM dbo.Menus existing
    WHERE existing.MenuKey = parentDefinition.MenuKey
  );

  DECLARE @Parents TABLE
  (
    WorkflowRole nvarchar(10) NOT NULL,
    MenuId int NOT NULL,
    MenuKey nvarchar(100) NOT NULL
  );

  INSERT INTO @Parents (WorkflowRole, MenuId, MenuKey)
  SELECT definition.WorkflowRole, menu.MenuId, definition.MenuKey
  FROM @ParentDefinitions definition
  INNER JOIN dbo.Menus menu ON menu.MenuKey = definition.MenuKey;

  UPDATE workspaceModule
  SET IsVisible = 1, IsEnabled = 1, UpdatedAt = GETDATE()
  FROM dbo.WorkspaceModules workspaceModule
  INNER JOIN @TargetWorkspaces target
    ON target.WorkspaceId = workspaceModule.WorkspaceId
  WHERE workspaceModule.ModuleId = @PrintingModuleId;

  INSERT INTO dbo.WorkspaceModules
  (
    WorkspaceId, ModuleId, IsVisible, IsEnabled, SortOrder, CreatedAt, UpdatedAt
  )
  SELECT target.WorkspaceId, @PrintingModuleId, 1, 1, 4, GETDATE(), NULL
  FROM @TargetWorkspaces target
  WHERE NOT EXISTS
  (
    SELECT 1 FROM dbo.WorkspaceModules existing
    WHERE existing.WorkspaceId = target.WorkspaceId
      AND existing.ModuleId = @PrintingModuleId
  );

  UPDATE workspaceMenu
  SET
    GroupKey = N'MAIN',
    GroupName = N'Main',
    GroupSortOrder = 10,
    ParentMenuId = NULL,
    IsVisible = 1,
    IsEnabled = 1,
    SortOrder = 20,
    UpdatedAt = GETDATE()
  FROM dbo.WorkspaceMenus workspaceMenu
  INNER JOIN @TargetWorkspaces target
    ON target.WorkspaceId = workspaceMenu.WorkspaceId
  INNER JOIN @Parents parent
    ON parent.WorkflowRole = target.WorkflowRole
   AND parent.MenuId = workspaceMenu.MenuId;

  INSERT INTO dbo.WorkspaceMenus
  (
    WorkspaceId, MenuId, GroupKey, GroupName, GroupSortOrder,
    ParentMenuId, IsVisible, IsEnabled, SortOrder, CreatedAt, UpdatedAt
  )
  SELECT
    target.WorkspaceId, parent.MenuId, N'MAIN', N'Main', 10,
    NULL, 1, 1, 20, GETDATE(), NULL
  FROM @TargetWorkspaces target
  INNER JOIN @Parents parent ON parent.WorkflowRole = target.WorkflowRole
  WHERE NOT EXISTS
  (
    SELECT 1 FROM dbo.WorkspaceMenus existing
    WHERE existing.WorkspaceId = target.WorkspaceId
      AND existing.MenuId = parent.MenuId
  );

  DECLARE @ChildDefinitions TABLE
  (
    WorkflowRole nvarchar(10) NOT NULL,
    MenuKey nvarchar(100) NOT NULL,
    MenuName nvarchar(150) NOT NULL,
    Route nvarchar(150) NOT NULL PRIMARY KEY,
    Icon nvarchar(100) NOT NULL,
    SortOrder int NOT NULL
  );

  INSERT INTO @ChildDefinitions
    (WorkflowRole, MenuKey, MenuName, Route, Icon, SortOrder)
  VALUES
    (N'HOD', N'hod_dashboard', N'HOD Dashboard', N'/hod/dashboard', N'dashboard', 5),
    (N'HOD', N'hod_pending', N'Pending Approvals', N'/hod/pending-requests', N'approval', 10),
    (N'HOD', N'hod_approved', N'Approval History', N'/hod/approved-requests', N'history', 20),
    (N'HOD', N'hod_rejected', N'Rejected Requests', N'/hod/rejected-requests', N'cancel', 30),
    (N'HOD', N'hod_returned', N'Returned Requests', N'/hod/returned-requests', N'assignment_return', 40),
    (N'HOD', N'hod_create', N'Create Request', N'/hod/create-request', N'add_circle', 50),
    (N'HOD', N'hod_my_requests', N'My Requests', N'/hod/my-requests', N'description', 60),
    (N'HOD', N'hod_attachments', N'Attachments', N'/hod/attachments', N'attach_file', 70),
    (N'HOS', N'hos_dashboard', N'HOS Dashboard', N'/hos/dashboard', N'dashboard', 10),
    (N'HOS', N'hos_allocations', N'Subject Allocations', N'/hos/subject-allocation', N'account_balance', 20);

  UPDATE menu
  SET
    WorkspaceId = NULL,
    ModuleId = @PrintingModuleId,
    ParentMenuId = parent.MenuId,
    MenuName = childDefinition.MenuName,
    Icon = childDefinition.Icon,
    VisibilityStatusId = @VisibilityStatusId,
    IsCollapsible = 0,
    SortOrder = childDefinition.SortOrder,
    UpdatedAt = GETDATE()
  FROM dbo.Menus menu
  INNER JOIN @ChildDefinitions childDefinition
    ON childDefinition.Route = menu.Route
  INNER JOIN @Parents parent
    ON parent.WorkflowRole = childDefinition.WorkflowRole;

  INSERT INTO dbo.Menus
  (
    WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon,
    PermissionId, FeatureFlagId, BadgeQueryKey, VisibilityStatusId,
    IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt
  )
  SELECT
    NULL, @PrintingModuleId, parent.MenuId, childDefinition.MenuKey,
    childDefinition.MenuName, childDefinition.Route, childDefinition.Icon,
    NULL, NULL, NULL, @VisibilityStatusId,
    0, 0, childDefinition.SortOrder, GETDATE(), NULL
  FROM @ChildDefinitions childDefinition
  INNER JOIN @Parents parent
    ON parent.WorkflowRole = childDefinition.WorkflowRole
  WHERE NOT EXISTS
  (
    SELECT 1 FROM dbo.Menus existing
    WHERE existing.Route = childDefinition.Route
  );

  UPDATE workspaceMenu
  SET
    GroupKey = N'MAIN',
    GroupName = N'Main',
    GroupSortOrder = 10,
    ParentMenuId = parent.MenuId,
    IsVisible = 1,
    IsEnabled = 1,
    SortOrder = childDefinition.SortOrder,
    UpdatedAt = GETDATE()
  FROM dbo.WorkspaceMenus workspaceMenu
  INNER JOIN @TargetWorkspaces target
    ON target.WorkspaceId = workspaceMenu.WorkspaceId
  INNER JOIN @ChildDefinitions childDefinition
    ON childDefinition.WorkflowRole = target.WorkflowRole
  INNER JOIN dbo.Menus menu
    ON menu.MenuId = workspaceMenu.MenuId
   AND menu.Route = childDefinition.Route
  INNER JOIN @Parents parent
    ON parent.WorkflowRole = childDefinition.WorkflowRole;

  INSERT INTO dbo.WorkspaceMenus
  (
    WorkspaceId, MenuId, GroupKey, GroupName, GroupSortOrder,
    ParentMenuId, IsVisible, IsEnabled, SortOrder, CreatedAt, UpdatedAt
  )
  SELECT
    target.WorkspaceId, menu.MenuId, N'MAIN', N'Main', 10,
    parent.MenuId, 1, 1, childDefinition.SortOrder, GETDATE(), NULL
  FROM @TargetWorkspaces target
  INNER JOIN @ChildDefinitions childDefinition
    ON childDefinition.WorkflowRole = target.WorkflowRole
  INNER JOIN dbo.Menus menu ON menu.Route = childDefinition.Route
  INNER JOIN @Parents parent
    ON parent.WorkflowRole = childDefinition.WorkflowRole
  WHERE NOT EXISTS
  (
    SELECT 1 FROM dbo.WorkspaceMenus existing
    WHERE existing.WorkspaceId = target.WorkspaceId
      AND existing.MenuId = menu.MenuId
  );

  COMMIT TRANSACTION;
  PRINT 'HOD and HOS approval workflow parents and child menus were registered.';

  SELECT
    workspace.WorkspaceKey,
    parent.MenuName AS ParentMenu,
    menu.MenuName AS ChildMenu,
    menu.Route,
    workspaceMenu.IsVisible AS IsAssigned,
    workspaceMenu.IsEnabled
  FROM @TargetWorkspaces target
  INNER JOIN dbo.Workspaces workspace ON workspace.WorkspaceId = target.WorkspaceId
  INNER JOIN dbo.WorkspaceMenus workspaceMenu ON workspaceMenu.WorkspaceId = target.WorkspaceId
  INNER JOIN dbo.Menus menu ON menu.MenuId = workspaceMenu.MenuId
  LEFT JOIN dbo.Menus parent ON parent.MenuId = workspaceMenu.ParentMenuId
  WHERE workspaceMenu.MenuId IN (SELECT MenuId FROM @Parents)
     OR workspaceMenu.ParentMenuId IN (SELECT MenuId FROM @Parents)
  ORDER BY workspace.WorkspaceKey, parent.MenuName, workspaceMenu.SortOrder;
END TRY
BEGIN CATCH
  IF XACT_STATE() <> 0
    ROLLBACK TRANSACTION;
  THROW;
END CATCH;
