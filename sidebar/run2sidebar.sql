/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   Add Asset Tag Printer to IT Operations Sidebar
========================================================= */

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @WorkspaceId INT = 1;
    DECLARE @ModuleId INT = 6;
    DECLARE @ParentMenuId INT = 188;

    /* ---------------------------------------------------------
       Insert only when the menu does not already exist
    --------------------------------------------------------- */

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.Menus
        WHERE MenuKey = N'IT_ASSET_TAG_PRINTER'
           OR Route = N'/it-assets/asset-tag-printer'
    )
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
            @WorkspaceId,
            @ModuleId,
            @ParentMenuId,
            N'IT_ASSET_TAG_PRINTER',
            N'Asset Tag Printer',
            N'/it-assets/asset-tag-printer',
            N'qr_code_2',
            NULL,
            NULL,
            NULL,
            1,
            0,
            0,
            85,
            GETDATE(),
            NULL
        );
    END
    ELSE
    BEGIN
        UPDATE dbo.Menus
        SET
            WorkspaceId = @WorkspaceId,
            ModuleId = @ModuleId,
            ParentMenuId = @ParentMenuId,
            MenuName = N'Asset Tag Printer',
            Route = N'/it-assets/asset-tag-printer',
            Icon = N'qr_code_2',
            VisibilityStatusId = 1,
            IsPinned = 0,
            IsCollapsible = 0,
            SortOrder = 85,
            UpdatedAt = GETDATE()
        WHERE MenuKey = N'IT_ASSET_TAG_PRINTER'
           OR Route = N'/it-assets/asset-tag-printer';
    END;

    COMMIT TRANSACTION;

    SELECT
        MenuId,
        WorkspaceId,
        ModuleId,
        ParentMenuId,
        MenuKey,
        MenuName,
        Route,
        Icon,
        PermissionId,
        VisibilityStatusId,
        SortOrder
    FROM dbo.Menus
    WHERE MenuKey = N'IT_ASSET_TAG_PRINTER';

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;