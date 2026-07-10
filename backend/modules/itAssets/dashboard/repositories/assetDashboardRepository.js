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
      SUM(CASE WHEN a.IsActive = 1 AND UPPER(ISNULL(s.StatusKey, '')) <> 'DISPOSED' THEN 1 ELSE 0 END) AS ActiveAssets,
      SUM(CASE WHEN a.CurrentAssignedUserId IS NOT NULL OR NULLIF(LTRIM(RTRIM(a.CurrentAssignedName)), '') IS NOT NULL THEN 1 ELSE 0 END) AS AssignedAssets,
      SUM(CASE WHEN a.CurrentAssignedUserId IS NULL AND NULLIF(LTRIM(RTRIM(a.CurrentAssignedName)), '') IS NULL THEN 1 ELSE 0 END) AS UnassignedAssets,
      SUM(CASE WHEN s.StatusName = 'Borrowed' THEN 1 ELSE 0 END) AS BorrowedAssets,
      SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) IN ('UNDERREPAIR', 'MAINTENANCE', 'UNDERMAINTENANCE') THEN 1 ELSE 0 END) AS UnderMaintenanceAssets,
      SUM(CASE WHEN s.StatusName = 'Disposed' THEN 1 ELSE 0 END) AS DisposedAssets
    FROM dbo.ITAssets a
    LEFT JOIN dbo.ITAssetStatuses s
      ON a.ITAssetStatusId = s.ITAssetStatusId
    WHERE a.IsDeleted = 0;
  `);

  return firstOrNull(result);
}

async function getAssetsByCondition() {
  const result = await executeQuery(`
    SELECT ISNULL(c.ConditionName, 'Not Recorded') AS ConditionName, COUNT(*) AS Total
    FROM dbo.ITAssets a
    LEFT JOIN dbo.ITAssetConditions c ON a.ITAssetConditionId = c.ITAssetConditionId
    WHERE a.IsDeleted = 0
    GROUP BY c.ConditionName
    ORDER BY Total DESC;
  `);
  return rows(result);
}

async function getAssignmentOverview() {
  const result = await executeQuery(`
    SELECT
      CASE
        WHEN a.CurrentAssignedUserId IS NOT NULL THEN ISNULL(r.DisplayName, r.RoleName)
        WHEN NULLIF(LTRIM(RTRIM(a.CurrentAssignedName)), '') IS NOT NULL THEN 'External / Named Assignee'
        ELSE 'Unassigned'
      END AS AssignmentType,
      COUNT(*) AS Total
    FROM dbo.ITAssets a
    LEFT JOIN dbo.Users u ON a.CurrentAssignedUserId = u.UserId
    LEFT JOIN dbo.Roles r ON u.RoleId = r.RoleId
    WHERE a.IsDeleted = 0
    GROUP BY
      CASE
        WHEN a.CurrentAssignedUserId IS NOT NULL THEN ISNULL(r.DisplayName, r.RoleName)
        WHEN NULLIF(LTRIM(RTRIM(a.CurrentAssignedName)), '') IS NOT NULL THEN 'External / Named Assignee'
        ELSE 'Unassigned'
      END
    ORDER BY Total DESC;
  `);
  return rows(result);
}

async function getMaintenanceSummary() {
  const result = await executeQuery(`
    SELECT TOP 6
      a.AssetId,
      a.AssetTag,
      ISNULL(m.ModelName, a.ModelDescription) AS AssetName,
      l.LocationName,
      s.StatusName,
      latest.MaintenanceType,
      latest.PerformedAt,
      latest.NextDueAt
    FROM dbo.ITAssets a
    INNER JOIN dbo.ITAssetStatuses s ON a.ITAssetStatusId = s.ITAssetStatusId
    LEFT JOIN dbo.ITAssetModels m ON a.ITAssetModelId = m.ITAssetModelId
    LEFT JOIN dbo.Locations l ON a.CurrentLocationId = l.LocationId
    OUTER APPLY (
      SELECT TOP 1 MaintenanceType, PerformedAt, NextDueAt
      FROM dbo.ITAssetMaintenanceLogs ml
      WHERE ml.AssetId = a.AssetId
      ORDER BY ml.PerformedAt DESC
    ) latest
    WHERE a.IsDeleted = 0
      AND UPPER(ISNULL(s.StatusKey, '')) IN ('UNDERREPAIR', 'MAINTENANCE', 'UNDERMAINTENANCE')
    ORDER BY ISNULL(latest.PerformedAt, a.UpdatedAt) DESC;
  `);
  return rows(result);
}

async function getTransferSummary() {
  const result = await executeQuery(`
    SELECT UPPER(TransferStatus) AS StatusName, COUNT(*) AS Total
    FROM dbo.ITAssetTransferRequests
    GROUP BY UPPER(TransferStatus)
    ORDER BY Total DESC;
  `);
  return rows(result);
}

async function getDisposalSummary() {
  const result = await executeQuery(`
    SELECT UPPER(DisposalStatus) AS StatusName, COUNT(*) AS Total
    FROM dbo.ITAssetDisposals
    GROUP BY UPPER(DisposalStatus)
    ORDER BY Total DESC;
  `);
  return rows(result);
}

async function getProcurementRequirements() {
  const result = await executeQuery(`
    SELECT
      ISNULL(NULLIF(LTRIM(RTRIM(LaptopModel)), ''), 'Laptop - Model Not Specified') AS ItemName,
      'Laptop' AS CategoryName,
      COUNT(*) AS RequestedQuantity,
      0 AS AvailableQuantity,
      COUNT(*) AS ShortageQuantity,
      Status
    FROM dbo.ITAssetNeededLaptops
    WHERE UPPER(ISNULL(Status, 'PENDING REVIEW')) NOT IN ('FULFILLED', 'COMPLETED', 'CANCELLED')
    GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(LaptopModel)), ''), 'Laptop - Model Not Specified'), Status
    ORDER BY ShortageQuantity DESC, ItemName;
  `);
  return rows(result);
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
      activity.ActivityTimelineId,
      activity.UserId,
      activity.ModuleKey,
      activity.EntityType,
      activity.EntityId,
      activity.ActivityType,
      activity.ActivityTitle,
      activity.ActivityDescription,
      activity.CreatedAt,
      u.FullName AS PerformedByName,
      asset.AssetTag
    FROM dbo.ActivityTimeline activity
    LEFT JOIN dbo.Users u ON activity.UserId = u.UserId
    LEFT JOIN dbo.ITAssets asset
      ON activity.EntityType IN ('ITAsset', 'ITAssets')
      AND TRY_CONVERT(INT, activity.EntityId) = asset.AssetId
    WHERE UPPER(activity.ModuleKey) IN ('ITASSETS', 'IT_ASSETS')
       OR activity.EntityType IN ('ITAsset', 'ITAssets')
    ORDER BY activity.CreatedAt DESC;
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
  getAssetsByCondition,
  getAssignmentOverview,
  getMaintenanceSummary,
  getTransferSummary,
  getDisposalSummary,
  getProcurementRequirements,
  getRecentActivity,
};
