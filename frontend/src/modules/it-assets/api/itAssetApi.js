// ============================================
// IT Asset API
// Arab Unity School Operations Platform
// ============================================

import api from "../../../services/api";

/**
 * Get paginated IT asset list.
 */
export const getItAssetsApi = async (params = {}) => {
  const response = await api.get("/it-assets", { params });
  return response.data;
};