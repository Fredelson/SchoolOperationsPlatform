// ============================================
// useAssetExplorer Coordinator Hook
// Arab Unity School Operations Platform
// ============================================

import { useEffect, useRef, useState } from "react";

import useAssetLoader from "./core/useAssetLoader";
import useAssetFilters from "./filters/useAssetFilters";
import useAssetNavigation from "./navigation/useAssetNavigation";
import useAssetPagination from "./pagination/useAssetPagination";
import useAssetRefresh from "./refresh/useAssetRefresh";
import useAssetSearch from "./search/useAssetSearch";

const useAssetExplorer = () => {
  const [level, setLevel] = useState("categories");

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  const [search, setSearch] = useState("");

  const initialLoadDoneRef = useRef(false);

  const { pagination, setPagination, resetPagination } = useAssetPagination();

  const {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    filterLookups,
    filterLookupLoading,
  } = useAssetFilters();

  const {
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
  } = useAssetLoader({
    selectedCategory,
    selectedBrand,
    selectedModel,
    pagination,
    setPagination,
    search,
    filters,
  });

  const {
    smartSearching,
    smartSearchActive,
    smartSearchTarget,
    resetSmartSearch,
  } = useAssetSearch({
    search,
    level,
    selectedCategory,
    selectedBrand,
    selectedModel,
    setSelectedCategory,
    setSelectedBrand,
    setSelectedModel,
    setLevel,
    setModels,
    loadBrands,
    loadModels,
    loadAssets,
    setError,
  });

  const {
    openCategory,
    openBrand,
    openModel,
    backToCategories,
    backToBrands,
  } = useAssetNavigation({
    selectedCategory,
    selectedBrand,
    setSearch,
    setLevel,
    setSelectedCategory,
    setSelectedBrand,
    setSelectedModel,
    setBrands,
    setModels,
    setAssets,
    loadBrands,
    loadModels,
    loadAssets,
    resetSmartSearch,
  });

  const { refresh } = useAssetRefresh({
    level,
    search,
    selectedCategory,
    selectedBrand,
    selectedModel,
    loadCategories,
    loadBrands,
    loadModels,
    loadAssets,
  });

  useEffect(() => {
    const loadInitialAssetManagement = async () => {
      await loadCategories();

      await loadAssets({
        category: null,
        brand: null,
        model: null,
        page: 1,
        searchValue: "",
      });

      initialLoadDoneRef.current = true;
    };

    loadInitialAssetManagement();
  }, [loadCategories, loadAssets]);

  useEffect(() => {
    if (!initialLoadDoneRef.current) return;

    const reloadExplorerForFilters = async () => {
      if (level === "categories") {
        await loadCategories();

        await loadAssets({
          category: null,
          brand: null,
          model: null,
          page: 1,
          searchValue: search,
        });

        return;
      }

      if (level === "brands") {
        await loadBrands(selectedCategory);

        await loadAssets({
          category: selectedCategory,
          brand: null,
          model: null,
          page: 1,
          searchValue: search,
        });

        return;
      }

      if (level === "models") {
        const isNoBrandModel =
          selectedBrand?.GroupType === "NO_BRAND_MODEL";

        /*
          No Brand / Model is a synthetic group.
          It has no real BrandId, so we do not load model cards for it.
          The asset table will be filtered using noBrandModel=true in useAssetLoader.
        */
        if (isNoBrandModel) {
          setModels([]);

          await loadAssets({
            category: selectedCategory,
            brand: selectedBrand,
            model: null,
            page: 1,
            searchValue: search,
          });

          return;
        }

        await loadModels(selectedCategory, selectedBrand);

        await loadAssets({
          category: selectedCategory,
          brand: selectedBrand,
          model: selectedModel,
          page: 1,
          searchValue: search,
        });
      }
    };

    reloadExplorerForFilters();
  }, [
    filters,
    level,
    selectedCategory,
    selectedBrand,
    selectedModel,
    search,
    loadCategories,
    loadBrands,
    loadModels,
    loadAssets,
    setModels,
  ]);

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
    smartSearching,
    smartSearchActive,
    smartSearchTarget,
    error,
    pagination,
    setPagination,
    resetPagination,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    filterLookups,
    filterLookupLoading,
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