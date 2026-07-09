// ============================================
// Asset Explorer Page
// Arab Unity School Operations Platform
// ============================================

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
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

import ImportDialog from "../../../../platform/import/ImportDialog";

import AssetCategoryCard from "../../../../components/itAssets/cards/AssetCategoryCard";
import AssetBrandCard from "../../../../components/itAssets/cards/AssetBrandCard";
import AssetModelCard from "../../../../components/itAssets/cards/AssetModelCard";
import AssetExplorerToolbar from "../../../../components/itAssets/toolbars/AssetExplorerToolbar";
import AssetBreadcrumb from "../../../../components/itAssets/navigation/AssetBreadcrumb";
import AssetExplorerFilters from "../../../../components/itAssets/filters/AssetExplorerFilters";
import AssetTable from "../../../../components/itAssets/tables/AssetTable";
import EmptyState from "../../../../components/itAssets/common/EmptyState";

const MAX_VISIBLE_CARDS = 12;

const AssetExplorer = () => {
  const navigate = useNavigate();

  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [commitResult, setCommitResult] = useState(null);
  const [importError, setImportError] = useState("");

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllModels, setShowAllModels] = useState(false);

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
    hasActiveFilters,
    filterLookups,
    loadAssets,
    openCategory,
    openBrand,
    openModel,
    backToCategories,
    backToBrands,
    refresh,
  } = useAssetExplorer();

  const visibleBrands =
    smartSearchActive && smartSearchTarget?.brandId
      ? brands.filter(
          (brand) =>
            Number(brand.ITAssetBrandId) === Number(smartSearchTarget.brandId)
        )
      : hasActiveFilters
      ? brands.filter((brand) =>
          assets.some((asset) => {
            if (!asset.ITAssetBrandId && brand.GroupType === "NO_BRAND_MODEL") {
              return true;
            }

            return Number(asset.ITAssetBrandId) === Number(brand.ITAssetBrandId);
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
            (asset) =>
              Number(asset.ITAssetModelId) === Number(model.ITAssetModelId)
          )
        )
      : models;

  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, MAX_VISIBLE_CARDS);

  const displayedBrands = showAllBrands
    ? visibleBrands
    : visibleBrands.slice(0, MAX_VISIBLE_CARDS);

  const displayedModels = showAllModels
    ? visibleModels
    : visibleModels.slice(0, MAX_VISIBLE_CARDS);

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
          p: { xs: 1.5, md: 2 },
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
        })}
      >
        <Stack sx={{ mb: 2 }}>
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
            <>
              <Grid container spacing={1}>
                {displayedCategories.map((category) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    lg={3}
                    xl={3}
                    key={category.ITAssetCategoryId}
                  >
                    <AssetCategoryCard
                      category={category}
                      onClick={openCategory}
                    />
                  </Grid>
                ))}
              </Grid>

              {categories.length > MAX_VISIBLE_CARDS && (
                <ShowMoreButton
                  showAll={showAllCategories}
                  hiddenCount={categories.length - MAX_VISIBLE_CARDS}
                  onClick={() => setShowAllCategories((prev) => !prev)}
                />
              )}
            </>
          ))}

        {!loading &&
          level === "brands" &&
          (visibleBrands.length === 0 ? (
            <EmptyState
              title="No brands found"
              message="There are no brands or matching assets under this category."
            />
          ) : (
            <>
              <Grid container spacing={1}>
                {displayedBrands.map((brand) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    lg={3}
                    xl={3}
                    key={`${brand.GroupType}-${
                      brand.ITAssetBrandId || brand.DisplayName
                    }`}
                  >
                    <AssetBrandCard brand={brand} onClick={openBrand} />
                  </Grid>
                ))}
              </Grid>

              {visibleBrands.length > MAX_VISIBLE_CARDS && (
                <ShowMoreButton
                  showAll={showAllBrands}
                  hiddenCount={visibleBrands.length - MAX_VISIBLE_CARDS}
                  onClick={() => setShowAllBrands((prev) => !prev)}
                />
              )}
            </>
          ))}

        {!loading &&
          level === "models" &&
          (visibleModels.length === 0 ? (
            <EmptyState
              title="No models found"
              message="There are no models or matching assets under this brand."
            />
          ) : (
            <>
              <Grid container spacing={1}>
                {displayedModels.map((model) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    lg={3}
                    xl={3}
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

              {visibleModels.length > MAX_VISIBLE_CARDS && (
                <ShowMoreButton
                  showAll={showAllModels}
                  hiddenCount={visibleModels.length - MAX_VISIBLE_CARDS}
                  onClick={() => setShowAllModels((prev) => !prev)}
                />
              )}
            </>
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

const ShowMoreButton = ({ showAll, hiddenCount, onClick }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
      <Button variant="outlined" onClick={onClick}>
        {showAll ? "Show Less" : `Show ${hiddenCount} More`}
      </Button>
    </Box>
  );
};

export default AssetExplorer;