// ============================================
// Asset Explorer Loader Hook
// Arab Unity School Operations Platform
// ============================================

import { useCallback, useState } from "react";

import {
  getAssetExplorerCategoriesApi,
  getAssetExplorerBrandsApi,
  getAssetExplorerModelsApi,
  getAssetExplorerAssetsApi,
} from "../../api/assetExplorerApi";

/**
 * Handles all data loading for Asset Explorer.
 *
 * Important:
 * - Filters affect cards and table.
 * - Search affects table and smart search logic.
 * - Disposed assets are excluded by backend.
 */
const useAssetLoader = ({
  selectedCategory,
  selectedBrand,
  selectedModel,
  pagination,
  setPagination,
  search,
  filters,
}) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [assets, setAssets] = useState([]);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Normalizes current filter state for API requests.
   */
  const getFilterParams = useCallback(
    () => ({
      statusId: filters?.statusId || null,
      locationId: filters?.locationId || null,
      conditionId: filters?.conditionId || null,
    }),
    [filters]
  );

  /**
   * Load category cards with active filters.
   */
  const loadCategories = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getAssetExplorerCategoriesApi({
          ...getFilterParams(),
        });

        setCategories(result?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load categories.");
      } finally {
        setLoading(false);
      }
    },
    [getFilterParams]
  );

  /**
   * Load brand cards with active filters.
   */
  const loadBrands = useCallback(
    async (category) => {
      if (!category?.ITAssetCategoryId) return [];

      try {
        setLoading(true);
        setError("");

        const result = await getAssetExplorerBrandsApi(
          category.ITAssetCategoryId,
          {
            ...getFilterParams(),
          }
        );

        const list = result?.data || [];
        setBrands(list);

        return list;
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load brands.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [getFilterParams]
  );

  /**
   * Load model cards with active filters.
   */
  const loadModels = useCallback(
    async (category, brand) => {
      if (!category?.ITAssetCategoryId || !brand?.ITAssetBrandId) {
        setModels([]);
        return [];
      }

      try {
        setLoading(true);
        setError("");

        const result = await getAssetExplorerModelsApi(
          category.ITAssetCategoryId,
          brand.ITAssetBrandId,
          {
            ...getFilterParams(),
          }
        );

        const list = result?.data || [];
        setModels(list);

        return list;
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load models.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [getFilterParams]
  );

  /**
   * Load asset table rows with active filters.
   */
  const loadAssets = useCallback(
    async ({
      category = selectedCategory,
      brand = selectedBrand,
      model = selectedModel,
      page = pagination.page,
      limit = pagination.limit,
      searchValue = search,
      statusId = filters?.statusId,
      locationId = filters?.locationId,
      conditionId = filters?.conditionId,
    } = {}) => {
      try {
        setTableLoading(true);
        setError("");

        const result = await getAssetExplorerAssetsApi({
          search: searchValue,
          categoryId: category?.ITAssetCategoryId || null,
          brandId: brand?.ITAssetBrandId || null,
          modelId: model?.ITAssetModelId || null,
          statusId: statusId || null,
          locationId: locationId || null,
          conditionId: conditionId || null,
          page,
          limit,
        });

        setAssets(result?.data?.rows || []);

        setPagination((prev) => ({
          ...prev,
          page,
          limit,
          total: result?.data?.total || 0,
        }));
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load assets.");
      } finally {
        setTableLoading(false);
      }
    },
    [
      selectedCategory,
      selectedBrand,
      selectedModel,
      pagination.page,
      pagination.limit,
      search,
      filters,
      setPagination,
    ]
  );

  return {
    categories,
    brands,
    models,
    assets,

    setBrands,
    setModels,
    setAssets,

    loading,
    tableLoading,
    error,
    setError,

    loadCategories,
    loadBrands,
    loadModels,
    loadAssets,
  };
};

export default useAssetLoader;