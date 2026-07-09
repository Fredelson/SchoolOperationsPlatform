// ============================================
// IT Asset Service
// Arab Unity School Operations Platform
// ============================================

import {
  getItAssetsApi,
  getItAssetByIdApi,
  getItAssetTimelineApi,
} from "../api/itAssetApi";

/**
 * Get paginated IT asset list.
 */
export const getItAssetsService = async (params = {}) => {
  const response = await getItAssetsApi(params);

  return {
    assets: response?.data || [],
    pagination: {
      page: response?.pagination?.page || 1,
      pageSize: response?.pagination?.limit || params.limit || 10,
      totalRecords: response?.pagination?.total || 0,
      totalPages: response?.pagination?.totalPages || 1,
    },
  };
};

/**
 * Get one IT asset by ID.
 */
export const getItAssetByIdService = async (assetId) => {
  const response = await getItAssetByIdApi(assetId);
  return response?.data || null;
};
/**
 * Get IT asset lifecycle timeline.
 */
export const getItAssetTimelineService = async (assetId) => {
  const response = await getItAssetTimelineApi(assetId);
  return response?.data || { timeline: [], summary: {} };
};