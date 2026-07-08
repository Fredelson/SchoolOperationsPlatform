// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// IT Asset Management Page
// ============================================

import { useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

import usePageTitle from "../../../platform/hooks/usePageTitle";

import {
  AppBreadcrumbs,
  AppButton,
  AppDataTable,
  AppEmptyState,
  AppPageHeader,
  AppSearch,
  AppToolbar,
} from "../../../platform/ui";

import { useAssetList } from "../hooks/useAssetList";
import { buildAssetColumns } from "../columns/assetColumns.jsx";
import ImportAssetDialog from "../dialogs/ImportAssetDialog";

export default function AssetList() {
  usePageTitle("AUS | IT Asset Management");

  const navigate = useNavigate();
  const [importOpen, setImportOpen] = useState(false);

  const {
    assets,
    pagination,
    search,
    loading,
    error,
    refetch,
    handleSearchChange,
    handleSearchSubmit,
    handlePageChange,
    handleRowsPerPageChange,
  } = useAssetList();

  const handlers = {
    onView: (asset) => navigate(`/it-assets/assets/${asset.assetId || asset.id}`),
    onEdit: (asset) => console.log("Edit asset:", asset),
    onAssign: (asset) => console.log("Assign asset:", asset),
    onBorrow: (asset) => console.log("Borrow asset:", asset),
    onTransfer: (asset) => console.log("Transfer asset:", asset),
    onMaintenance: (asset) => console.log("Maintenance asset:", asset),
    onDispose: (asset) => console.log("Dispose asset:", asset),
  };

  const columns = buildAssetColumns(handlers);

  if (error) {
    return (
      <AppEmptyState
        title="Unable to load IT assets"
        message={error}
        action={<AppButton onClick={() => refetch()}>Retry</AppButton>}
      />
    );
  }

  return (
    <Box>
      <AppBreadcrumbs
        items={[
          { label: "IT Operations", path: "/it-assets/dashboard" },
          { label: "Asset Management", path: "/it-assets/assets" },
        ]}
      />

      <AppPageHeader
        title="Asset Management"
        subtitle="Manage IT assets, assignments, borrowing, transfers, issues, maintenance, and disposals."
      />

      <AppToolbar
        left={
          <AppSearch
            value={search}
            onChange={handleSearchChange}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearchSubmit();
              }
            }}
            placeholder="Search asset code, name, serial number, brand, model, or location..."
          />
        }
        right={
          <>
            <AppButton variant="outlined" onClick={() => refetch()}>
              Refresh
            </AppButton>

            <AppButton variant="outlined" onClick={() => setImportOpen(true)}>
              Import
            </AppButton>

            <AppButton onClick={() => console.log("Create asset")}>
              Add Asset
            </AppButton>
          </>
        }
      />

      <AppDataTable
        columns={columns}
        rows={assets}
        loading={loading}
        page={pagination.page}
        rowsPerPage={pagination.rowsPerPage}
        totalRows={pagination.totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        getRowId={(row) => row.assetId || row.id}
        emptyTitle="No IT assets found"
        emptyMessage="Try adjusting your search or add a new IT asset."
        stickyHeader
      />

      <ImportAssetDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          setImportOpen(false);
          refetch();
        }}
      />
    </Box>
  );
}