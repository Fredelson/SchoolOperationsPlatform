-- ============================================================
-- MIGRATION: Fix Permission Simplification
-- Date: 2026-07-21
-- Purpose:
--  1. Fix schema (missing GroupKey/GroupName)
--  2. Deactivate ONLY the 37 confirmed-unused permissions
--  3. Grant all active permissions to SuperAdmin/PlatformAdmin
--  4. Grant only 3 workspace permissions to other roles
-- ============================================================

-- ============================================================
-- STEP 1: Fix schema
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
-- STEP 2: Grant ALL active permissions to SuperAdmin + PlatformAdmin
-- ============================================================

INSERT INTO dbo.RolePermissions (RoleId, PermissionId, IsAllowed, CreatedAt)
SELECT 
  r.RoleId,
  p.PermissionId,
  1,
  GETDATE()
FROM dbo.Roles r
CROSS JOIN dbo.Permissions p
WHERE r.RoleKey IN ('SuperAdmin', 'PlatformAdmin')
  AND p.IsActive = 1
  AND NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions rp 
    WHERE rp.RoleId = r.RoleId AND rp.PermissionId = p.PermissionId
  );

-- ============================================================
-- STEP 3: Grant workspace permissions + configure to non-admin roles
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
    'workspace.disable',
    'workspace.configure'
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
-- STEP 4: Deactivate ONLY the 37 confirmed-unused permissions
-- ============================================================

UPDATE dbo.Permissions 
SET IsActive = 0 
WHERE PermissionId IN (
  2,    -- lookups.view
  12,   -- it_assets.reports.view
  13,   -- it_assets.tags.print (legacy)
  14,   -- it_assets.import.manage
  17,   -- access-levels.create
  18,   -- access-levels.update
  19,   -- access-levels.delete
  22,   -- user-assignments.create
  23,   -- user-assignments.update
  24,   -- user-assignments.delete
  25,   -- user-permission-overrides.view
  26,   -- user-permission-overrides.create
  27,   -- user-permission-overrides.update
  28,   -- user-permission-overrides.delete
  29,   -- assignment-types.create
  30,   -- assignment-types.update
  31,   -- assignment-types.delete
  34,   -- permissions.view
  35,   -- permission-groups.view
  36,   -- role-permissions.view
  41,   -- printing.distributions.view
  42,   -- printing.master-data.view
  43,   -- printing.access-levels.view
  45,   -- workspace.live_as_user (legacy)
  47,   -- workspace.preview (legacy)
  49,   -- workspace.hod.use
  50,   -- workspace.hos.use
  51,   -- workspace.teacher.use
  73,   -- library.books.create
  74,   -- library.books.update
  75,   -- library.books.delete
  78,   -- library.members.manage
  85,   -- library.overdue.view
  86,   -- library.inventory.manage
  87,   -- library.reports.view
  88,   -- library.settings.manage
  90,   -- AuditLog.View
  91,   -- Branding.View
  92,   -- Button.View
  93,   -- SuperAdmin.Dashboard.View
  94,   -- FeatureFlag.View
  95,   -- Menu.View
  96,   -- Module.View
  97,   -- Navigation.View
  98,   -- SystemSettings.View
  99,   -- Widget.View
  100,  -- workspace.admin.use
  101,  -- workspace.clinic.use
  102,  -- workspace.deputy_head.use
  103,  -- workspace.homeroom.use
  104,  -- workspace.operations.use
  105,  -- workspace.year_leader.use
  112,  -- asset_tag_branding.manage
  113,  -- asset_tag_branding.view
  114,  -- asset_tags.rectangular.print
  115,  -- asset_tags.rectangular.view
  116,  -- asset_tags.rounded.print
  117,  -- asset_tags.rounded.view
  130,  -- asset_tag_branding.rectangular.manage
  131,  -- asset_tag_branding.rectangular.view
  132,  -- asset_tag_branding.rounded.manage
  133   -- asset_tag_branding.rounded.view
);

-- ============================================================
-- STEP 5: Clean up orphaned RolePermissions for deactivated perms
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
