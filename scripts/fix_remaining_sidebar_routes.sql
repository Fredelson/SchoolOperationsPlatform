-- Hide remaining sidebar routes with no frontend Route
UPDATE dbo.Menus
SET Route = NULL,
    VisibilityStatusId = (
      SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'hidden'
    )
WHERE Route IN (
  '/dashboard',
  '/super-admin/organization/profile',
  '/system/backups',
  '/printing/approvals'
);
