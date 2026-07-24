-- ============================================================
-- MIGRATION: Simplify Permission Model
-- Date: 2026-07-21
-- Purpose: Reduce 95 active permissions to ~15 core permissions
-- ============================================================

-- ============================================================
-- STEP 1: Fix schema - add missing columns
-- ============================================================

IF NOT EXISTS (
  SELECT 1 FROM sys.columns 
  WHERE object_id = OBJECT_ID('dbo.Permissions') 
  AND name = 'GroupKey'
)
BEGIN
  ALTER TABLE dbo.Permissions ADD 
    GroupKey nvarchar(100) NOT NULL DEFAULT 'platform',
    GroupName nvarchar(150) NOT NULL DEFAULT 'Platform';
END;

-- ============================================================
-- STEP 2: Deactivate ALL module-specific permissions
-- Keep only global admin permissions active
-- ============================================================

UPDATE dbo.Permissions 
SET IsActive = 0 
WHERE IsActive = 1
  AND PermissionKey NOT IN (
    'platform_admin.dashboard.view',
    'super_admin.dashboard.view',
    'workspace.configure',
    'workspace.view',
    'workspace.activate',
    'workspace.disable',
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'roles.view',
    'roles.create',
    'roles.update',
    'roles.delete',
    'modules.view',
    'modules.create',
    'modules.update',
    'modules.delete',
    'menus.view',
    'menus.create',
    'menus.update',
    'menus.delete',
    'system_settings.view',
    'system_settings.update',
    'audit_logs.view'
  );

-- ============================================================
-- STEP 3: Grant only 3 workspace permissions to all non-admin roles
-- ============================================================

INSERT INTO dbo.RolePermissions (RoleId, PermissionId, IsAllowed, CreatedAt)
SELECT 
  r.RoleId,
  p.PermissionId,
  1,
  GETDATE()
FROM dbo.Roles r
CROSS JOIN (
  SELECT PermissionId FROM dbo.Permissions
  WHERE PermissionKey IN (
    'workspace.view',
    'workspace.activate',
    'workspace.disable'
  )
  AND IsActive = 1
) p
WHERE r.RoleKey NOT IN ('SuperAdmin', 'PlatformAdmin')
  AND r.IsActive = 1
  AND NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions rp 
    WHERE rp.RoleId = r.RoleId AND rp.PermissionId = p.PermissionId
  );

-- ============================================================
-- STEP 4: Clean up orphaned RolePermissions for module perms
-- ============================================================

DELETE rp FROM dbo.RolePermissions rp
INNER JOIN dbo.Permissions p ON rp.PermissionId = p.PermissionId
WHERE p.IsActive = 0;

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT 
  COUNT(*) AS ActivePermissions,
  SUM(CASE WHEN PermissionKey LIKE 'workspace.%' THEN 1 ELSE 0 END) AS WorkspacePerms,
  SUM(CASE WHEN PermissionKey NOT LIKE 'workspace.%' THEN 1 ELSE 0 END) AS AdminPerms
FROM dbo.Permissions 
WHERE IsActive = 1;

SELECT 
  r.RoleName,
  COUNT(rp.RolePermissionId) AS PermissionCount
FROM dbo.Roles r
LEFT JOIN dbo.RolePermissions rp ON rp.RoleId = r.RoleId AND rp.IsAllowed = 1
GROUP BY r.RoleName
ORDER BY r.RoleName;
