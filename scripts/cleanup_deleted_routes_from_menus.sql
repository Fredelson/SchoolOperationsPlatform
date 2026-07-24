-- ============================================================
-- ARAB UNITY SCHOOL OPERATIONS PLATFORM
-- Remove/disable sidebar menu items that point to deleted routes
-- ============================================================

-- Remove menu items whose routes no longer exist in the frontend
UPDATE dbo.Menus
SET Route = NULL,
    VisibilityStatusId = (
      SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'hidden'
    )
WHERE Route IN (
  '/super-admin/navigation-manager',
  '/super-admin/permissions',
  '/super-admin/role-permissions',
  '/super-admin/user-permission-overrides',
  '/super-admin/access-levels',
  '/super-admin/asset-tag-branding',
  '/super-admin/buttons',
  '/super-admin/widgets',
  '/super-admin/feature-flags',
  '/super-admin/assignment-types',
  '/super-admin/user-assignments',
  '/super-admin/printing',
  '/super-admin/it-assets',
  '/it-assets',
  '/printing'
);

-- Also remove any child menus whose parent was just removed
-- by clearing ParentMenuId if the parent route is now NULL
UPDATE m
SET m.ParentMenuId = NULL
FROM dbo.Menus m
LEFT JOIN dbo.Menus parent ON parent.MenuId = m.ParentMenuId
WHERE parent.Route IS NULL
  AND m.ParentMenuId IS NOT NULL;
