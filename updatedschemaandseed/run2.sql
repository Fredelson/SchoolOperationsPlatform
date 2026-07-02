USE OperationsPlatformDB;
GO

BEGIN TRANSACTION;

BEGIN TRY
    DECLARE @EnabledStatusId INT;

    SELECT @EnabledStatusId = VisibilityStatusId
    FROM dbo.FeatureVisibilityStatuses
    WHERE StatusKey = 'Enabled';

    IF @EnabledStatusId IS NULL
        THROW 50001, 'Enabled visibility status not found.', 1;

    ------------------------------------------------------------
    -- STEP 1: NORMALIZE SIDEBAR GROUPS
    ------------------------------------------------------------

    UPDATE dbo.MenuGroups
    SET
        GroupKey = 'MAIN',
        GroupName = 'Main',
        SortOrder = 10,
        VisibilityStatusId = @EnabledStatusId,
        UpdatedAt = GETDATE()
    WHERE GroupKey = 'MAIN';

    UPDATE dbo.MenuGroups
    SET
        GroupKey = 'PLATFORM_FOUNDATION',
        GroupName = 'Platform Foundation',
        SortOrder = 20,
        VisibilityStatusId = @EnabledStatusId,
        UpdatedAt = GETDATE()
    WHERE GroupKey = 'DEVELOPER_PLATFORM';

    UPDATE dbo.MenuGroups
    SET
        GroupKey = 'USER_ACCESS',
        GroupName = 'User & Access',
        SortOrder = 30,
        VisibilityStatusId = @EnabledStatusId,
        UpdatedAt = GETDATE()
    WHERE GroupKey = 'IDENTITY_ACCESS';

    UPDATE dbo.MenuGroups
    SET
        GroupKey = 'SCHOOL_CONFIGURATION',
        GroupName = 'School Configuration',
        SortOrder = 40,
        VisibilityStatusId = @EnabledStatusId,
        UpdatedAt = GETDATE()
    WHERE GroupKey = 'ORGANIZATION';

    UPDATE dbo.MenuGroups
    SET
        GroupKey = 'OPERATIONS',
        GroupName = 'Operations',
        SortOrder = 50,
        VisibilityStatusId = @EnabledStatusId,
        UpdatedAt = GETDATE()
    WHERE GroupKey = 'OPERATIONS';

    UPDATE dbo.MenuGroups
    SET
        GroupKey = 'REPORTS_ANALYTICS',
        GroupName = 'Reports & Analytics',
        SortOrder = 60,
        VisibilityStatusId = @EnabledStatusId,
        UpdatedAt = GETDATE()
    WHERE GroupKey = 'REPORTS_ANALYTICS';

    UPDATE dbo.MenuGroups
    SET
        GroupKey = 'SYSTEM',
        GroupName = 'System',
        SortOrder = 70,
        VisibilityStatusId = @EnabledStatusId,
        UpdatedAt = GETDATE()
    WHERE GroupKey = 'SECURITY';

    UPDATE dbo.MenuGroups
    SET
        GroupKey = 'PLATFORM',
        GroupName = 'Platform',
        SortOrder = 80,
        VisibilityStatusId = @EnabledStatusId,
        UpdatedAt = GETDATE()
    WHERE GroupKey = 'SYSTEM_CONFIGURATION';

    ------------------------------------------------------------
    -- STEP 2: VERIFY RESULT
    ------------------------------------------------------------

    SELECT
        MenuGroupId,
        WorkspaceId,
        GroupKey,
        GroupName,
        VisibilityStatusId,
        SortOrder
    FROM dbo.MenuGroups
    ORDER BY SortOrder;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    SELECT
        ERROR_NUMBER() AS ErrorNumber,
        ERROR_MESSAGE() AS ErrorMessage,
        ERROR_LINE() AS ErrorLine;
END CATCH;