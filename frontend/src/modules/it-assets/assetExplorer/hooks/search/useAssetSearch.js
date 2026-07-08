// ============================================
// Asset Explorer Search Hook
// Arab Unity School Operations Platform
// ============================================

import { useCallback, useEffect, useRef, useState } from "react";

import { findAssetPathApi } from "../../api/assetExplorerApi";

/**
 * Handles:
 * - Exact AssetTag smart search
 * - Partial asset table search
 * - Smart-search card filtering state
 */
const useAssetSearch = ({
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
}) => {
  const [smartSearching, setSmartSearching] = useState(false);
  const [smartSearchActive, setSmartSearchActive] = useState(false);
  const [smartSearchTarget, setSmartSearchTarget] = useState(null);

  const lastSmartSearchRef = useRef("");

  const resetSmartSearch = useCallback(() => {
    lastSmartSearchRef.current = "";
    setSmartSearchActive(false);
    setSmartSearchTarget(null);
  }, []);

  const smartSearchAssetTag = useCallback(
    async (value) => {
      const cleanValue = value?.trim();
      const normalizedValue = cleanValue?.toUpperCase();

      if (!cleanValue || cleanValue.length < 3) return false;

      try {
        setSmartSearching(true);
        setError("");

        const result = await findAssetPathApi(cleanValue);
        const asset = result?.data;

        if (!asset?.AssetId) return false;

        lastSmartSearchRef.current = normalizedValue;
        setSmartSearchActive(true);

        setSmartSearchTarget({
          categoryId: asset.ITAssetCategoryId,
          brandId: asset.ITAssetBrandId,
          modelId: asset.ITAssetModelId,
          assetTag: asset.AssetTag,
        });

        const category = {
          ITAssetCategoryId: asset.ITAssetCategoryId,
          CategoryName: asset.CategoryName,
          IconKey: asset.IconKey,
        };

        const brand = asset.ITAssetBrandId
          ? {
              ITAssetBrandId: asset.ITAssetBrandId,
              BrandName: asset.BrandName,
              DisplayName: asset.BrandName,
              GroupType: "BRAND",
            }
          : null;

        const model = asset.ITAssetModelId
          ? {
              ITAssetModelId: asset.ITAssetModelId,
              ModelName: asset.ModelName || asset.ModelDescription,
            }
          : null;

        setSelectedCategory(category);
        setSelectedBrand(brand);
        setSelectedModel(model);
        setLevel(brand ? "models" : "brands");

        const brandList = await loadBrands(category);

        const finalBrand =
          brandList.find(
            (item) =>
              Number(item.ITAssetBrandId) === Number(brand?.ITAssetBrandId)
          ) || brand;

        if (finalBrand) {
          setSelectedBrand(finalBrand);
        }

        let finalModel = model;

        if (finalBrand) {
          const modelList = await loadModels(category, finalBrand);

          finalModel =
            modelList.find(
              (item) =>
                Number(item.ITAssetModelId) === Number(model?.ITAssetModelId)
            ) || model;

          if (finalModel) {
            setSelectedModel(finalModel);
          }
        } else {
          setModels([]);
        }

        await loadAssets({
          category,
          brand: finalBrand,
          model: finalModel,
          page: 1,
          searchValue: cleanValue,
        });

        return true;
      } catch {
        return false;
      } finally {
        setSmartSearching(false);
      }
    },
    [
      loadAssets,
      loadBrands,
      loadModels,
      setError,
      setLevel,
      setModels,
      setSelectedBrand,
      setSelectedCategory,
      setSelectedModel,
    ]
  );

  useEffect(() => {
    const timer = setTimeout(async () => {
      const cleanSearch = search.trim();
      const normalizedSearch = cleanSearch.toUpperCase();

      if (!cleanSearch) {
        resetSmartSearch();

        await loadAssets({
          category: level === "categories" ? null : selectedCategory,
          brand: level === "models" ? selectedBrand : null,
          model: level === "models" ? selectedModel : null,
          page: 1,
          searchValue: "",
        });

        return;
      }

      if (
        smartSearchActive &&
        smartSearchTarget?.assetTag?.toUpperCase() === normalizedSearch
      ) {
        await loadAssets({
          category: level === "categories" ? null : selectedCategory,
          brand: level === "models" ? selectedBrand : null,
          model: level === "models" ? selectedModel : null,
          page: 1,
          searchValue: cleanSearch,
        });

        return;
      }

      const foundExactAsset = await smartSearchAssetTag(cleanSearch);

      if (foundExactAsset) return;

      setSmartSearchActive(false);
      setSmartSearchTarget(null);

      await loadAssets({
        category: level === "categories" ? null : selectedCategory,
        brand: level === "models" ? selectedBrand : null,
        model: level === "models" ? selectedModel : null,
        page: 1,
        searchValue: cleanSearch,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [
    search,
    level,
    selectedCategory,
    selectedBrand,
    selectedModel,
    smartSearchActive,
    smartSearchTarget,
    loadAssets,
    resetSmartSearch,
    smartSearchAssetTag,
  ]);

  return {
    smartSearching,
    smartSearchActive,
    smartSearchTarget,
    resetSmartSearch,
  };
};

export default useAssetSearch;