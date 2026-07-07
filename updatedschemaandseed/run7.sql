USE OperationsPlatformDB;
GO

BEGIN TRANSACTION;

BEGIN TRY
    DECLARE @EnabledStatusId INT = 1;
    DECLARE @HiddenStatusId INT = 2;
    DECLARE @ItModuleId INT;
    DECLARE @ItRootMenuId INT;

    SELECT @ItModuleId = ModuleId
    FROM dbo.Modules
    WHERE ModuleKey = 'it_operations';

    SELECT @ItRootMenuId = MenuId
    FROM dbo.Menus
    WHERE MenuKey = 'IT_OPERATIONS_ROOT';

    IF @ItModuleId IS NULL
        THROW 50001, 'Module not found: it_operations', 1;

    IF @ItRootMenuId IS NULL
        THROW 50002, 'Root menu not found: IT_OPERATIONS_ROOT', 1;

    ------------------------------------------------------------
    -- Update IT Operations module base route
    ------------------------------------------------------------

    UPDATE dbo.Modules
    SET
        BaseRoute = '/it-assets',
        Icon = 'devices',
        VisibilityStatusId = @EnabledStatusId,
        IsActive = 1,
        UpdatedAt = GETDATE()
    WHERE ModuleKey = 'it_operations';

    ------------------------------------------------------------
    -- Update root menu
    ------------------------------------------------------------

    UPDATE dbo.Menus
    SET
        MenuName = 'IT Operations',
        Route = NULL,
        Icon = 'devices',
        ParentMenuId = NULL,
        VisibilityStatusId = @EnabledStatusId,
        IsCollapsible = 1,
        SortOrder = 30,
        UpdatedAt = GETDATE()
    WHERE MenuKey = 'IT_OPERATIONS_ROOT';

    ------------------------------------------------------------
    -- Update existing child routes
    ------------------------------------------------------------

    UPDATE dbo.Menus
    SET
        MenuName = 'Dashboard',
        Route = '/it-assets/dashboard',
        Icon = 'dashboard',
        ParentMenuId = @ItRootMenuId,
        VisibilityStatusId = @EnabledStatusId,
        IsCollapsible = 0,
        SortOrder = 10,
        UpdatedAt = GETDATE()
    WHERE MenuKey = 'IT_DASHBOARD';

    UPDATE dbo.Menus
    SET
        MenuName = 'Asset Management',
        Route = '/it-assets/assets',
        Icon = 'devices',
        ParentMenuId = @ItRootMenuId,
        VisibilityStatusId = @EnabledStatusId,
        IsCollapsible = 0,
        SortOrder = 20,
        UpdatedAt = GETDATE()
    WHERE MenuKey = 'IT_ASSET_MANAGEMENT';

    UPDATE dbo.Menus
    SET
        MenuName = 'Maintenance',
        Route = '/it-assets/maintenance',
        Icon = 'build',
        ParentMenuId = @ItRootMenuId,
        VisibilityStatusId = @EnabledStatusId,
        IsCollapsible = 0,
        SortOrder = 70,
        UpdatedAt = GETDATE()
    WHERE MenuKey = 'IT_MAINTENANCE';

    UPDATE dbo.Menus
    SET
        MenuName = 'Reports',
        Route = '/it-assets/reports',
        Icon = 'assessment',
        ParentMenuId = @ItRootMenuId,
        VisibilityStatusId = @EnabledStatusId,
        IsCollapsible = 0,
        SortOrder = 90,
        UpdatedAt = GETDATE()
    WHERE MenuKey = 'IT_REPORTS';

    ------------------------------------------------------------
    -- Hide old IT menus not used in current IT Asset phase
    ------------------------------------------------------------

    UPDATE dbo.Menus
    SET
        VisibilityStatusId = @HiddenStatusId,
        UpdatedAt = GETDATE()
    WHERE MenuKey IN (
        'IT_SERVICE_DESK',
        'IT_INVENTORY',
        'IT_SETTINGS'
    );

    ------------------------------------------------------------
    -- Insert missing child menus
    ------------------------------------------------------------

    IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ASSIGNMENTS')
    BEGIN
        INSERT INTO dbo.Menus
        (
            WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName,
            Route, Icon, PermissionId, FeatureFlagId, BadgeQueryKey,
            VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt
        )
        VALUES
        (
            1, @ItModuleId, @ItRootMenuId, 'IT_ASSIGNMENTS', 'Assignments',
            '/it-assets/assignments', 'assignment_ind', NULL, NULL, NULL,
            @EnabledStatusId, 0, 0, 30, GETDATE()
        );
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_BORROW_RETURN')
    BEGIN
        INSERT INTO dbo.Menus
        (
            WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName,
            Route, Icon, PermissionId, FeatureFlagId, BadgeQueryKey,
            VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt
        )
        VALUES
        (
            1, @ItModuleId, @ItRootMenuId, 'IT_BORROW_RETURN', 'Borrow & Return',
            '/it-assets/borrow', 'laptop_chromebook', NULL, NULL, NULL,
            @EnabledStatusId, 0, 0, 40, GETDATE()
        );
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_TRANSFERS')
    BEGIN
        INSERT INTO dbo.Menus
        (
            WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName,
            Route, Icon, PermissionId, FeatureFlagId, BadgeQueryKey,
            VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt
        )
        VALUES
        (
            1, @ItModuleId, @ItRootMenuId, 'IT_TRANSFERS', 'Transfers',
            '/it-assets/transfers', 'swap_horiz', NULL, NULL, NULL,
            @EnabledStatusId, 0, 0, 50, GETDATE()
        );
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_ISSUES')
    BEGIN
        INSERT INTO dbo.Menus
        (
            WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName,
            Route, Icon, PermissionId, FeatureFlagId, BadgeQueryKey,
            VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt
        )
        VALUES
        (
            1, @ItModuleId, @ItRootMenuId, 'IT_ISSUES', 'Issues',
            '/it-assets/issues', 'report_problem', NULL, NULL, NULL,
            @EnabledStatusId, 0, 0, 60, GETDATE()
        );
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = 'IT_DISPOSALS')
    BEGIN
        INSERT INTO dbo.Menus
        (
            WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName,
            Route, Icon, PermissionId, FeatureFlagId, BadgeQueryKey,
            VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt
        )
        VALUES
        (
            1, @ItModuleId, @ItRootMenuId, 'IT_DISPOSALS', 'Disposals',
            '/it-assets/disposals', 'delete_outline', NULL, NULL, NULL,
            @EnabledStatusId, 0, 0, 80, GETDATE()
        );
    END

    ------------------------------------------------------------
    -- Final verification
    ------------------------------------------------------------

    SELECT
        MenuId,
        ParentMenuId,
        MenuKey,
        MenuName,
        Route,
        Icon,
        VisibilityStatusId,
        IsCollapsible,
        SortOrder
    FROM dbo.Menus
    WHERE MenuKey LIKE 'IT_%'
    ORDER BY
        CASE WHEN MenuKey = 'IT_OPERATIONS_ROOT' THEN 0 ELSE 1 END,
        SortOrder;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    SELECT
        ERROR_NUMBER() AS ErrorNumber,
        ERROR_MESSAGE() AS ErrorMessage,
        ERROR_LINE() AS ErrorLine;
END CATCH;