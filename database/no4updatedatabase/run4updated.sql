USE OperationsPlatformDB;
GO

BEGIN TRANSACTION;

UPDATE dbo.Menus
SET Route = '/super-admin/modules'
WHERE MenuKey = 'MODULE_MANAGER';

UPDATE dbo.Menus
SET Route = '/system/branding'
WHERE MenuKey = 'BRANDING_THEME';

SELECT
    MenuId,
    MenuKey,
    MenuName,
    Route
FROM dbo.Menus
WHERE MenuKey IN (
    'MODULE_MANAGER',
    'BRANDING_THEME'
);

COMMIT TRANSACTION;