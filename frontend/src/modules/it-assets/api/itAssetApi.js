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

/**
 * Get one IT asset by ID.
 */
export const getItAssetByIdApi = async (assetId) => {
  const response = await api.get(`/it-assets/${assetId}`);
  return response.data;
};
/**
 * Get IT asset timeline by AssetId.
 */
export const getItAssetTimelineApi = async (assetId) => {
  const response = await api.get(`/it-assets/timeline/${assetId}`);
  return response.data;
};