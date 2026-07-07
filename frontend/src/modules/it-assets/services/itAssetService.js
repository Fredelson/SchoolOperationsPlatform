// ============================================
// IT Asset Service
// ============================================

import { getItAssetsApi } from "../api/itAssetApi";

/**
 * Normalize asset list response.
 */
export const getItAssetsService = async (params = {}) => {
  const response = await getItAssetsApi(params);

  const data = response?.data || response || {};

  return {
    assets: data.items || data.assets || data.records || data.rows || [],
    pagination: data.pagination || {
      page: data.page || 1,
      pageSize: data.pageSize || 10,
      totalRecords: data.totalRecords || data.total || 0,
      totalPages: data.totalPages || 1,
    },
  };
};