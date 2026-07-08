// ============================================
// useAssetExplorer Hook
// Arab Unity School Operations Platform
// ============================================

import { useCallback, useEffect, useState } from "react";

import {
  getAssetExplorerCategoriesApi,
  getAssetExplorerBrandsApi,
  getAssetExplorerModelsApi,
  getAssetExplorerAssetsApi,
} from "../api/assetExplorerApi";

/**
 * Central state manager for Asset Explorer.
 *
 * Handles:
 * - Category level
 * - Brand level
 * - Model level
 * - Asset table data
 */
const useAssetExplorer = () => {
  const [level, setLevel] = useState("categories");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [assets, setAssets] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAssetExplorerCategoriesApi({ search });

      setCategories(result?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const loadBrands = useCallback(
    async (category = selectedCategory) => {
      if (!category?.ITAssetCategoryId) return;

      try {
        setLoading(true);
        setError("");

        const result = await getAssetExplorerBrandsApi(
          category.ITAssetCategoryId,
          { search }
        );

        setBrands(result?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load brands.");
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory, search]
  );

  const loadModels = useCallback(
    async (category = selectedCategory, brand = selectedBrand) => {
      if (!category?.ITAssetCategoryId || !brand?.ITAssetBrandId) return;

      try {
        setLoading(true);
        setError("");

        const result = await getAssetExplorerModelsApi(
          category.ITAssetCategoryId,
          brand.ITAssetBrandId,
          { search }
        );

        setModels(result?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load models.");
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory, selectedBrand, search]
  );

  const loadAssets = useCallback(
    async ({
      category = selectedCategory,
      brand = selectedBrand,
      model = selectedModel,
      page = pagination.page,
      limit = pagination.limit,
    } = {}) => {
      try {
        setTableLoading(true);

        const result = await getAssetExplorerAssetsApi({
          search,
          categoryId: category?.ITAssetCategoryId || null,
          brandId: brand?.ITAssetBrandId || null,
          modelId: model?.ITAssetModelId || null,
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
    [selectedCategory, selectedBrand, selectedModel, search, pagination.page, pagination.limit]
  );

  const openCategory = async (category) => {
    setSelectedCategory(category);
    setSelectedBrand(null);
    setSelectedModel(null);
    setBrands([]);
    setModels([]);
    setAssets([]);
    setLevel("brands");

    await loadBrands(category);
    await loadAssets({ category, brand: null, model: null, page: 1 });
  };

  const openBrand = async (brand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setModels([]);
    setLevel("models");

    await loadModels(selectedCategory, brand);
    await loadAssets({
      category: selectedCategory,
      brand,
      model: null,
      page: 1,
    });
  };

  const openModel = async (model) => {
    setSelectedModel(model);

    await loadAssets({
      category: selectedCategory,
      brand: selectedBrand,
      model,
      page: 1,
    });
  };

  const backToCategories = () => {
    setLevel("categories");
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedModel(null);
    setBrands([]);
    setModels([]);
    setAssets([]);
  };

  const backToBrands = async () => {
    setLevel("brands");
    setSelectedBrand(null);
    setSelectedModel(null);
    setModels([]);

    await loadBrands(selectedCategory);
    await loadAssets({
      category: selectedCategory,
      brand: null,
      model: null,
      page: 1,
    });
  };

  const refresh = async () => {
    if (level === "categories") return loadCategories();
    if (level === "brands") {
      await loadBrands();
      return loadAssets({ page: 1 });
    }
    if (level === "models") {
      await loadModels();
      return loadAssets({ page: 1 });
    }
  };

  useEffect(() => {
    if (level === "categories") {
      loadCategories();
    }
  }, [level, loadCategories]);

  return {
    level,
    categories,
    brands,
    models,
    assets,
    selectedCategory,
    selectedBrand,
    selectedModel,
    search,
    setSearch,
    loading,
    tableLoading,
    error,
    pagination,
    setPagination,
    loadAssets,
    openCategory,
    openBrand,
    openModel,
    backToCategories,
    backToBrands,
    refresh,
  };
};

export default useAssetExplorer;