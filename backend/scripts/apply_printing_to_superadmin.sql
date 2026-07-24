-- apply_printing_to_superadmin.sql
-- Idempotent upsert: make Printing Management + children visible in the Super Admin workspace
-- Usage: edit @WorkspaceId if needed, then run with sqlcmd (or your preferred SQL client)

-- Default WorkspaceId for SSMS. Change to your target workspace id if needed.
-- If you prefer to run with sqlcmd and pass a variable, replace the declaration below
-- with a SQLCMD variable (uncomment the next line) and run using `-v WorkspaceId=<id>`.
-- :setvar WorkspaceId 1

SET NOCOUNT ON;

DECLARE @WorkspaceId INT = 1; -- change to the desired WorkspaceId when running in SSMS
-- When running with sqlcmd, you can pass -v WorkspaceId=1 and then replace the
-- declaration above with: DECLARE @WorkspaceId INT = $(WorkspaceId);

-- Validate required menu ids exist in dbo.Menus
DECLARE @ExpectedCount INT = 10;
DECLARE @FoundCount INT = (
  SELECT COUNT(DISTINCT MenuId) FROM dbo.Menus WHERE MenuId IN (155,154,157,153,152,146,147,151,156,158)
);

IF @FoundCount <> @ExpectedCount
BEGIN
  PRINT 'ERROR: One or more required printing MenuId values do not exist in dbo.Menus. Aborting.';
  PRINT 'Missing MenuIds:';
  ;WITH Required(MenuId) AS (
    SELECT 155 UNION ALL SELECT 154 UNION ALL SELECT 157 UNION ALL SELECT 153 UNION ALL SELECT 152
    UNION ALL SELECT 146 UNION ALL SELECT 147 UNION ALL SELECT 151 UNION ALL SELECT 156 UNION ALL SELECT 158
  )
  SELECT r.MenuId
  FROM Required r
  WHERE r.MenuId NOT IN (SELECT MenuId FROM dbo.Menus);
  RETURN;
END;

BEGIN TRY
  BEGIN TRANSACTION;

  ;WITH src(MenuId, ParentMenuId, SortOrder, GroupKey, GroupName, GroupSortOrder, IsVisible, IsEnabled) AS
  (
    SELECT v.MenuId, v.ParentMenuId, v.SortOrder, v.GroupKey, v.GroupName, v.GroupSortOrder, v.IsVisible, v.IsEnabled
    FROM (VALUES
      (155, NULL, 50, 'PRINTING', 'Printing Management', 50, 1, 1),
      (154, 155, 10, 'PRINTING', 'Printing Management', 50, 1, 1),
      (157, 155, 20, 'PRINTING', 'Printing Management', 50, 1, 1),
      (153, 155, 30, 'PRINTING', 'Printing Management', 50, 1, 1),
      (152, 155, 40, 'PRINTING', 'Printing Management', 50, 1, 1),
      (146, 155, 50, 'PRINTING', 'Printing Management', 50, 1, 1),
      (147, 155, 60, 'PRINTING', 'Printing Management', 50, 1, 1),
      (151, 155, 70, 'PRINTING', 'Printing Management', 50, 1, 1),
      (156, 155, 80, 'PRINTING', 'Printing Management', 50, 1, 1),
      (158, 155, 90, 'PRINTING', 'Printing Management', 50, 1, 1)
    ) AS v(MenuId, ParentMenuId, SortOrder, GroupKey, GroupName, GroupSortOrder, IsVisible, IsEnabled)
  )
MERGE dbo.WorkspaceMenus AS Target
USING (
  SELECT s.MenuId, s.ParentMenuId, s.SortOrder, s.GroupKey, s.GroupName, s.GroupSortOrder, s.IsVisible, s.IsEnabled
  FROM src s
) AS Source (MenuId, ParentMenuId, SortOrder, GroupKey, GroupName, GroupSortOrder, IsVisible, IsEnabled)
ON Target.WorkspaceId = @WorkspaceId AND Target.MenuId = Source.MenuId
WHEN MATCHED THEN
  UPDATE SET
    Target.ParentMenuId = Source.ParentMenuId,
    Target.GroupKey = Source.GroupKey,
    Target.GroupName = Source.GroupName,
    Target.GroupSortOrder = Source.GroupSortOrder,
    Target.IsVisible = Source.IsVisible,
    Target.IsEnabled = Source.IsEnabled,
    Target.SortOrder = Source.SortOrder,
    Target.UpdatedAt = GETDATE()
WHEN NOT MATCHED THEN
  INSERT (WorkspaceId, MenuId, GroupKey, GroupName, GroupSortOrder, ParentMenuId, IsVisible, IsEnabled, SortOrder, CreatedAt)
  VALUES (@WorkspaceId, Source.MenuId, Source.GroupKey, Source.GroupName, Source.GroupSortOrder, Source.ParentMenuId, Source.IsVisible, Source.IsEnabled, Source.SortOrder, GETDATE());

  PRINT 'Applied printing WorkspaceMenus upsert for WorkspaceId=' + CAST(@WorkspaceId AS VARCHAR(10));

  COMMIT TRANSACTION;
END TRY
BEGIN CATCH
  PRINT 'ERROR: ' + ERROR_MESSAGE();
  IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
  THROW;
END CATCH;

SET NOCOUNT OFF;
