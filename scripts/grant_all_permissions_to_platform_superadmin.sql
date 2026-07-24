-- ============================================
-- Grant ALL permissions to PlatformAdmin (RoleId 3)
-- and SuperAdmin (RoleId 4)
-- ============================================
-- This script ensures both roles have every
-- active permission in the system.
-- ============================================

-- Grant all active permissions to PlatformAdmin (RoleId 3)
INSERT [dbo].[RolePermissions] ([RoleId], [PermissionId], [IsAllowed], [CreatedAt])
SELECT 3, p.PermissionId, 1, GETDATE()
FROM dbo.Permissions p
WHERE p.IsActive = 1
  AND NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions rp
    WHERE rp.RoleId = 3 AND rp.PermissionId = p.PermissionId
  );

-- Grant all active permissions to SuperAdmin (RoleId 4)
INSERT [dbo].[RolePermissions] ([RoleId], [PermissionId], [IsAllowed], [CreatedAt])
SELECT 4, p.PermissionId, 1, GETDATE()
FROM dbo.Permissions p
WHERE p.IsActive = 1
  AND NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions rp
    WHERE rp.RoleId = 4 AND rp.PermissionId = p.PermissionId
  );

-- ============================================
-- Verification
-- ============================================

SELECT
  r.RoleName,
  COUNT(rp.RolePermissionId) AS PermissionCount
FROM dbo.Roles r
LEFT JOIN dbo.RolePermissions rp ON rp.RoleId = r.RoleId AND rp.IsAllowed = 1
WHERE r.RoleId IN (3, 4)
GROUP BY r.RoleName
ORDER BY r.RoleName;

GO
