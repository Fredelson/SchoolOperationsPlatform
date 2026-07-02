DECLARE @RoleId INT;
DECLARE @PermissionId INT;
DECLARE @ModuleId INT;

-- Use Super Admin module
SELECT @ModuleId = ModuleId
FROM dbo.Modules
WHERE ModuleKey = 'super_admin';

-- Get SuperAdmin role
SELECT @RoleId = RoleId
FROM dbo.Roles
WHERE RoleKey = 'SuperAdmin';

-- Get existing lookup permission
SELECT @PermissionId = PermissionId
FROM dbo.Permissions
WHERE PermissionKey = 'lookups.view';

-- Create permission if missing
IF @PermissionId IS NULL
BEGIN
    INSERT INTO dbo.Permissions
    (
        PermissionKey,
        PermissionName,
        ModuleId,
        Description
    )
    VALUES
    (
        'lookups.view',
        'View Lookups',
        @ModuleId,
        'Allows access to platform lookup/reference dropdown data.'
    );

    SET @PermissionId = SCOPE_IDENTITY();
END;

-- Assign permission to SuperAdmin if missing
IF NOT EXISTS (
    SELECT 1
    FROM dbo.RolePermissions
    WHERE RoleId = @RoleId
      AND PermissionId = @PermissionId
)
BEGIN
    INSERT INTO dbo.RolePermissions
    (
        RoleId,
        PermissionId
    )
    VALUES
    (
        @RoleId,
        @PermissionId
    );
END;

-- Verify
SELECT
    r.RoleKey,
    p.PermissionKey,
    p.PermissionName,
    rp.IsAllowed
FROM dbo.RolePermissions rp
INNER JOIN dbo.Roles r ON r.RoleId = rp.RoleId
INNER JOIN dbo.Permissions p ON p.PermissionId = rp.PermissionId
WHERE r.RoleKey = 'SuperAdmin'
  AND p.PermissionKey = 'lookups.view';