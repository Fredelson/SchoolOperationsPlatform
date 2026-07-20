SET NOCOUNT ON;

IF NOT EXISTS (
  SELECT 1 FROM dbo.RolePermissions
  WHERE RoleId = 3 AND PermissionId = 113
)
BEGIN
  INSERT INTO dbo.RolePermissions (RoleId, PermissionId, IsAllowed, CreatedAt)
  VALUES (3, 113, 1, GETDATE());
END;

IF NOT EXISTS (
  SELECT 1 FROM dbo.RolePermissions
  WHERE RoleId = 3 AND PermissionId = 112
)
BEGIN
  INSERT INTO dbo.RolePermissions (RoleId, PermissionId, IsAllowed, CreatedAt)
  VALUES (3, 112, 1, GETDATE());
END;

IF NOT EXISTS (
  SELECT 1 FROM dbo.RolePermissions
  WHERE RoleId = 3 AND PermissionId = 131
)
BEGIN
  INSERT INTO dbo.RolePermissions (RoleId, PermissionId, IsAllowed, CreatedAt)
  VALUES (3, 131, 1, GETDATE());
END;

IF NOT EXISTS (
  SELECT 1 FROM dbo.RolePermissions
  WHERE RoleId = 3 AND PermissionId = 130
)
BEGIN
  INSERT INTO dbo.RolePermissions (RoleId, PermissionId, IsAllowed, CreatedAt)
  VALUES (3, 130, 1, GETDATE());
END;

IF NOT EXISTS (
  SELECT 1 FROM dbo.RolePermissions
  WHERE RoleId = 3 AND PermissionId = 133
)
BEGIN
  INSERT INTO dbo.RolePermissions (RoleId, PermissionId, IsAllowed, CreatedAt)
  VALUES (3, 133, 1, GETDATE());
END;

IF NOT EXISTS (
  SELECT 1 FROM dbo.RolePermissions
  WHERE RoleId = 3 AND PermissionId = 132
)
BEGIN
  INSERT INTO dbo.RolePermissions (RoleId, PermissionId, IsAllowed, CreatedAt)
  VALUES (3, 132, 1, GETDATE());
END;

PRINT N'PlatformAdmin asset tag branding permissions ensured.';
