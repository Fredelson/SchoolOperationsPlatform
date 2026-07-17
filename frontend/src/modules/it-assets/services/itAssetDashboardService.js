// ============================================
// IT Asset Dashboard Service
// ============================================

import { getItAssetDashboardApi } from "../api/itAssetDashboardApi";

/**
 * Normalizes backend dashboard response for frontend use.
 */
export const getItAssetDashboardService = async (params = {}) => {
  const response = await getItAssetDashboardApi(params);

  const data = response?.data || response || {};

  return {
    kpis: data.kpis || {},
    charts: data.charts || {},
    partsToOrder: data.partsToOrder || [],
    requiredActions: data.requiredActions || [],
    filters: data.filters || {},
    filteredAssets: data.filteredAssets || [],
    operations: data.operations || {
      maintenance: [],
      transfers: [],
      disposals: [],
    },
    recentActivity: data.recentActivity || [],
    recentAssignments: data.recentAssignments || [],
    recentTransfers: data.recentTransfers || [],
    openIssues: data.openIssues || [],
    pendingTransfers: data.pendingTransfers || [],
    pendingDisposals: data.pendingDisposals || [],
  };
};
