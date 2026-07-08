// ============================================
// Asset Explorer Page
// Arab Unity School Operations Platform
// ============================================

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import useAssetExplorer from "../hooks/useAssetExplorer";

import {
  importItAssetsService,
  commitItAssetsImportService,
} from "../../services/itAssetImportService";

import { getAssetExplorerFilterLookupsApi } from "../api/assetExplorerApi";

import ImportDialog from "../../../../platform/import/ImportDialog";

import AssetCategoryCard from "../../../../components/itAssets/cards/AssetCategoryCard";
import AssetBrandCard from "../../../../components/itAssets/cards/AssetBrandCard";
import AssetModelCard from "../../../../components/itAssets/cards/AssetModelCard";
import AssetExplorerToolbar from "../../../../components/itAssets/toolbars/AssetExplorerToolbar";
import AssetBreadcrumb from "../../../../components/itAssets/navigation/AssetBreadcrumb";
import AssetExplorerFilters from "../../../../components/itAssets/filters/AssetExplorerFilters";
import AssetTable from "../../../../components/itAssets/tables/AssetTable";
import EmptyState from "../../../../components/itAssets/common/EmptyState";

const AssetExplorer = () => {
  const navigate = useNavigate();

  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [commitResult, setCommitResult] = useState(null);
  const [importError, setImportError] = useState("");

  const [filterLookups, setFilterLookups] = useState({
    statuses: [],
    locations: [],
    conditions: [],
  });

  const {
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
    smartSearchActive,
    smartSearchTarget,
    error,
    pagination,
    filters,
    setFilters,
    clearFilters,
    loadAssets,
    openCategory,
    openBrand,
    openModel,
    backToCategories,
    backToBrands,
    refresh,
  } = useAssetExplorer();

  useEffect(() => {
    const loadFilterLookups = async () => {
      try {
        const result = await getAssetExplorerFilterLookupsApi();

        setFilterLookups({
          statuses: result.statuses || [],
          locations: result.locations || [],
          conditions: result.conditions || [],
        });
      } catch (err) {
        console.error("Failed to load asset filter lookups:", err);
      }
    };

    loadFilterLookups();
  }, []);

  const hasActiveFilters =
  Boolean(filters.statusId) ||
  Boolean(filters.locationId) ||
  Boolean(filters.conditionId);

const visibleBrands =
  smartSearchActive && smartSearchTarget?.brandId
    ? brands.filter(
        (brand) =>
          Number(brand.ITAssetBrandId) === Number(smartSearchTarget.brandId)
      )
    : hasActiveFilters
    ? brands.filter((brand) =>
        assets.some((asset) => {
          const assetBrandId = asset.ITAssetBrandId;

          if (!assetBrandId && brand.GroupType === "NO_BRAND_MODEL") {
            return true;
          }

          return Number(assetBrandId) === Number(brand.ITAssetBrandId);
        })
      )
    : brands;

const visibleModels =
  smartSearchActive && smartSearchTarget?.modelId
    ? models.filter(
        (model) =>
          Number(model.ITAssetModelId) === Number(smartSearchTarget.modelId)
      )
    : hasActiveFilters
    ? models.filter((model) =>
        assets.some(
          (asset) => Number(asset.ITAssetModelId) === Number(model.ITAssetModelId)
        )
      )
    : models;

  const handlePreviewImport = async () => {
    if (!importFile) {
      setImportError("Please select an Excel or CSV file first.");
      return;
    }

    try {
      setImportLoading(true);
      setImportError("");
      setImportPreview(null);
      setCommitResult(null);

      const result = await importItAssetsService(importFile);
      setImportPreview(result);
    } catch (err) {
      setImportError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.join(" ") ||
          "Failed to preview IT asset import."
      );
    } finally {
      setImportLoading(false);
    }
  };

  const handleCommitImport = async () => {
    if (!importPreview?.batchId) {
      setImportError("No import batch found.");
      return;
    }

    try {
      setImportLoading(true);
      setImportError("");

      const result = await commitItAssetsImportService(importPreview.batchId);
      setCommitResult(result?.data || result);

      await refresh();
    } catch (err) {
      setImportError(
        err?.response?.data?.message || "Failed to commit IT asset import."
      );
    } finally {
      setImportLoading(false);
    }
  };

  const handleCloseImport = () => {
    setImportOpen(false);
    setImportFile(null);
    setImportPreview(null);
    setCommitResult(null);
    setImportError("");
  };

  const sectionTitle =
    level === "categories"
      ? "Asset Categories"
      : level === "brands"
      ? `${selectedCategory?.CategoryName || "Category"} Brands`
      : `${selectedBrand?.DisplayName || selectedBrand?.BrandName || "Brand"} Models`;

  const sectionSubtitle =
    level === "categories"
      ? "Click a category to view brands and assets."
      : level === "brands"
      ? "Click a brand to view models. Assets for this category are shown below."
      : "Click a model to filter the asset table.";

  const searchPlaceholder =
    level === "categories"
      ? "Search exact asset tag to locate it..."
      : "Search asset tag in this view...";

  return (
    <Box sx={{ width: "100%" }}>
      <AssetExplorerToolbar
        title="Asset Management"
        subtitle="Manage and organize all IT assets across the school."
        search={search}
        searchPlaceholder={searchPlaceholder}
        onSearchChange={setSearch}
        onRefresh={refresh}
        onImport={() => setImportOpen(true)}
        onAddAsset={() => navigate("/it-assets/new")}
        filtersContent={
          <AssetExplorerFilters
            filters={filters}
            statusOptions={filterLookups.statuses}
            locationOptions={filterLookups.locations}
            conditionOptions={filterLookups.conditions}
            onChange={setFilters}
            onClear={clearFilters}
          />
        }
      />

      <AssetBreadcrumb
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        selectedModel={selectedModel}
        onRoot={backToCategories}
        onCategory={backToBrands}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={(theme) => ({
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
        })}
      >
        <Stack sx={{ mb: 2.5 }}>
          <Typography variant="h6" fontWeight={900}>
            {sectionTitle}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {sectionSubtitle}
          </Typography>
        </Stack>

        {loading && (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        )}

        {!loading &&
          level === "categories" &&
          (categories.length === 0 ? (
            <EmptyState
              title="No categories found"
              message="Create a category or import assets to begin."
            />
          ) : (
            <Grid container spacing={2.5}>
              {categories.map((category) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={category.ITAssetCategoryId}
                >
                  <AssetCategoryCard
                    category={category}
                    onClick={openCategory}
                  />
                </Grid>
              ))}
            </Grid>
          ))}

        {!loading &&
          level === "brands" &&
          (visibleBrands.length === 0 ? (
            <EmptyState
              title="No brands found"
              message="There are no brands or fallback model groups under this category yet."
            />
          ) : (
            <Grid container spacing={2.5}>
              {visibleBrands.map((brand) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={`${brand.GroupType}-${
                    brand.ITAssetBrandId || brand.DisplayName
                  }`}
                >
                  <AssetBrandCard brand={brand} onClick={openBrand} />
                </Grid>
              ))}
            </Grid>
          ))}

        {!loading &&
          level === "models" &&
          (visibleModels.length === 0 ? (
            <EmptyState
              title="No models found"
              message="There are no models under this brand yet."
            />
          ) : (
            <Grid container spacing={2.5}>
              {visibleModels.map((model) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={model.ITAssetModelId}
                >
                  <AssetModelCard
                    model={model}
                    selected={
                      Number(selectedModel?.ITAssetModelId) ===
                      Number(model.ITAssetModelId)
                    }
                    onClick={openModel}
                  />
                </Grid>
              ))}
            </Grid>
          ))}
      </Paper>

      <Box sx={{ mt: 3 }}>
        <AssetTable
          rows={assets}
          loading={tableLoading}
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          onPageChange={(page) => loadAssets({ page })}
          onLimitChange={(limit) => loadAssets({ page: 1, limit })}
          onRowClick={(asset) => navigate(`/it-assets/${asset.AssetId}`)}
        />
      </Box>

      <ImportDialog
        open={importOpen}
        title="Import IT Assets"
        requiredColumns="AssetCode, Category, Brand, Model, Status"
        file={importFile}
        loading={importLoading}
        preview={importPreview}
        commitResult={commitResult}
        error={importError}
        accept=".xlsx,.xls,.csv"
        csvTemplateUrl="/templates/IT_Assets_Import_Template.csv"
        excelTemplateUrl="/templates/IT_Assets_Import_Template.xlsx"
        onClose={handleCloseImport}
        onFileChange={(file) => {
          setImportFile(file);
          setImportPreview(null);
          setCommitResult(null);
          setImportError("");
        }}
        onPreview={handlePreviewImport}
        onCommit={handleCommitImport}
      />
    </Box>
  );
};

export default AssetExplorer;