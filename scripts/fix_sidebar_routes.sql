-- Fix sidebar routes after module cleanup

-- 1. Remap old super-admin it-assets paths
UPDATE dbo.Menus
SET Route = REPLACE(Route, '/super-admin/it-assets/', '/it-assets/')
WHERE Route LIKE '/super-admin/it-assets/%';

UPDATE dbo.Menus
SET Route = '/it-assets'
WHERE Route = '/super-admin/it-assets';

-- 2. Remap old super-admin printing paths
UPDATE dbo.Menus
SET Route = REPLACE(Route, '/super-admin/printing/', '/printing/')
WHERE Route LIKE '/super-admin/printing/%';

UPDATE dbo.Menus
SET Route = '/printing'
WHERE Route = '/super-admin/printing';

-- 3. Hide menu items for routes that no longer exist in the frontend
UPDATE dbo.Menus
SET Route = NULL,
    VisibilityStatusId = (
      SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'hidden'
    )
WHERE Route IN (
  '/super-admin/school-configuration/access-levels',
  '/super-admin/permission-groups',
  '/printing/queue',
  '/printing/reports',
  '/printing/settings',
  '/printing/requests',
  '/super-admin/academic-years',
  '/super-admin/classes',
  '/super-admin/terms',
  '/system/health',
  '/system/archive',
  '/system/forms',
  '/system/global-search',
  '/system/documents',
  '/system/workflows',
  '/id-management/card-printing',
  '/id-management/dashboard',
  '/id-management/qr-barcode',
  '/id-management/reports',
  '/id-management/settings',
  '/id-management/templates',
  '/id-management/staff-ids',
  '/id-management/student-ids',
  '/id-management/visitor-ids',
  '/it/inventory',
  '/it/service-desk',
  '/it/settings',
  '/hr/employees',
  '/hr/attendance',
  '/hr/leave',
  '/hr/performance',
  '/hr/dashboard',
  '/hr/reports',
  '/academic/reports',
  '/academic/assessments',
  '/academic/attendance',
  '/academic/examinations',
  '/academic/students',
  '/academic/classes',
  '/academic/dashboard',
  '/communication/announcements',
  '/communication/circulars',
  '/communication/templates',
  '/communication/emails',
  '/communication/notifications',
  '/communication/sms',
  '/communication/dashboard',
  '/observations/walkthroughs',
  '/observations/reports',
  '/observations/teacher',
  '/observations/dashboard',
  '/facilities/buildings',
  '/facilities/dashboard',
  '/facilities/maintenance',
  '/facilities/reservations',
  '/facilities/rooms',
  '/reports/custom',
  '/reports/executive',
  '/reports/export',
  '/reports/academic',
  '/reports/communication',
  '/reports/hr',
  '/reports/id-management',
  '/reports/it',
  '/reports/printing'
);

-- 4. Clear ParentMenuId for orphaned children whose parent route was hidden
UPDATE m
SET m.ParentMenuId = NULL
FROM dbo.Menus m
LEFT JOIN dbo.Menus parent ON parent.MenuId = m.ParentMenuId
WHERE parent.Route IS NULL
  AND m.ParentMenuId IS NOT NULL;

-- 5. Ensure Assignment Types, User Assignments, and User Permission Overrides are visible and routed
UPDATE dbo.Menus
SET Route = '/super-admin/assignment-types',
    VisibilityStatusId = (
      SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Enabled'
    )
WHERE MenuId = 49;

UPDATE dbo.Menus
SET Route = '/super-admin/user-assignments',
    VisibilityStatusId = (
      SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Enabled'
    )
WHERE MenuId = 50;

UPDATE dbo.Menus
SET MenuName = 'User Permission Overrides',
    Route = '/super-admin/user-permission-overrides',
    VisibilityStatusId = (
      SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Enabled'
    )
WHERE MenuId = 149;

-- 6. Ensure WorkspaceMenus entries are visible and enabled for restored pages
UPDATE dbo.WorkspaceMenus
SET IsVisible = 1, IsEnabled = 1
WHERE MenuId IN (49, 50, 149);

-- 7. Create missing WorkspaceMenus entries if they don't exist for workspace 1
IF NOT EXISTS (SELECT 1 FROM dbo.WorkspaceMenus WHERE WorkspaceId = 1 AND MenuId = 49)
  INSERT INTO dbo.WorkspaceMenus (WorkspaceId, MenuId, IsVisible, IsEnabled, SortOrder, CreatedAt, UpdatedAt)
  VALUES (1, 49, 1, 1, 0, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT 1 FROM dbo.WorkspaceMenus WHERE WorkspaceId = 1 AND MenuId = 50)
  INSERT INTO dbo.WorkspaceMenus (WorkspaceId, MenuId, IsVisible, IsEnabled, SortOrder, CreatedAt, UpdatedAt)
  VALUES (1, 50, 1, 1, 0, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT 1 FROM dbo.WorkspaceMenus WHERE WorkspaceId = 1 AND MenuId = 149)
  INSERT INTO dbo.WorkspaceMenus (WorkspaceId, MenuId, IsVisible, IsEnabled, SortOrder, CreatedAt, UpdatedAt)
  VALUES (1, 149, 1, 1, 0, GETDATE(), GETDATE());
