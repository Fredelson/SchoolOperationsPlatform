-- ============================================================
-- ARAB UNITY SCHOOL OPERATIONS PLATFORM
-- Simplified Permission Schema
-- Date: 2026-07-22
-- Purpose: Clean schema after removing 95 module-specific permissions
-- ============================================================

-- ============================================================
-- 1. MENU AND BUTTON PERMISSIONS - CLEANUP FIRST
-- ============================================================

-- Remove menu permission references to deleted permissions BEFORE deleting permissions
UPDATE dbo.Menus
SET PermissionId = NULL
WHERE PermissionId IS NOT NULL
  AND PermissionId NOT IN (SELECT PermissionId FROM dbo.Permissions WHERE IsActive = 1);

UPDATE dbo.Buttons
SET PermissionId = NULL
WHERE PermissionId IS NOT NULL
  AND PermissionId NOT IN (SELECT PermissionId FROM dbo.Permissions WHERE IsActive = 1);

UPDATE dbo.Widgets
SET PermissionId = NULL
WHERE PermissionId IS NOT NULL
  AND PermissionId NOT IN (SELECT PermissionId FROM dbo.Permissions WHERE IsActive = 1);

-- ============================================================
-- 2. PERMISSIONS TABLE - CLEANUP
-- ============================================================

-- Delete all deactivated permissions that are no longer needed
-- Keep only the core active permissions in the database
DELETE FROM dbo.Permissions 
WHERE IsActive = 0
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
-- 3. ROLE PERMISSIONS - CLEANUP
-- ============================================================

-- Remove any role permissions pointing to deleted permissions
DELETE rp
FROM dbo.RolePermissions rp
LEFT JOIN dbo.Permissions p ON rp.PermissionId = p.PermissionId
WHERE p.PermissionId IS NULL;

-- ============================================================
-- 4. USER PERMISSION OVERRIDES - CLEANUP
-- ============================================================

-- Remove any user permission overrides pointing to deleted permissions
DELETE upo
FROM dbo.UserPermissionOverrides upo
LEFT JOIN dbo.Permissions p ON upo.PermissionId = p.PermissionId
WHERE p.PermissionId IS NULL;

-- ============================================================
-- 5. ASSIGNMENT TYPE WORKSPACES - CLEANUP
-- ============================================================

-- Remove orphaned assignment type workspace mappings
DELETE atw
FROM dbo.AssignmentTypeWorkspaces atw
LEFT JOIN dbo.AssignmentTypes at ON atw.AssignmentTypeId = at.AssignmentTypeId
WHERE at.AssignmentTypeId IS NULL;

-- ============================================================
-- 6. VERIFICATION QUERIES
-- ============================================================

-- Show active permissions
SELECT 
  PermissionId,
  PermissionKey,
  PermissionName,
  GroupKey,
  GroupName,
  IsActive
FROM dbo.Permissions
WHERE IsActive = 1
ORDER BY GroupName, PermissionKey;

-- Show role permission counts
SELECT 
  r.RoleName,
  COUNT(rp.RolePermissionId) AS ActivePermissionCount
FROM dbo.Roles r
LEFT JOIN dbo.RolePermissions rp ON rp.RoleId = r.RoleId AND rp.IsAllowed = 1
LEFT JOIN dbo.Permissions p ON p.PermissionId = rp.PermissionId AND p.IsActive = 1
GROUP BY r.RoleName
ORDER BY r.RoleName;

-- Show any orphaned role permissions
SELECT 
  rp.RolePermissionId,
  rp.RoleId,
  rp.PermissionId
FROM dbo.RolePermissions rp
LEFT JOIN dbo.Permissions p ON rp.PermissionId = p.PermissionId
WHERE p.PermissionId IS NULL;

-- Show any orphaned user permission overrides
SELECT 
  upo.UserPermissionOverrideId,
  upo.UserId,
  upo.PermissionId
FROM dbo.UserPermissionOverrides upo
LEFT JOIN dbo.Permissions p ON upo.PermissionId = p.PermissionId
WHERE p.PermissionId IS NULL;
