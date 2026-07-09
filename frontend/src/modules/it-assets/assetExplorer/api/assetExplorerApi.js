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
 * Find exact asset hierarchy path by AssetTag.
 */
export const findAssetPathApi = async (assetTag) => {
  const response = await api.get("/it-assets/explorer/find-by-tag", {
    params: { assetTag },
  });

  return response.data;
};

/**
 * Get assets for the explorer table.
 * Filters affect table only.
 *
 * Important:
 * - brandId filters normal brand cards.
 * - noBrandModel filters the synthetic "No Brand / Model" card.
 */
export const getAssetExplorerAssetsApi = async ({
  search = "",
  categoryId = null,
  brandId = null,
  modelId = null,
  statusId = null,
  locationId = null,
  conditionId = null,
  noBrandModel = false,
  page = 1,
  limit = 10,
} = {}) => {
  const response = await api.get("/it-assets/explorer/assets", {
    params: {
      search,
      categoryId,
      brandId,
      modelId,
      statusId,
      locationId,
      conditionId,
      noBrandModel,
      page,
      limit,
    },
  });

  return response.data;
};

/**
 * Load dropdown filter lookups.
 * Existing backend endpoint:
 * GET /api/it-assets/lookups
 */
export const getAssetExplorerFilterLookupsApi = async () => {
  const response = await api.get("/it-assets/lookups");

  const payload = response.data;
  const lookups = payload?.data || payload || {};

  return {
    statuses: lookups.statuses || lookups.Statuses || [],
    locations: lookups.locations || lookups.Locations || [],
    conditions: lookups.conditions || lookups.Conditions || [],
  };
};