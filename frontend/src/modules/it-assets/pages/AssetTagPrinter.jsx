// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Asset Tag Printer Page
// ============================================================
//
// Purpose:
// - Load IT assets from the existing service.
// - Search and select assets.
// - Preview barcode and QR-code labels.
// - Support A4 layouts:
//   - 3 × 7
//   - 3 × 8
//   - 4 × 7
//   - 4 × 8
// - Open the browser print dialog.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Box,
  Stack,
  Typography,
} from "@mui/material";

import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import usePageTitle from "../../../platform/hooks/usePageTitle";

import {
  AppBreadcrumbs,
  AppButton,
  AppCard,
  AppEmptyState,
  AppPageHeader,
} from "../../../platform/ui";

import { getItAssetsService } from "../services/itAssetService";

import AssetPrinterToolbar from "../components/assetTagPrinter/AssetPrinterToolbar";
import AssetPrinterTable from "../components/assetTagPrinter/AssetPrinterTable";

import AssetLabelGrid, {
  ASSET_LABEL_LAYOUTS,
} from "../components/labels/AssetLabelGrid";

// ============================================================
// Helpers
// ============================================================

const getAssetId = (asset) => {
  const value =
    asset?.AssetId ??
    asset?.assetId ??
    asset?.Id ??
    asset?.id;

  return value === undefined || value === null
    ? ""
    : String(value);
};

const getAssetValue = (asset, keys = [], fallback = "") => {
  for (const key of keys) {
    const value = asset?.[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return fallback;
};

const buildAssetSearchText = (asset) => {
  const values = [
    getAssetValue(asset, [
      "AssetTag",
      "assetTag",
      "AssetCode",
      "assetCode",
    ]),

    getAssetValue(asset, [
      "SerialNumber",
      "serialNumber",
      "SerialIpMac",
      "serialIpMac",
    ]),

    getAssetValue(asset, [
      "CategoryName",
      "categoryName",
      "Category",
      "category",
    ]),

    getAssetValue(asset, [
      "BrandName",
      "brandName",
      "Brand",
      "brand",
    ]),

    getAssetValue(asset, [
      "ModelName",
      "modelName",
      "Model",
      "model",
      "ModelDescription",
      "modelDescription",
    ]),

    getAssetValue(asset, [
      "StatusName",
      "statusName",
      "Status",
      "status",
    ]),

    getAssetValue(asset, [
      "ConditionName",
      "conditionName",
      "Condition",
      "condition",
    ]),

    getAssetValue(asset, [
      "LocationName",
      "locationName",
      "Location",
      "location",
    ]),

    getAssetValue(asset, [
      "RoomName",
      "roomName",
      "RoomNumber",
      "roomNumber",
      "Room",
      "room",
    ]),

    getAssetValue(asset, [
      "DepartmentName",
      "departmentName",
      "Department",
      "department",
    ]),

    getAssetValue(asset, [
      "CurrentAssignedName",
      "currentAssignedName",
      "AssignedPersonName",
      "assignedPersonName",
    ]),

    getAssetValue(asset, [
      "CurrentEmployeeCode",
      "currentEmployeeCode",
      "EmployeeCode",
      "employeeCode",
    ]),
  ];

  return values
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
    .join(" ");
};

// ============================================================
// Component
// ============================================================

function AssetTagPrinter() {
  usePageTitle("Asset Tag Printer");

  // ==========================================================
  // State
  // ==========================================================

  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);

  const [search, setSearch] = useState("");
  const [layoutKey, setLayoutKey] = useState("4x7");

  const [options, setOptions] = useState({
    showQrCode: true,
    showBarcode: true,
    showLogo: true,
    showBorder: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // Load Assets
  // ==========================================================

  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getItAssetsService({
        page: 1,
        limit: 100,
      });

      const loadedAssets = Array.isArray(result?.assets)
        ? result.assets
        : [];

      setAssets(loadedAssets);

      const availableAssetIds = new Set(
        loadedAssets
          .map((asset) => getAssetId(asset))
          .filter(Boolean)
      );

      setSelectedAssets((current) =>
        current.filter((asset) =>
          availableAssetIds.has(getAssetId(asset))
        )
      );
    } catch (err) {
      console.error(
        "Failed to load assets for label printing:",
        err
      );

      setAssets([]);
      setSelectedAssets([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load IT assets."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // ==========================================================
  // Filtering
  // ==========================================================

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return assets;
    }

    return assets.filter((asset) =>
      buildAssetSearchText(asset).includes(query)
    );
  }, [assets, search]);

  // ==========================================================
  // Selection
  // ==========================================================

  const selectedIds = useMemo(
    () =>
      selectedAssets
        .map((asset) => getAssetId(asset))
        .filter(Boolean),
    [selectedAssets]
  );

  const handleToggleAsset = useCallback((asset) => {
    const assetId = getAssetId(asset);

    if (!assetId) {
      return;
    }

    setSelectedAssets((current) => {
      const isSelected = current.some(
        (selectedAsset) =>
          getAssetId(selectedAsset) === assetId
      );

      if (isSelected) {
        return current.filter(
          (selectedAsset) =>
            getAssetId(selectedAsset) !== assetId
        );
      }

      return [...current, asset];
    });
  }, []);

  const handleToggleAll = useCallback(
    (assetIds, checked) => {
      const normalizedIds = Array.isArray(assetIds)
        ? assetIds.map(String)
        : [];

      if (!normalizedIds.length) {
        return;
      }

      if (!checked) {
        setSelectedAssets((current) =>
          current.filter(
            (asset) =>
              !normalizedIds.includes(getAssetId(asset))
          )
        );

        return;
      }

      setSelectedAssets((current) => {
        const existingIds = new Set(
          current.map((asset) => getAssetId(asset))
        );

        const additions = filteredAssets.filter((asset) => {
          const assetId = getAssetId(asset);

          return (
            normalizedIds.includes(assetId) &&
            !existingIds.has(assetId)
          );
        });

        return [...current, ...additions];
      });
    },
    [filteredAssets]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedAssets([]);
  }, []);

  // ==========================================================
  // Layout and Options
  // ==========================================================

  const selectedLayout =
    ASSET_LABEL_LAYOUTS[layoutKey] ||
    ASSET_LABEL_LAYOUTS["4x7"];

  const labelsPerPage = selectedLayout.capacity;

  const pagesRequired =
    selectedAssets.length > 0
      ? Math.ceil(
          selectedAssets.length / labelsPerPage
        )
      : 0;

  const handleLayoutChange = useCallback(
    (nextLayoutKey) => {
      if (!ASSET_LABEL_LAYOUTS[nextLayoutKey]) {
        return;
      }

      setLayoutKey(nextLayoutKey);
    },
    []
  );

  const handleOptionChange = useCallback(
    (optionKey, checked) => {
      setOptions((current) => ({
        ...current,
        [optionKey]: Boolean(checked),
      }));
    },
    []
  );

  // ==========================================================
  // Print
  // ==========================================================

  const handlePrint = useCallback(() => {
    if (!selectedAssets.length) {
      return;
    }

    window.print();
  }, [selectedAssets.length]);

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <Box>
      <AppBreadcrumbs
        items={[
          {
            label: "IT Assets",
            to: "/it-assets/dashboard",
          },
          {
            label: "Asset Tag Printer",
          },
        ]}
      />

      <AppPageHeader
        title="Asset Tag Printer"
        subtitle="Select IT assets and print barcode and QR-code labels on standard A4 paper."
        actions={
          <AppButton
            variant="outlined"
            startIcon={<RefreshOutlinedIcon />}
            onClick={loadAssets}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </AppButton>
        }
      />

      <Stack spacing={3}>
        {error && (
          <AppCard>
            <AppEmptyState
              title="Unable to load assets"
              message={error}
              actionLabel="Retry"
              onAction={loadAssets}
            />
          </AppCard>
        )}

        {!error && (
          <AssetPrinterToolbar
            search={search}
            layoutKey={layoutKey}
            options={options}
            selectedCount={selectedAssets.length}
            onSearchChange={setSearch}
            onLayoutChange={handleLayoutChange}
            onOptionChange={handleOptionChange}
            onClearSelection={handleClearSelection}
            onPrint={handlePrint}
          />
        )}

        {!error && (
          <AppCard>
            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              alignItems={{
                xs: "flex-start",
                md: "center",
              }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={900}
                >
                  {selectedAssets.length}{" "}
                  {selectedAssets.length === 1
                    ? "asset"
                    : "assets"}{" "}
                  selected
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Select assets from the list to include
                  them in the print preview.
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={3}
                flexWrap="wrap"
                useFlexGap
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    Layout
                  </Typography>

                  <Typography fontWeight={900}>
                    {selectedLayout.label}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    Labels per page
                  </Typography>

                  <Typography fontWeight={900}>
                    {labelsPerPage}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    Pages required
                  </Typography>

                  <Typography fontWeight={900}>
                    {pagesRequired}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </AppCard>
        )}

        {!error && (
          <Box className="asset-printer-screen-content">
            <AssetPrinterTable
              assets={filteredAssets}
              selectedIds={selectedIds}
              loading={loading}
              onToggle={handleToggleAsset}
              onToggleAll={handleToggleAll}
            />
          </Box>
        )}

        {!error && selectedAssets.length > 0 && (
          <Box>
            <Typography
              variant="h6"
              fontWeight={900}
              sx={{ mb: 1 }}
            >
              A4 Print Preview
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Use A4 paper, portrait orientation, 100%
              scale, no margins, and enable background
              graphics.
            </Typography>

            <Box
              className="asset-printer-preview-container"
              sx={{
                width: "100%",
                minWidth: 0,
                overflow: "hidden",
                bgcolor: "grey.100",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                p: {
                  xs: 1,
                  sm: 1.5,
                  md: 2,
                },
              }}
            >
              <Box
                className="asset-printer-preview-viewport"
                sx={{
                  width: "100%",
                  minWidth: 0,
                  overflow: "auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                <Box className="asset-printer-preview">
                  <AssetLabelGrid
                    assets={selectedAssets}
                    layoutKey={layoutKey}
                    showQrCode={options.showQrCode}
                    showBarcode={options.showBarcode}
                    showLogo={options.showLogo}
                    showBorder={options.showBorder}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {!error &&
          !loading &&
          filteredAssets.length > 0 &&
          selectedAssets.length === 0 && (
            <AppCard>
              <AppEmptyState
                title="No assets selected"
                message="Select one or more assets from the table to generate the A4 label preview."
              />
            </AppCard>
          )}
      </Stack>
    </Box>
  );
}

export default AssetTagPrinter;