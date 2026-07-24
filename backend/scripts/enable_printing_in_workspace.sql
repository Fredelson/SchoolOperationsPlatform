-- enable_printing_in_workspace.sql
-- Usage: edit the @WorkspaceId value below and run against the OperationsPlatform database.
-- This script will ensure Printing Management and its common child menus are visible and enabled
-- for the specified workspace. It also includes an example section to hide other menus.
-- IMPORTANT: review before running in production.

SET NOCOUNT ON;

DECLARE @WorkspaceId INT = 1; -- <-- CHANGE THIS to your target WorkspaceId

-- Ensure parent Printing Management is present in WorkspaceMenus
INSERT INTO dbo.WorkspaceMenus (WorkspaceId, MenuId, IsVisible, IsEnabled, SortOrder)
SELECT @WorkspaceId, m.MenuId, 1, 1, COALESCE(wm.SortOrder, m.SortOrder)
FROM dbo.Menus m
LEFT JOIN dbo.WorkspaceMenus wm ON wm.WorkspaceId = @WorkspaceId AND wm.MenuId = m.MenuId
WHERE (m.Route = '/printing' OR m.MenuKey = 'PRINTING_MANAGEMENT')
  AND NOT EXISTS (
    SELECT 1 FROM dbo.WorkspaceMenus w2 WHERE w2.WorkspaceId = @WorkspaceId AND w2.MenuId = m.MenuId
  );

-- Ensure child printing routes are visible too (requests, approvals, queue, reports, settings, dashboard, paper-stock)
;WITH ChildRoutes AS (
  SELECT MenuId, Route FROM dbo.Menus WHERE Route IN (
    '/printing/dashboard','/printing/requests','/printing/approvals','/printing/queue',
    '/printing/reports','/printing/settings','/printing/paper-stock','/printing/limits','/printing/purchases'
  )
)
INSERT INTO dbo.WorkspaceMenus (WorkspaceId, MenuId, IsVisible, IsEnabled, SortOrder)
SELECT @WorkspaceId, c.MenuId, 1, 1, m.SortOrder
FROM ChildRoutes c
LEFT JOIN dbo.Menus m ON m.MenuId = c.MenuId
WHERE NOT EXISTS (
  SELECT 1 FROM dbo.WorkspaceMenus wm WHERE wm.WorkspaceId = @WorkspaceId AND wm.MenuId = m.MenuId
);

-- Example: hide specific menus in this workspace (UNCOMMENT and edit routes to hide)
-- UPDATE wm
-- SET wm.IsVisible = 0, wm.IsEnabled = 0
-- FROM dbo.WorkspaceMenus wm
-- JOIN dbo.Menus m ON m.MenuId = wm.MenuId
-- WHERE wm.WorkspaceId = @WorkspaceId
--   AND m.Route IN ('/id-management/dashboard','/super-admin/some-other-route');

PRINT 'Workspace menus updated for printing (verify rows in WorkspaceMenus).';
GO
