USE OperationsPlatformDB;
GO

BEGIN TRANSACTION;

BEGIN TRY
    ------------------------------------------------------------
    -- Remove duplicate seeded dashboard from sidebar groups
    ------------------------------------------------------------
    DELETE mgi
    FROM dbo.MenuGroupItems mgi
    INNER JOIN dbo.Menus m ON m.MenuId = mgi.MenuId
    WHERE m.MenuKey = 'MAIN_DASHBOARD';

    ------------------------------------------------------------
    -- Hide duplicate seeded dashboard menu
    ------------------------------------------------------------
    UPDATE dbo.Menus
    SET
        VisibilityStatusId = 2,
        UpdatedAt = GETDATE()
    WHERE MenuKey = 'MAIN_DASHBOARD';

    ------------------------------------------------------------
    -- Make sure original dashboard is enabled
    ------------------------------------------------------------
    UPDATE dbo.Menus
    SET
        VisibilityStatusId = 1,
        ParentMenuId = NULL,
        IsPinned = 0,
        IsCollapsible = 0,
        UpdatedAt = GETDATE()
    WHERE MenuKey = 'DASHBOARD';

    ------------------------------------------------------------
    -- Verify
    ------------------------------------------------------------
    SELECT
        MenuId,
        MenuKey,
        MenuName,
        Route,
        VisibilityStatusId,
        ParentMenuId
    FROM dbo.Menus
    WHERE MenuKey IN ('DASHBOARD', 'MAIN_DASHBOARD');

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    SELECT
        ERROR_NUMBER() AS ErrorNumber,
        ERROR_MESSAGE() AS ErrorMessage,
        ERROR_LINE() AS ErrorLine;
END CATCH;