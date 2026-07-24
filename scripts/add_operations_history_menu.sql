IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE MenuKey = N'IT_OPERATIONS_HISTORY')
BEGIN
  INSERT INTO dbo.Menus
  (WorkspaceId, ModuleId, ParentMenuId, MenuKey, MenuName, Route, Icon, PermissionId, FeatureFlagId, BadgeQueryKey, VisibilityStatusId, IsPinned, IsCollapsible, SortOrder, CreatedAt, UpdatedAt)
  VALUES (1, 6, 188, N'IT_OPERATIONS_HISTORY', N'Operations History', N'/it-assets/operations-history', N'history', NULL, NULL, NULL, 1, 0, 0, 90, CAST(GETDATE() AS DateTime), CAST(GETDATE() AS DateTime));
END
GO
