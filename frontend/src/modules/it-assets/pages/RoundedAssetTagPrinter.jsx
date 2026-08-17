import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import usePageTitle from "../../../platform/hooks/usePageTitle";
import {
  AppBreadcrumbs,
  AppButton,
  AppCard,
  AppEmptyState,
  AppFilterBar,
  AppFormField,
  AppLoadingState,
  AppPageHeader,
} from "../../../platform/ui";

import {
  getItAssetsService,
  getItAssetLookupsService,
} from "../services/itAssetService";
import { getAssetTagBranding } from "../services/assetTagBrandingService";
import AssetPrinterToolbar from "../components/assetTagPrinter/AssetPrinterToolbar";
import AssetPrinterTable from "../components/assetTagPrinter/AssetPrinterTable";
import RoundedAssetLabel from "../components/labels/RoundedAssetLabel";
import { ASSET_LABEL_LAYOUTS } from "../components/labels/AssetLabelGrid";

import "./roundedAssetTagPrint.css";

const valueFrom = (source, keys, fallback = "") => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null && String(value).trim()) {
      return value;
    }
  }

  return fallback;
};

const getAssetId = (asset) =>
  String(valueFrom(asset, ["AssetId", "assetId", "Id", "id"]));

const getAssetCode = (asset) =>
  String(valueFrom(asset, ["AssetTag", "assetTag", "AssetCode", "assetCode"]))
    .trim()
    .toUpperCase();

const buildSearchText = (asset) =>
  [
    getAssetCode(asset),
    valueFrom(asset, ["AssetName", "assetName"]),
    valueFrom(asset, ["BrandName", "brandName"]),
    valueFrom(asset, ["ModelName", "modelName"]),
    valueFrom(asset, ["SerialIpMac", "serialIpMac", "SerialNumber", "serialNumber"]),
    valueFrom(asset, ["LocationName", "locationName"]),
    valueFrom(asset, ["RoomName", "roomName"]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const splitIntoPages = (items, capacity) => {
  const pages = [];

  for (let index = 0; index < items.length; index += capacity) {
    pages.push(items.slice(index, index + capacity));
  }

  return pages;
};

export default function RoundedAssetTagPrinter() {
  usePageTitle("Rounded Asset Tag Printer");
  const theme = useTheme();

  const canPrint = true;

  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [layoutKey, setLayoutKey] = useState("1x2");
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [lookups, setLookups] = useState({});
  const emptyFilters = {
    categoryId: "",
    brandId: "",
    modelId: "",
    statusId: "",
    conditionId: "",
    departmentId: "",
    locationId: "",
    roomId: "",
    assignedUserId: "",
  };
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [assetResult, brandingResult, lookupResult] = await Promise.all([
        getItAssetsService({ page: 1, limit: 10000 }),
        getAssetTagBranding("rounded"),
        getItAssetLookupsService(),
      ]);

      const loadedAssets = Array.isArray(assetResult?.assets)
        ? assetResult.assets
        : [];

      setAssets(loadedAssets);
      setBranding(brandingResult);
      setLookups(lookupResult || {});
    } catch (err) {
      console.error("Failed to load rounded asset tag printer data:", err);
      setAssets([]);
      setBranding(null);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load rounded asset tag printer data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assets.filter((asset) => {
      if (query && !buildSearchText(asset).includes(query)) return false;

      const matches = (filterKey, assetKey) =>
        !filters[filterKey] ||
        String(asset?.[assetKey] || "") ===
          String(filters[filterKey]);

      return (
        matches("categoryId", "ITAssetCategoryId") &&
        matches("brandId", "ITAssetBrandId") &&
        matches("modelId", "ITAssetModelId") &&
        matches("statusId", "ITAssetStatusId") &&
        matches("conditionId", "ITAssetConditionId") &&
        matches("departmentId", "CurrentDepartmentId") &&
        matches("locationId", "CurrentLocationId") &&
        matches("roomId", "CurrentRoomId") &&
        matches("assignedUserId", "CurrentAssignedUserId")
      );
    });
  }, [assets, search, filters]);

  const selectedIds = useMemo(
    () => selectedAssets.map(getAssetId).filter(Boolean),
    [selectedAssets]
  );

  const categoryModels = useMemo(
    () =>
      (lookups.models || []).filter((item) =>
        !draftFilters.categoryId ||
        String(item.ITAssetCategoryId) ===
          String(draftFilters.categoryId)
      ),
    [lookups.models, draftFilters.categoryId]
  );

  const brandOptions = useMemo(() => {
    if (!draftFilters.categoryId) return lookups.brands || [];

    const categoryBrandIds = new Set(
      categoryModels
        .map((model) => model.ITAssetBrandId)
        .filter((brandId) => brandId !== null && brandId !== undefined)
        .map(String)
    );

    return (lookups.brands || []).filter((brand) =>
      categoryBrandIds.has(String(brand.ITAssetBrandId))
    );
  }, [categoryModels, draftFilters.categoryId, lookups.brands]);

  const modelOptions = useMemo(
    () =>
      categoryModels.filter(
        (item) =>
          !draftFilters.brandId ||
          String(item.ITAssetBrandId) === String(draftFilters.brandId)
      ),
    [categoryModels, draftFilters.brandId]
  );

  const roomOptions = useMemo(
    () =>
      (lookups.rooms || []).filter(
        (item) =>
          !draftFilters.locationId ||
          String(item.LocationId) === String(draftFilters.locationId)
      ),
    [lookups.rooms, draftFilters.locationId]
  );

  const settings = branding?.settings || {};
  const print = settings.print || {};
  const layoutOptions = [
    "1x2",
    "2x2",
    "2x3",
    "3x2",
    "3x3",
    "3x7",
    "3x8",
    "4x7",
    "4x8",
  ].map((key) => ASSET_LABEL_LAYOUTS[key]);
  const selectedLayout =
    ASSET_LABEL_LAYOUTS[layoutKey] || ASSET_LABEL_LAYOUTS["1x2"];
  const school = branding?.organization?.school || {};
  const website = String(school.website || "").trim();

  const validationWarnings = useMemo(() => {
    const warnings = [];

    if (!selectedAssets.length) {
      warnings.push("Select one or more IT assets before printing.");
    }

    if (
      selectedAssets.length &&
      selectedAssets.some((asset) => !getAssetCode(asset))
    ) {
      warnings.push(
        "One or more selected assets do not have a valid asset code for the barcode."
      );
    }

    if (
      selectedAssets.length &&
      selectedAssets.some((asset) => !getAssetId(asset))
    ) {
      warnings.push(
        "One or more selected assets do not have a valid asset ID for the asset-details QR code."
      );
    }

    if (settings.visibility?.showWebsiteQr && !website) {
      warnings.push("The school website is required for the website QR code.");
    }

    if (!print.labelDiameter || Number(print.labelDiameter) <= 0) {
      warnings.push("Rounded label diameter must be configured before printing.");
    }

    return warnings;
  }, [selectedAssets, print.labelDiameter, settings.visibility, website]);

  const printDisabled = loading || !canPrint || validationWarnings.length > 0;
  const diameter = Number(print.labelDiameter || 190);
  const diameterPercent = `${Math.min(100, (diameter / 210) * 100)}%`;

  const pages = splitIntoPages(selectedAssets, selectedLayout.capacity);
  const previewPages = pages.slice(0, 1);

  const handlePrint = () => {
    if (printDisabled) return;
    window.print();
  };

  const handleToggleAsset = useCallback((asset) => {
    const assetId = getAssetId(asset);

    if (!assetId) {
      return;
    }

    setSelectedAssets((current) => {
      const isSelected = current.some(
        (selectedAsset) => getAssetId(selectedAsset) === assetId
      );

      if (isSelected) {
        return current.filter(
          (selectedAsset) => getAssetId(selectedAsset) !== assetId
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
            (asset) => !normalizedIds.includes(getAssetId(asset))
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
            normalizedIds.includes(assetId) && !existingIds.has(assetId)
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

  return (
    <Box
      className="rounded-print-root"
      style={{
        "--rounded-preview-bg": theme.palette.background.default,
        "--rounded-preview-border": theme.palette.divider,
        "--rounded-page-bg": theme.palette.common.white,
        "--rounded-page-shadow": theme.shadows[6],
        "--rounded-empty-color": theme.palette.text.secondary,
      }}
    >
      <Box className="rounded-print-controls">
        <AppBreadcrumbs
          items={[
            { label: "IT Assets", to: "/it-assets/dashboard" },
            { label: "Rounded Asset Tag Printer" },
          ]}
        />

        <AppPageHeader
          title="Rounded Asset Tag Printer"
          subtitle="Full A4 preview and exact-size printing for circular asset tags in selected A4 layouts."
          actions={
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <AppButton
                variant="outlined"
                startIcon={<RefreshOutlinedIcon />}
                onClick={loadData}
                disabled={loading}
              >
                Refresh
              </AppButton>
              <AppButton
                startIcon={<PrintOutlinedIcon />}
                onClick={handlePrint}
                disabled={printDisabled}
                actionKey="asset_tags.rounded.print"
              >
                Print Full A4
              </AppButton>
            </Stack>
          }
        />

        {error && (
          <AppCard sx={{ mb: 2 }}>
            <AppEmptyState
              title="Unable to load rounded printer"
              message={error}
              actionLabel="Retry"
              onAction={loadData}
            />
          </AppCard>
        )}

        {!error && (
          <AppCard sx={{ mb: 2 }}>
            <Stack spacing={2}>
              <AppFilterBar contained={false}>
                <TextField
                  size="small"
                  label="Search assets"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  fullWidth
                />

                <TextField
                  select
                  size="small"
                  label="Layout"
                  value={layoutKey}
                  onChange={(event) => setLayoutKey(event.target.value)}
                  fullWidth
                  sx={{ minWidth: { md: 240 } }}
                >
                  {layoutOptions.map((layout) => (
                    <MenuItem key={layout.key} value={layout.key}>
                      {layout.label}
                    </MenuItem>
                  ))}
                </TextField>
              </AppFilterBar>

              <AppCard>
                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={900}>
                    Asset Filters
                  </Typography>
                  <AppFilterBar
                    columns={5}
                    contained={false}
                    actions={
                      <>
                        <AppButton
                          size="small"
                          onClick={() => setFilters(draftFilters)}
                        >
                          Apply
                        </AppButton>
                        <AppButton
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setDraftFilters(emptyFilters);
                            setFilters(emptyFilters);
                          }}
                        >
                          Reset
                        </AppButton>
                      </>
                    }
                  >
                    {[
                      [
                        "categoryId",
                        "Category",
                        lookups.categories,
                        "ITAssetCategoryId",
                        "CategoryName",
                      ],
                      [
                        "brandId",
                        "Brand",
                        brandOptions,
                        "ITAssetBrandId",
                        "BrandName",
                      ],
                      [
                        "modelId",
                        "Model",
                        modelOptions,
                        "ITAssetModelId",
                        "ModelName",
                      ],
                      [
                        "statusId",
                        "Status",
                        lookups.statuses,
                        "ITAssetStatusId",
                        "StatusName",
                      ],
                      [
                        "conditionId",
                        "Condition",
                        lookups.conditions,
                        "ITAssetConditionId",
                        "ConditionName",
                      ],
                      [
                        "departmentId",
                        "Department",
                        lookups.departments,
                        "DepartmentId",
                        "DepartmentName",
                      ],
                      [
                        "locationId",
                        "Location",
                        lookups.locations,
                        "LocationId",
                        "LocationName",
                      ],
                      [
                        "roomId",
                        "Room",
                        roomOptions,
                        "RoomId",
                        "RoomName",
                      ],
                      [
                        "assignedUserId",
                        "Assigned User",
                        lookups.users,
                        "UserId",
                        "FullName",
                      ],
                    ].map(
                      ([key, label, optionsList, valueKey, labelKey]) => (
                        <AppFormField
                          key={key}
                          type="autocomplete"
                          size="small"
                          label={label}
                          value={draftFilters[key]}
                          options={optionsList || []}
                          valueKey={valueKey}
                          labelKey={labelKey}
                          onChange={(value) =>
                            setDraftFilters((current) => ({
                              ...current,
                              [key]: value,
                              ...(key === "categoryId"
                                ? { brandId: "", modelId: "" }
                                : {}),
                              ...(key === "brandId"
                                ? { modelId: "" }
                                : {}),
                              ...(key === "locationId"
                                ? { roomId: "" }
                                : {}),
                            }))
                          }
                        />
                      )
                    )}
                  </AppFilterBar>
                </Stack>
              </AppCard>

              <AssetPrinterTable
                assets={filteredAssets}
                selectedIds={selectedIds}
                loading={loading}
                onToggle={handleToggleAsset}
                onToggleAll={handleToggleAll}
              />

              <AppCard>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={900}>
                      {selectedAssets.length} selected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Select assets from the list to include them in the print preview.
                    </Typography>
                  </Box>
                  <AppButton
                    variant="outlined"
                    onClick={handleClearSelection}
                    disabled={!selectedAssets.length}
                  >
                    Clear Selection
                  </AppButton>
                </Stack>
              </AppCard>

              <Alert severity="info">
                Print using 100% or Actual Size. Disable Fit to Page.
              </Alert>

              {!canPrint && (
                <Alert severity="warning">
                  You can view this printer, but you do not have permission to print rounded asset tags.
                </Alert>
              )}

              {validationWarnings.map((warning) => (
                <Alert key={warning} severity="warning">
                  {warning}
                </Alert>
              ))}
            </Stack>
          </AppCard>
        )}
      </Box>

      {loading && !selectedAssets.length ? (
        <AppLoadingState title="Loading rounded asset tag preview..." />
      ) : (
        <div className="rounded-a4-preview-wrap">
          {selectedAssets.length > 0 && branding ? (
            previewPages.map((pageAssets, pageIndex) => (
              <div
                key={`rounded-a4-page-${pageIndex}`}
                className="rounded-a4-page"
                style={{
                  "--rounded-diameter": `${diameter}mm`,
                  "--rounded-diameter-percent": diameterPercent,
                  "--rounded-margin-top": `${Number(print.marginTop || 0)}mm`,
                  "--rounded-margin-bottom": `${Number(print.marginBottom || 0)}mm`,
                  "--rounded-margin-left": `${Number(print.marginLeft || 0)}mm`,
                  "--rounded-margin-right": `${Number(print.marginRight || 0)}mm`,
                  "--rounded-offset-x": `${Number(print.horizontalOffset || 0)}mm`,
                  "--rounded-offset-y": `${Number(print.verticalOffset || 0)}mm`,
                  "--rounded-offset-x-screen": `${Number(print.horizontalOffset || 0) / 2}px`,
                  "--rounded-offset-y-screen": `${Number(print.verticalOffset || 0) / 2}px`,
                  "--rounded-print-scale": Number(print.printScale || 1),
                }}
              >
                <div className="rounded-a4-safe-area">
                  <div
                    className="rounded-a4-label-grid"
                    data-layout={selectedLayout.key}
                    style={{
                      gridTemplateColumns: `repeat(${selectedLayout.columns}, 1fr)`,
                      gridTemplateRows: `repeat(${selectedLayout.rows}, 1fr)`,
                    }}
                  >
                    {Array.from({ length: selectedLayout.capacity }).map(
                      (_, index) => (
                        <div
                          key={`rounded-asset-cell-${pageIndex}-${index}`}
                          className="rounded-a4-label-grid-item"
                        >
                          <div
                            className="rounded-a4-label-frame"
                            style={{
                              transform: `scale(${Number(
                                print.printScale || 1
                              )})`,
                            }}
                          >
                            <RoundedAssetLabel
                              asset={pageAssets[index] || {}}
                              branding={branding}
                              showWarnings={false}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-a4-page">
              <div className="rounded-a4-safe-area">
                <div className="rounded-a4-empty">
                  Select assets from the list to preview the full-A4 rounded label.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Box>
  );
}
