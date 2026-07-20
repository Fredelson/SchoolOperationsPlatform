SET NOCOUNT ON;

PRINT N'=== Granting PlatformAdmin User Access Permissions ===';

DECLARE @PlatformAdminRoleId int = (
  SELECT TOP 1 RoleId FROM dbo.Roles WHERE RoleKey = 'PlatformAdmin' AND IsActive = 1
);

IF @PlatformAdminRoleId IS NULL
BEGIN
  PRINT N'PlatformAdmin role not found.';
  RETURN;
END;

PRINT N'PlatformAdmin RoleId: ' + CAST(@PlatformAdminRoleId AS nvarchar(50));

DECLARE @PermissionKeys TABLE (PermissionKey nvarchar(150));
INSERT INTO @PermissionKeys (PermissionKey)
VALUES
  ('role-permissions.view'),
  ('role-permissions.create'),
  ('role-permissions.update'),
  ('role-permissions.delete'),
  ('users.view'),
  ('users.create'),
  ('users.update'),
  ('users.activate'),
  ('users.deactivate'),
  ('users.import'),
  ('access-levels.view'),
  ('access-levels.create'),
  ('access-levels.update'),
  ('access-levels.delete'),
  ('assignments.view'),
  ('assignments.create'),
  ('assignments.update'),
  ('assignments.delete');

DECLARE @Inserted int = 0;

INSERT INTO dbo.RolePermissions (RoleId, PermissionId, IsAllowed, CreatedAt)
SELECT 
  @PlatformAdminRoleId,
  p.PermissionId,
  1,
  GETDATE()
FROM dbo.Permissions p
INNER JOIN @PermissionKeys pk ON pk.PermissionKey = p.PermissionKey
LEFT JOIN dbo.RolePermissions rp ON rp.RoleId = @PlatformAdminRoleId AND rp.PermissionId = p.PermissionId
WHERE p.IsActive = 1
  AND rp.RolePermissionId IS NULL;

SET @Inserted = @@ROWCOUNT;

PRINT N'Inserted ' + CAST(@Inserted AS nvarchar(50)) + ' new role permissions for PlatformAdmin.';

SELECT 
  r.RoleName,
  p.PermissionKey,
  p.PermissionName,
  rp.IsAllowed,
  rp.CreatedAt
FROM dbo.RolePermissions rp
INNER JOIN dbo.Roles r ON r.RoleId = rp.RoleId
INNER JOIN dbo.Permissions p ON p.PermissionId = rp.PermissionId
WHERE rp.RoleId = @PlatformAdminRoleId
  AND p.PermissionKey IN (
    'role-permissions.view',
    'role-permissions.create',
    'role-permissions.update',
    'role-permissions.delete',
    'users.view',
    'users.create',
    'users.update',
    'users.activate',
    'users.deactivate',
    'users.import',
    'access-levels.view',
    'access-levels.create',
    'access-levels.update',
    'access-levels.delete',
    'assignments.view',
    'assignments.create',
    'assignments.update',
    'assignments.delete'
  )
ORDER BY p.PermissionKey;
