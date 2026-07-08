// ============================================
// IT Asset Service
// Arab Unity School Operations Platform
// ============================================

import { getItAssetsApi } from "../api/itAssetApi";

/**
 * Get paginated IT asset list.
 *
 * Purpose:
 * - Calls the IT Asset API layer.
 * - Normalizes the backend response into the shape used by useAssetList.
 *
 * Backend response shape:
 * {
 *   success: true,
 *   message: "...",
 *   data: [],
 *   pagination: {
 *     page,
 *     limit,
 *     total,
 *     totalPages
 *   }
 * }
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