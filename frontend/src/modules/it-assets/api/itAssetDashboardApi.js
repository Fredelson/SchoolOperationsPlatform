// ============================================
// IT Asset Dashboard API
// Arab Unity School Operations Platform
// ============================================

import api from "../../../services/api";

/**
 * Fetch IT Asset Dashboard data.
 * Backend verified endpoint:
 * GET /api/it-assets/dashboard
 */
export const getItAssetDashboardApi = async () => {
  const response = await api.get("/it-assets/dashboard");
  return response.data;
};