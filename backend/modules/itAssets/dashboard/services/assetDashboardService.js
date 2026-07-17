// backend/modules/itAssets/dashboard/services/assetDashboardService.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * IT Asset Dashboard Service
 * ============================================================
 *
 * Purpose:
 * Builds the dashboard response used by the IT Asset frontend.
 * ============================================================
 */

const dashboardRepository = require("../repositories/assetDashboardRepository");

/**
 * Get complete dashboard data.
 */
async function getDashboard(filters = {}) {
  const [
    summary,
    issues,
    transfers,
    disposals,
    assetsByCategory,
    assetsByStatus,
    assetsByCondition,
    assetsByLocation,
    assignmentOverview,
    maintenanceSummary,
    transferSummary,
    disposalSummary,
    requiredActions,
    partsToOrder,
    recentActivity,
    recentAssignments,
    recentTransfers,
    filteredAssets,
  ] = await Promise.all([
    dashboardRepository.getDashboardSummary(filters),
    dashboardRepository.getOpenIssueCount(filters),
    dashboardRepository.getPendingTransferCount(filters),
    dashboardRepository.getPendingDisposalCount(filters),
    dashboardRepository.getAssetsByCategory(filters),
    dashboardRepository.getAssetsByStatus(filters),
    dashboardRepository.getAssetsByCondition(filters),
    dashboardRepository.getAssetsByLocation(filters),
    dashboardRepository.getAssignmentOverview(filters),
    dashboardRepository.getMaintenanceSummary(filters),
    dashboardRepository.getTransferSummary(filters),
    dashboardRepository.getDisposalSummary(filters),
    dashboardRepository.getRequiredActionSummary(filters),
    dashboardRepository.getPartsToOrderSummary(filters),
    dashboardRepository.getRecentActivity(filters),
    dashboardRepository.getRecentAssignments(filters),
    dashboardRepository.getRecentTransfers(filters),
    dashboardRepository.getFilteredAssets(filters),
  ]);

  return {
    kpis: {
      totalAssets: summary?.TotalAssets || 0,
      activeAssets: summary?.ActiveAssets || 0,
      assignedAssets: summary?.AssignedAssets || 0,
      availableAssets: summary?.AvailableAssets || 0,
      borrowedAssets: summary?.BorrowedAssets || 0,
      underMaintenanceAssets: summary?.UnderMaintenanceAssets || 0,
      underRepairAssets: summary?.UnderRepairAssets || 0,
      disposedAssets: summary?.DisposedAssets || 0,
      openIssues: issues?.OpenIssues || 0,
      pendingTransfers: transfers?.PendingTransfers || 0,
      pendingDisposals: disposals?.PendingDisposals || 0,
      itemsRequiringAttention: issues?.OpenIssues || 0,
      partsToOrder: partsToOrder.reduce(
        (total, item) => total + Number(item.TotalQuantity || 0),
        0
      ),
    },

    charts: {
      assetsByCategory: assetsByCategory.map((item) => ({
        name: item.CategoryName || "Uncategorized",
        value: item.Total || 0,
      })),

      assetsByStatus: assetsByStatus.map((item) => ({
        name: item.StatusName || "Unknown",
        value: item.Total || 0,
      })),

      assetsByCondition: assetsByCondition.map((item) => ({
        name: item.ConditionName || "Not Recorded",
        value: item.Total || 0,
      })),

      assetsByLocation: assetsByLocation.map((item) => ({
        name: item.LocationName || "Unassigned",
        value: item.Total || 0,
      })),

      assignmentOverview: assignmentOverview.map((item) => ({
        name: item.AssignmentType || "Unassigned",
        value: item.Total || 0,
      })),
    },

    partsToOrder: partsToOrder.map((item) => ({
      partKey: item.PartKey,
      partName: item.PartName,
      totalQuantity: Number(item.TotalQuantity || 0),
      assetCount: Number(item.AssetCount || 0),
    })),

    requiredActions: requiredActions.map((item) => ({
      issueTypeId: item.IssueTypeId,
      issueTypeKey: item.IssueTypeKey,
      issueTypeName: item.IssueTypeName,
      categoryKey: item.IssueCategoryKey,
      categoryName: item.IssueCategoryName,
      total: Number(item.Total || 0),
    })),

    filters,
    filteredAssets,

    operations: {
      maintenance: maintenanceSummary.map((item) => ({
        assetId: item.AssetId,
        assetTag: item.AssetTag,
        assetName: item.AssetName,
        locationName: item.LocationName,
        statusName: item.StatusName,
        maintenanceType: item.MaintenanceType,
        performedAt: item.PerformedAt,
        nextDueAt: item.NextDueAt,
      })),
      transfers: transferSummary.map((item) => ({
        name: item.StatusName,
        value: item.Total || 0,
      })),
      disposals: disposalSummary.map((item) => ({
        name: item.StatusName,
        value: item.Total || 0,
      })),
    },

    recentAssignments: recentAssignments.map((item) => ({
      id: item.AssetAssignmentId,
      assetId: item.AssetId,
      assetTag: item.AssetTag,
      assignedToName: item.AssignedToName,
      assignedByName: item.AssignedByName,
      assignedAt: item.AssignedAt,
      returnedAt: item.ReturnedAt,
    })),

    recentTransfers: recentTransfers.map((item) => ({
      id: item.AssetTransferRequestId,
      assetId: item.AssetId,
      assetTag: item.AssetTag,
      status: item.TransferStatus,
      destinationName: item.DestinationName,
      requestedAt: item.RequestedAt,
      completedAt: item.CompletedAt,
    })),

    recentActivity: recentActivity.map((item) => ({
        id: item.ActivityTimelineId,
        userId: item.UserId,
        moduleKey: item.ModuleKey,
        entityType: item.EntityType,
        entityId: item.EntityId,
        activityType: item.ActivityType,
        title: item.ActivityTitle,
        description: item.ActivityDescription,
        createdAt: item.CreatedAt,
        performedByName: item.PerformedByName,
        assetTag: item.AssetTag,
    })),
  };
}

module.exports = {
  getDashboard,
};
