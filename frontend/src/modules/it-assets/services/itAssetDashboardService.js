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
    procurement: data.procurement || [],
    operations: data.operations || {
      maintenance: [],
      transfers: [],
      disposals: [],
    },
    recentActivity: data.recentActivity || [],
    recentlyAssignedAssets: data.recentlyAssignedAssets || [],
    openIssues: data.openIssues || [],
    pendingTransfers: data.pendingTransfers || [],
    pendingDisposals: data.pendingDisposals || [],
  };
};
