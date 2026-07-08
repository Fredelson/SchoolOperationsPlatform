// ============================================
// IT Asset Explorer API
// Arab Unity School Operations Platform
// ============================================

import api from "../../../../services/api";

/**
 * Get Asset Management category cards.
 */
export const getAssetExplorerCategoriesApi = async (params = {}) => {
  const response = await api.get("/it-assets/explorer/categories", { params });
  return response.data;
};

/**
 * Get brand cards under a selected category.
 */
export const getAssetExplorerBrandsApi = async (categoryId, params = {}) => {
  const response = await api.get(
    `/it-assets/explorer/categories/${categoryId}/brands`,
    { params }
  );

  return response.data;
};

/**
 * Get model cards under a selected category and brand.
 */
export const getAssetExplorerModelsApi = async (
  categoryId,
  brandId,
  params = {}
) => {
  const response = await api.get(
    `/it-assets/explorer/categories/${categoryId}/brands/${brandId}/models`,
    { params }
  );

  return response.data;
};

/**
 * Get assets for the explorer table.
 */
export const getAssetExplorerAssetsApi = async (params = {}) => {
  const response = await api.get("/it-assets/explorer/assets", { params });
  return response.data;
};