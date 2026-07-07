// backend/modules/itAssets/dashboard/repositories/assetDashboardRepository.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * IT Asset Dashboard Repository
 * ============================================================
 */

const {
  executeQuery,
  rows,
  firstOrNull,
} = require("../../../../shared/database");

async function getDashboardSummary() {
  const result = await executeQuery(`
    SELECT
      COUNT(*) AS TotalAssets,
      SUM(CASE WHEN s.StatusName = 'Available' THEN 1 ELSE 0 END) AS AvailableAssets,
      SUM(CASE WHEN s.StatusName = 'Assigned' THEN 1 ELSE 0 END) AS AssignedAssets,
      SUM(CASE WHEN s.StatusName = 'Borrowed' THEN 1 ELSE 0 END) AS BorrowedAssets,
      SUM(CASE WHEN s.StatusName IN ('Maintenance', 'Under Maintenance') THEN 1 ELSE 0 END) AS UnderMaintenanceAssets,
      SUM(CASE WHEN s.StatusName = 'Disposed' THEN 1 ELSE 0 END) AS DisposedAssets
    FROM dbo.ITAssets a
    LEFT JOIN dbo.ITAssetStatuses s
      ON a.ITAssetStatusId = s.ITAssetStatusId
    WHERE a.IsDeleted = 0;
  `);

  return firstOrNull(result);
}

async function getOpenIssueCount() {
  const result = await executeQuery(`
    SELECT COUNT(*) AS OpenIssues
    FROM dbo.ITAssetIssueLogs
    WHERE IssueStatus NOT IN ('Resolved', 'Closed');
  `);

  return firstOrNull(result);
}

async function getPendingTransferCount() {
  const result = await executeQuery(`
    SELECT COUNT(*) AS PendingTransfers
    FROM dbo.ITAssetTransferRequests
    WHERE TransferStatus IN ('Pending', 'Requested', 'Approved');
  `);

  return firstOrNull(result);
}

async function getPendingDisposalCount() {
  const result = await executeQuery(`
    SELECT COUNT(*) AS PendingDisposals
    FROM dbo.ITAssetDisposals
    WHERE DisposalStatus IN ('Pending', 'Requested', 'Approved');
  `);

  return firstOrNull(result);
}

async function getAssetsByCategory() {
  const result = await executeQuery(`
    SELECT
      c.CategoryName,
      COUNT(*) AS Total
    FROM dbo.ITAssets a
    LEFT JOIN dbo.ITAssetCategories c
      ON a.ITAssetCategoryId = c.ITAssetCategoryId
    WHERE a.IsDeleted = 0
    GROUP BY c.CategoryName
    ORDER BY Total DESC;
  `);

  return rows(result);
}

async function getAssetsByStatus() {
  const result = await executeQuery(`
    SELECT
      s.StatusName,
      COUNT(*) AS Total
    FROM dbo.ITAssets a
    LEFT JOIN dbo.ITAssetStatuses s
      ON a.ITAssetStatusId = s.ITAssetStatusId
    WHERE a.IsDeleted = 0
    GROUP BY s.StatusName
    ORDER BY Total DESC;
  `);

  return rows(result);
}

async function getAssetsByLocation() {
  const result = await executeQuery(`
    SELECT
      l.LocationName,
      COUNT(*) AS Total
    FROM dbo.ITAssets a
    LEFT JOIN dbo.Locations l
      ON a.CurrentLocationId = l.LocationId
    WHERE a.IsDeleted = 0
    GROUP BY l.LocationName
    ORDER BY Total DESC;
  `);

  return rows(result);
}

async function getRecentActivity() {
  const result = await executeQuery(`
    SELECT TOP 10
      ActivityTimelineId,
      UserId,
      ModuleKey,
      EntityType,
      EntityId,
      ActivityType,
      ActivityTitle,
      ActivityDescription,
      CreatedAt
    FROM dbo.ActivityTimeline
    WHERE ModuleKey = 'itAssets'
       OR EntityType IN ('ITAsset', 'ITAssets')
    ORDER BY CreatedAt DESC;
  `);

  return rows(result);
}

module.exports = {
  getDashboardSummary,
  getOpenIssueCount,
  getPendingTransferCount,
  getPendingDisposalCount,
  getAssetsByCategory,
  getAssetsByStatus,
  getAssetsByLocation,
  getRecentActivity,
};