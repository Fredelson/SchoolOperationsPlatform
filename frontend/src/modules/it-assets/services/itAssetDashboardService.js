// ============================================
// IT Asset Dashboard Service
// ============================================

import { getItAssetDashboardApi } from "../api/itAssetDashboardApi";

/**
 * Normalizes backend dashboard response for frontend use.
 */
export const getItAssetDashboardService = async () => {
  const response = await getItAssetDashboardApi();

  const data = response?.data || response || {};

  return {
    kpis: data.kpis || {},
    charts: data.charts || {},
    recentActivity: data.recentActivity || [],
    recentlyAssignedAssets: data.recentlyAssignedAssets || [],
    openIssues: data.openIssues || [],
    pendingTransfers: data.pendingTransfers || [],
    pendingDisposals: data.pendingDisposals || [],
  };
};