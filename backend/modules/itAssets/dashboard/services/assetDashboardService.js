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
    assetsByLocation,
    recentActivity,
  ] = await Promise.all([
    dashboardRepository.getDashboardSummary(),
    dashboardRepository.getOpenIssueCount(),
    dashboardRepository.getPendingTransferCount(),
    dashboardRepository.getPendingDisposalCount(),
    dashboardRepository.getAssetsByCategory(),
    dashboardRepository.getAssetsByStatus(),
    dashboardRepository.getAssetsByLocation(),
    dashboardRepository.getRecentActivity(),
  ]);

  return {
    kpis: {
      totalAssets: summary?.TotalAssets || 0,
      availableAssets: summary?.AvailableAssets || 0,
      assignedAssets: summary?.AssignedAssets || 0,
      borrowedAssets: summary?.BorrowedAssets || 0,
      underMaintenanceAssets: summary?.UnderMaintenanceAssets || 0,
      disposedAssets: summary?.DisposedAssets || 0,
      openIssues: issues?.OpenIssues || 0,
      pendingTransfers: transfers?.PendingTransfers || 0,
      pendingDisposals: disposals?.PendingDisposals || 0,
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

      assetsByLocation: assetsByLocation.map((item) => ({
        name: item.LocationName || "Unassigned",
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
        })),
  };
}

module.exports = {
  getDashboard,
};