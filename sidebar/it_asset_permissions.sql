SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

DECLARE @ModuleId INT = (
  SELECT TOP 1 ModuleId FROM dbo.Modules WHERE ModuleKey = N'it_operations'
);

IF @ModuleId IS NULL
  THROW 50001, 'IT Operations module is missing.', 1;

DECLARE @Permissions TABLE (PermissionKey NVARCHAR(200), PermissionName NVARCHAR(255));
INSERT INTO @Permissions VALUES
  (N'it_assets.dashboard.view', N'View IT Asset Dashboard'),
  (N'it_assets.assets.view', N'View IT Assets'),
  (N'it_assets.assignment.manage', N'Manage IT Asset Assignments'),
  (N'it_assets.borrow.manage', N'Manage IT Asset Borrowing and Returns'),
  (N'it_assets.transfer.manage', N'Manage IT Asset Transfers'),
  (N'it_assets.issues.manage', N'Manage IT Asset Issues'),
  (N'it_assets.maintenance.manage', N'Manage IT Asset Maintenance'),
  (N'it_assets.disposal.manage', N'Manage IT Asset Disposals'),
  (N'it_assets.reports.view', N'View and Export IT Asset Reports'),
  (N'it_assets.tags.print', N'Print IT Asset Tags'),
  (N'it_assets.import.manage', N'Import IT Assets');

INSERT INTO dbo.Permissions
  (PermissionKey, PermissionName, ModuleId, Description, IsActive, CreatedAt)
SELECT source.PermissionKey, source.PermissionName, @ModuleId,
  N'IT Operations permission.', 1, GETDATE()
FROM @Permissions source
WHERE NOT EXISTS (
  SELECT 1 FROM dbo.Permissions existing WHERE existing.PermissionKey = source.PermissionKey
);

UPDATE permission
SET permission.IsActive = 1,
    permission.ModuleId = @ModuleId,
    permission.UpdatedAt = GETDATE()
FROM dbo.Permissions permission
INNER JOIN @Permissions source ON source.PermissionKey = permission.PermissionKey;

INSERT INTO dbo.RolePermissions (RoleId, PermissionId, IsAllowed, CreatedAt)
SELECT role.RoleId, permission.PermissionId, 1, GETDATE()
FROM dbo.Roles role
CROSS JOIN dbo.Permissions permission
WHERE role.RoleKey IN (N'SuperAdmin', N'PlatformAdmin')
  AND permission.PermissionKey IN (SELECT PermissionKey FROM @Permissions)
  AND NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions existing
    WHERE existing.RoleId = role.RoleId AND existing.PermissionId = permission.PermissionId
  );

UPDATE rolePermission
SET rolePermission.IsAllowed = 1
FROM dbo.RolePermissions rolePermission
INNER JOIN dbo.Roles role ON role.RoleId = rolePermission.RoleId
INNER JOIN dbo.Permissions permission ON permission.PermissionId = rolePermission.PermissionId
WHERE role.RoleKey IN (N'SuperAdmin', N'PlatformAdmin')
  AND permission.PermissionKey IN (SELECT PermissionKey FROM @Permissions);

COMMIT TRANSACTION;
