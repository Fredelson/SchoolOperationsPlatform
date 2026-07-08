// ============================================
// Asset Explorer Navigation Hook
// Arab Unity School Operations Platform
// ============================================

/**
 * Handles hierarchy navigation:
 * Category → Brand → Model
 */
const useAssetNavigation = ({
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
}) => {
  const openCategory = async (category) => {
    resetSmartSearch();
    setSearch("");

    setSelectedCategory(category);
    setSelectedBrand(null);
    setSelectedModel(null);

    setBrands([]);
    setModels([]);
    setAssets([]);
    setLevel("brands");

    await loadBrands(category);
    await loadAssets({
      category,
      brand: null,
      model: null,
      page: 1,
      searchValue: "",
    });
  };

  const openBrand = async (brand) => {
    resetSmartSearch();
    setSearch("");

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
      searchValue: "",
    });
  };

  const openModel = async (model) => {
    resetSmartSearch();
    setSearch("");

    setSelectedModel(model);

    await loadAssets({
      category: selectedCategory,
      brand: selectedBrand,
      model,
      page: 1,
      searchValue: "",
    });
  };

  const backToCategories = () => {
    resetSmartSearch();
    setSearch("");

    setLevel("categories");
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedModel(null);

    setBrands([]);
    setModels([]);
    setAssets([]);
  };

  const backToBrands = async () => {
    resetSmartSearch();
    setSearch("");

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
      searchValue: "",
    });
  };

  return {
    openCategory,
    openBrand,
    openModel,
    backToCategories,
    backToBrands,
  };
};

export default useAssetNavigation;