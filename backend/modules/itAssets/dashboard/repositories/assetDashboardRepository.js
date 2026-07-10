// backend/modules/itAssets/dashboard/repositories/assetDashboardRepository.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * IT Asset Dashboard Repository
 * ============================================================
 */

const {
  sql,
  executeQuery,
  rows,
  firstOrNull,
} = require("../../../../shared/database");

const toPositiveIntOrNull = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const toDateOrNull = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? value : null;

const buildAssetFilter = (filters = {}, alias = "a") => ({
  clause: `
    AND (@CategoryId IS NULL OR ${alias}.ITAssetCategoryId = @CategoryId)
    AND (@ModelId IS NULL OR ${alias}.ITAssetModelId = @ModelId)
    AND (@StatusId IS NULL OR ${alias}.ITAssetStatusId = @StatusId)
    AND (@ConditionId IS NULL OR ${alias}.ITAssetConditionId = @ConditionId)
    AND (@DepartmentId IS NULL OR ${alias}.CurrentDepartmentId = @DepartmentId)
    AND (@LocationId IS NULL OR ${alias}.CurrentLocationId = @LocationId)
    AND (@RoomId IS NULL OR ${alias}.CurrentRoomId = @RoomId)
    AND (@AssignedUserId IS NULL OR ${alias}.CurrentAssignedUserId = @AssignedUserId)
    AND (@BrandId IS NULL OR EXISTS (
      SELECT 1 FROM dbo.ITAssetModels filterModel
      WHERE filterModel.ITAssetModelId = ${alias}.ITAssetModelId
        AND filterModel.ITAssetBrandId = @BrandId
    ))
    AND (@DateFrom IS NULL OR ${alias}.CreatedAt >= @DateFrom)
    AND (@DateTo IS NULL OR ${alias}.CreatedAt < DATEADD(DAY, 1, @DateTo))
  `,
  parameters: [
    ["CategoryId", filters.categoryId], ["BrandId", filters.brandId],
    ["ModelId", filters.modelId], ["StatusId", filters.statusId],
    ["ConditionId", filters.conditionId], ["DepartmentId", filters.departmentId],
    ["LocationId", filters.locationId], ["RoomId", filters.roomId],
    ["AssignedUserId", filters.assignedUserId],
  ].map(([name, value]) => ({ name, type: sql.Int, value: toPositiveIntOrNull(value) }))
    .concat([
      { name: "DateFrom", type: sql.Date, value: toDateOrNull(filters.dateFrom) },
      { name: "DateTo", type: sql.Date, value: toDateOrNull(filters.dateTo) },
    ]),
});

async function getDashboardSummary(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT
      COUNT(*) AS TotalAssets,
      SUM(CASE WHEN a.IsActive = 1
        AND UPPER(ISNULL(s.StatusKey, '')) IN ('ASSIGNED', 'AVAILABLE') THEN 1 ELSE 0 END) AS ActiveAssets,
      SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) = 'ASSIGNED' THEN 1 ELSE 0 END) AS AssignedAssets,
      SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) = 'AVAILABLE'
        AND a.IsActive = 1
        AND currentAssignment.AssetId IS NULL THEN 1 ELSE 0 END) AS AvailableAssets,
      SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) = 'BORROWED' THEN 1 ELSE 0 END) AS BorrowedAssets,
      SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) IN ('MAINTENANCE', 'UNDERMAINTENANCE') THEN 1 ELSE 0 END) AS UnderMaintenanceAssets,
      SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) = 'UNDERREPAIR' THEN 1 ELSE 0 END) AS UnderRepairAssets,
      SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) = 'DISPOSED' THEN 1 ELSE 0 END) AS DisposedAssets
    FROM dbo.ITAssets a
    LEFT JOIN dbo.ITAssetStatuses s
      ON a.ITAssetStatusId = s.ITAssetStatusId
    OUTER APPLY (
      SELECT TOP 1 assignment.AssetId
      FROM dbo.ITAssetAssignments assignment
      WHERE assignment.AssetId = a.AssetId AND assignment.ReturnedAt IS NULL
    ) currentAssignment
    WHERE a.IsDeleted = 0 ${filter.clause};
  `, filter.parameters);

  return firstOrNull(result);
}

async function getAssetsByCondition(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT ISNULL(c.ConditionName, 'Not Recorded') AS ConditionName, COUNT(*) AS Total
    FROM dbo.ITAssets a
    LEFT JOIN dbo.ITAssetConditions c ON a.ITAssetConditionId = c.ITAssetConditionId
    WHERE a.IsDeleted = 0 ${filter.clause}
    GROUP BY c.ConditionName
    ORDER BY Total DESC;
  `, filter.parameters);
  return rows(result);
}

async function getAssignmentOverview(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT
      CASE WHEN UPPER(s.StatusKey) = 'ASSIGNED'
        THEN 'Assigned' ELSE 'Available / Unassigned' END AS AssignmentType,
      COUNT(*) AS Total
    FROM dbo.ITAssets a
    INNER JOIN dbo.ITAssetStatuses s ON a.ITAssetStatusId = s.ITAssetStatusId
    WHERE a.IsDeleted = 0
      AND a.IsActive = 1
      AND UPPER(s.StatusKey) IN ('ASSIGNED', 'AVAILABLE') ${filter.clause}
    GROUP BY
      CASE WHEN UPPER(s.StatusKey) = 'ASSIGNED'
        THEN 'Assigned' ELSE 'Available / Unassigned' END
    ORDER BY Total DESC;
  `, filter.parameters);
  return rows(result);
}

async function getMaintenanceSummary(filters) {
  const filter = buildAssetFilter(filters);
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
      AND UPPER(ISNULL(s.StatusKey, '')) IN ('UNDERREPAIR', 'MAINTENANCE', 'UNDERMAINTENANCE') ${filter.clause}
    ORDER BY ISNULL(latest.PerformedAt, a.UpdatedAt) DESC;
  `, filter.parameters);
  return rows(result);
}

async function getTransferSummary(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT UPPER(tr.TransferStatus) AS StatusName, COUNT(*) AS Total
    FROM dbo.ITAssetTransferRequests tr
    INNER JOIN dbo.ITAssets a ON tr.AssetId = a.AssetId
    WHERE a.IsDeleted = 0 ${filter.clause}
    GROUP BY UPPER(tr.TransferStatus)
    ORDER BY Total DESC;
  `, filter.parameters);
  return rows(result);
}

async function getDisposalSummary(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT UPPER(disposal.DisposalStatus) AS StatusName, COUNT(*) AS Total
    FROM dbo.ITAssetDisposals disposal
    INNER JOIN dbo.ITAssets a ON disposal.AssetId = a.AssetId
    WHERE a.IsDeleted = 0 ${filter.clause}
    GROUP BY UPPER(disposal.DisposalStatus)
    ORDER BY Total DESC;
  `, filter.parameters);
  return rows(result);
}

async function getRequiredActionSummary(filters) {
  const filter = buildAssetFilter(filters, "asset");
  const result = await executeQuery(`
    SELECT
      issueType.IssueTypeId,
      issueType.IssueTypeKey,
      issueType.IssueTypeName,
      category.IssueCategoryKey,
      category.IssueCategoryName,
      COUNT(*) AS Total
    FROM dbo.ITAssetIssueLogs issueLog
    INNER JOIN dbo.ITAssetIssueTypes issueType ON issueLog.IssueTypeId = issueType.IssueTypeId
    INNER JOIN dbo.ITAssetIssueCategories category ON issueType.IssueCategoryId = category.IssueCategoryId
    INNER JOIN dbo.ITAssets asset ON issueLog.AssetId = asset.AssetId
    WHERE asset.IsDeleted = 0
      AND UPPER(issueLog.IssueStatus) NOT IN ('RESOLVED', 'CLOSED') ${filter.clause}
    GROUP BY issueType.IssueTypeId, issueType.IssueTypeKey, issueType.IssueTypeName,
      category.IssueCategoryKey, category.IssueCategoryName
    ORDER BY Total DESC, issueType.IssueTypeName;
  `, filter.parameters);
  return rows(result);
}

async function getOpenIssueCount(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT COUNT(*) AS OpenIssues
    FROM dbo.ITAssetIssueLogs issueLog
    INNER JOIN dbo.ITAssets a ON issueLog.AssetId = a.AssetId
    WHERE UPPER(issueLog.IssueStatus) NOT IN ('RESOLVED', 'CLOSED')
      AND a.IsDeleted = 0 ${filter.clause};
  `, filter.parameters);

  return firstOrNull(result);
}

async function getPendingTransferCount(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT COUNT(*) AS PendingTransfers
    FROM dbo.ITAssetTransferRequests tr
    INNER JOIN dbo.ITAssets a ON tr.AssetId = a.AssetId
    WHERE UPPER(tr.TransferStatus) IN ('PENDING', 'REQUESTED', 'APPROVED')
      AND a.IsDeleted = 0 ${filter.clause};
  `, filter.parameters);

  return firstOrNull(result);
}

async function getPendingDisposalCount(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT COUNT(*) AS PendingDisposals
    FROM dbo.ITAssetDisposals disposal
    INNER JOIN dbo.ITAssets a ON disposal.AssetId = a.AssetId
    WHERE UPPER(disposal.DisposalStatus) IN ('PENDING', 'REQUESTED', 'APPROVED')
      AND a.IsDeleted = 0 ${filter.clause};
  `, filter.parameters);

  return firstOrNull(result);
}

async function getAssetsByCategory(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT
      c.CategoryName,
      COUNT(*) AS Total
    FROM dbo.ITAssets a
    LEFT JOIN dbo.ITAssetCategories c
      ON a.ITAssetCategoryId = c.ITAssetCategoryId
    WHERE a.IsDeleted = 0 ${filter.clause}
    GROUP BY c.CategoryName
    ORDER BY Total DESC;
  `, filter.parameters);

  return rows(result);
}

async function getAssetsByStatus(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT
      s.StatusName,
      COUNT(*) AS Total
    FROM dbo.ITAssets a
    LEFT JOIN dbo.ITAssetStatuses s
      ON a.ITAssetStatusId = s.ITAssetStatusId
    WHERE a.IsDeleted = 0 ${filter.clause}
    GROUP BY s.StatusName
    ORDER BY Total DESC;
  `, filter.parameters);

  return rows(result);
}

async function getAssetsByLocation(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT
      l.LocationName,
      COUNT(*) AS Total
    FROM dbo.ITAssets a
    LEFT JOIN dbo.Locations l
      ON a.CurrentLocationId = l.LocationId
    WHERE a.IsDeleted = 0 ${filter.clause}
    GROUP BY l.LocationName
    ORDER BY Total DESC;
  `, filter.parameters);

  return rows(result);
}

async function getRecentActivity(filters) {
  const filter = buildAssetFilter(filters, "asset");
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
    WHERE (UPPER(activity.ModuleKey) IN ('ITASSETS', 'IT_ASSETS')
       OR activity.EntityType IN ('ITAsset', 'ITAssets'))
      AND asset.IsDeleted = 0 ${filter.clause}
    ORDER BY activity.CreatedAt DESC;
  `, filter.parameters);

  return rows(result);
}

async function getRecentAssignments(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT TOP 8
      assignment.AssetAssignmentId,
      assignment.AssetId,
      a.AssetTag,
      COALESCE(assignment.AssignedToName, assignedUser.FullName, 'Unspecified assignee') AS AssignedToName,
      assignedBy.FullName AS AssignedByName,
      assignment.AssignedAt,
      assignment.ReturnedAt
    FROM dbo.ITAssetAssignments assignment
    INNER JOIN dbo.ITAssets a ON assignment.AssetId = a.AssetId
    LEFT JOIN dbo.Users assignedUser ON assignment.AssignedToUserId = assignedUser.UserId
    LEFT JOIN dbo.Users assignedBy ON assignment.AssignedByUserId = assignedBy.UserId
    WHERE a.IsDeleted = 0 ${filter.clause}
    ORDER BY assignment.AssignedAt DESC;
  `, filter.parameters);
  return rows(result);
}

async function getRecentTransfers(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT TOP 8
      transfer.AssetTransferRequestId,
      transfer.AssetId,
      a.AssetTag,
      transfer.TransferStatus,
      transfer.RequestedAt,
      transfer.CompletedAt,
      COALESCE(toUser.FullName, toRoom.RoomName, toDepartment.DepartmentName,
        toLocation.LocationName, 'Unspecified destination') AS DestinationName
    FROM dbo.ITAssetTransferRequests transfer
    INNER JOIN dbo.ITAssets a ON transfer.AssetId = a.AssetId
    LEFT JOIN dbo.Users toUser ON transfer.ToUserId = toUser.UserId
    LEFT JOIN dbo.Rooms toRoom ON transfer.ToRoomId = toRoom.RoomId
    LEFT JOIN dbo.Departments toDepartment ON transfer.ToDepartmentId = toDepartment.DepartmentId
    LEFT JOIN dbo.Locations toLocation ON transfer.ToLocationId = toLocation.LocationId
    WHERE a.IsDeleted = 0 ${filter.clause}
    ORDER BY transfer.RequestedAt DESC;
  `, filter.parameters);
  return rows(result);
}

async function getFilteredAssets(filters) {
  const filter = buildAssetFilter(filters);
  const result = await executeQuery(`
    SELECT TOP 500 a.AssetId, a.AssetTag, category.CategoryName, brand.BrandName,
      model.ModelName, status.StatusName, condition.ConditionName,
      department.DepartmentName, location.LocationName, room.RoomName,
      a.CurrentAssignedName, a.CreatedAt
    FROM dbo.ITAssets a
    LEFT JOIN dbo.ITAssetCategories category ON a.ITAssetCategoryId = category.ITAssetCategoryId
    LEFT JOIN dbo.ITAssetModels model ON a.ITAssetModelId = model.ITAssetModelId
    LEFT JOIN dbo.ITAssetBrands brand ON model.ITAssetBrandId = brand.ITAssetBrandId
    LEFT JOIN dbo.ITAssetStatuses status ON a.ITAssetStatusId = status.ITAssetStatusId
    LEFT JOIN dbo.ITAssetConditions condition ON a.ITAssetConditionId = condition.ITAssetConditionId
    LEFT JOIN dbo.Departments department ON a.CurrentDepartmentId = department.DepartmentId
    LEFT JOIN dbo.Locations location ON a.CurrentLocationId = location.LocationId
    LEFT JOIN dbo.Rooms room ON a.CurrentRoomId = room.RoomId
    WHERE a.IsDeleted = 0 ${filter.clause}
    ORDER BY a.AssetTag;
  `, filter.parameters);
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
  getRequiredActionSummary,
  getRecentActivity,
  getRecentAssignments,
  getRecentTransfers,
  getFilteredAssets,
};
