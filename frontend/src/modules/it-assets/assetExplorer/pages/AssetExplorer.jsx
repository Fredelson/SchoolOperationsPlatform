// ============================================
// Asset Explorer Page
// Arab Unity School Operations Platform
// ============================================

import { useState } from "react";
import { Alert, Box, CircularProgress, Grid, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

import useAssetExplorer from "../hooks/useAssetExplorer";

import AssetCategoryCard from "../../../../components/itAssets/cards/AssetCategoryCard";
import AssetBrandCard from "../../../../components/itAssets/cards/AssetBrandCard";
import AssetModelCard from "../../../../components/itAssets/cards/AssetModelCard";
import AssetExplorerToolbar from "../../../../components/itAssets/toolbars/AssetExplorerToolbar";
import AssetBreadcrumb from "../../../../components/itAssets/navigation/AssetBreadcrumb";
import AssetTable from "../../../../components/itAssets/tables/AssetTable";
import EmptyState from "../../../../components/itAssets/common/EmptyState";

/**
 * IMPORTANT:
 * This is the existing IT Asset Import dialog.
 * We are reusing it for now.
 * Do not delete or move the old import files yet.
 */
import ImportAssetDialog from "../../dialogs/ImportAssetDialog";

/**
 * Asset Management entry page.
 *
 * Hierarchy:
 * Category → Brand → Model → Asset Table
 */
const AssetExplorer = () => {
  const navigate = useNavigate();

  const [importOpen, setImportOpen] = useState(false);

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
    error,
    pagination,
    loadAssets,
    openCategory,
    openBrand,
    openModel,
    backToCategories,
    backToBrands,
    refresh,
  } = useAssetExplorer();

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <AssetExplorerToolbar
        title="Asset Management"
        subtitle="Browse IT assets by category, brand, model, and asset details."
        search={search}
        onSearchChange={setSearch}
        onRefresh={refresh}
        onImport={() => setImportOpen(true)}
        onAddCategory={() => navigate("/it-assets/categories/new")}
        onAddAsset={() => navigate("/it-assets/new")}
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

      {loading && (
        <Stack alignItems="center" sx={{ py: 5 }}>
          <CircularProgress />
        </Stack>
      )}

      {!loading && level === "categories" && (
        <>
          {categories.length === 0 ? (
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
          )}
        </>
      )}

      {!loading && level === "brands" && (
        <Stack spacing={3}>
          {brands.length === 0 ? (
            <EmptyState
              title="No brands found"
              message="There are no brands under this category yet."
            />
          ) : (
            <Grid container spacing={2.5}>
              {brands.map((brand) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={brand.ITAssetBrandId}
                >
                  <AssetBrandCard brand={brand} onClick={openBrand} />
                </Grid>
              ))}
            </Grid>
          )}

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
        </Stack>
      )}

      {!loading && level === "models" && (
        <Stack spacing={3}>
          {models.length === 0 ? (
            <EmptyState
              title="No models found"
              message="There are no models under this brand yet."
            />
          ) : (
            <Grid container spacing={2.5}>
              {models.map((model) => (
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
                      selectedModel?.ITAssetModelId === model.ITAssetModelId
                    }
                    onClick={openModel}
                  />
                </Grid>
              ))}
            </Grid>
          )}

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
        </Stack>
      )}

      <ImportAssetDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          setImportOpen(false);
          refresh();
        }}
      />
    </Box>
  );
};

export default AssetExplorer;