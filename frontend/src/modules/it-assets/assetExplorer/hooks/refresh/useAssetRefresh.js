// ============================================
// Asset Explorer Refresh Hook
// Arab Unity School Operations Platform
// ============================================

const useAssetRefresh = ({
  level,
  search,
  selectedCategory,
  selectedBrand,
  selectedModel,

  loadCategories,
  loadBrands,
  loadModels,
  loadAssets,
}) => {
  const refresh = async () => {
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

  return { refresh };
};

export default useAssetRefresh;