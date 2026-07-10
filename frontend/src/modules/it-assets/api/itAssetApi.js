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

/**
 * Get IT asset audit history by AssetId.
 */
export const getItAssetAuditApi = async (assetId) => {
  const response = await api.get(`/it-assets/audit/${assetId}`);
  return response.data;
};

/**
 * Assign asset to a user/person.
 */
export const assignItAssetApi = async (payload) => {
  const response = await api.post("/it-assets/assignments/assign", payload);
  return response.data;
};

/**
 * Return assigned asset.
 */
export const returnItAssetApi = async (assetId, payload = {}) => {
  const response = await api.put(
    `/it-assets/assignments/${assetId}/return`,
    payload
  );
  return response.data;
};

/**
 * Load IT Asset lookups.
 */
export const getItAssetLookupsApi = async () => {
  const response = await api.get("/it-assets/lookups");
  return response.data;
};

/**
 * Immediately transfer an asset. Backend restricts this to platform admins.
 */
export const transferItAssetApi = async (payload) => {
  const response = await api.post("/it-assets/transfer", payload);
  return response.data;
};
