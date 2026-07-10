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
async function getDashboard() {
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
    procurementRequirements,
    recentActivity,
  ] = await Promise.all([
    dashboardRepository.getDashboardSummary(),
    dashboardRepository.getOpenIssueCount(),
    dashboardRepository.getPendingTransferCount(),
    dashboardRepository.getPendingDisposalCount(),
    dashboardRepository.getAssetsByCategory(),
    dashboardRepository.getAssetsByStatus(),
    dashboardRepository.getAssetsByCondition(),
    dashboardRepository.getAssetsByLocation(),
    dashboardRepository.getAssignmentOverview(),
    dashboardRepository.getMaintenanceSummary(),
    dashboardRepository.getTransferSummary(),
    dashboardRepository.getDisposalSummary(),
    dashboardRepository.getProcurementRequirements(),
    dashboardRepository.getRecentActivity(),
  ]);

  return {
    kpis: {
      totalAssets: summary?.TotalAssets || 0,
      activeAssets: summary?.ActiveAssets || 0,
      assignedAssets: summary?.AssignedAssets || 0,
      unassignedAssets: summary?.UnassignedAssets || 0,
      borrowedAssets: summary?.BorrowedAssets || 0,
      underMaintenanceAssets: summary?.UnderMaintenanceAssets || 0,
      disposedAssets: summary?.DisposedAssets || 0,
      openIssues: issues?.OpenIssues || 0,
      pendingTransfers: transfers?.PendingTransfers || 0,
      pendingDisposals: disposals?.PendingDisposals || 0,
      itemsNeedingPurchase: procurementRequirements.reduce(
        (total, item) => total + Number(item.ShortageQuantity || 0),
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

    procurement: procurementRequirements.map((item) => ({
      itemName: item.ItemName,
      categoryName: item.CategoryName,
      requestedQuantity: Number(item.RequestedQuantity || 0),
      availableQuantity: Number(item.AvailableQuantity || 0),
      shortageQuantity: Number(item.ShortageQuantity || 0),
      status: item.Status,
      priority: null,
      estimatedCost: null,
    })),

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
