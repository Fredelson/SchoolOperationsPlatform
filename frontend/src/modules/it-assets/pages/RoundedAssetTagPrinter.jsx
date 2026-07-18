import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  MenuItem,
  Stack,
  TextField,
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
  AppLoadingState,
  AppPageHeader,
} from "../../../platform/ui";
import { usePermissions } from "../../../context/PermissionContext";

import { getItAssetsService } from "../services/itAssetService";
import { getAssetTagBranding } from "../services/assetTagBrandingService";
import RoundedAssetLabel from "../components/labels/RoundedAssetLabel";

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

export default function RoundedAssetTagPrinter() {
  usePageTitle("Rounded Asset Tag Printer");
  const theme = useTheme();

  const { hasPermission } = usePermissions();
  const canPrint = hasPermission("asset_tags.rounded.print");

  const [assets, setAssets] = useState([]);
  const [assetId, setAssetId] = useState("");
  const [search, setSearch] = useState("");
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [assetResult, brandingResult] = await Promise.all([
        getItAssetsService({ page: 1, limit: 10000 }),
        getAssetTagBranding("rounded"),
      ]);

      const loadedAssets = Array.isArray(assetResult?.assets)
        ? assetResult.assets
        : [];

      setAssets(loadedAssets);
      setBranding(brandingResult);

      setAssetId((current) => {
        if (current && loadedAssets.some((asset) => getAssetId(asset) === current)) {
          return current;
        }

        return loadedAssets[0] ? getAssetId(loadedAssets[0]) : "";
      });
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

    if (!query) return assets;

    return assets.filter((asset) => buildSearchText(asset).includes(query));
  }, [assets, search]);

  const selectedAsset = useMemo(
    () => assets.find((asset) => getAssetId(asset) === String(assetId)),
    [assets, assetId]
  );

  const settings = branding?.settings || {};
  const print = settings.print || {};
  const school = branding?.organization?.school || {};
  const website = String(school.website || "").trim();
  const assetCode = getAssetCode(selectedAsset);
  const selectedAssetId = getAssetId(selectedAsset);

  const validationWarnings = useMemo(() => {
    const warnings = [];

    if (!selectedAsset) {
      warnings.push("Select an IT asset before printing.");
    }

    if (selectedAsset && !assetCode) {
      warnings.push("The selected asset does not have a valid asset code for the barcode.");
    }

    if (selectedAsset && !selectedAssetId) {
      warnings.push("The selected asset does not have a valid asset ID for the asset-details QR code.");
    }

    if (settings.visibility?.showWebsiteQr && !website) {
      warnings.push("The school website is required for the website QR code.");
    }

    if (!print.labelDiameter || Number(print.labelDiameter) <= 0) {
      warnings.push("Rounded label diameter must be configured before printing.");
    }

    return warnings;
  }, [assetCode, print.labelDiameter, selectedAsset, selectedAssetId, settings.visibility, website]);

  const printDisabled = loading || !canPrint || validationWarnings.length > 0;
  const diameter = Number(print.labelDiameter || 190);
  const diameterPercent = `${Math.min(100, (diameter / 210) * 100)}%`;

  const handlePrint = () => {
    if (printDisabled) return;
    window.print();
  };

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
          subtitle="Full A4 preview and exact-size printing for one circular asset label."
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
                  label="Asset"
                  value={assetId}
                  onChange={(event) => setAssetId(event.target.value)}
                  fullWidth
                  sx={{ minWidth: { md: 360 } }}
                >
                  {filteredAssets.map((asset) => (
                    <MenuItem key={getAssetId(asset)} value={getAssetId(asset)}>
                      {getAssetCode(asset) || "NO ASSET CODE"} -{" "}
                      {valueFrom(asset, ["ModelName", "modelName", "AssetName", "assetName"], "Asset")}
                    </MenuItem>
                  ))}
                </TextField>
              </AppFilterBar>

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

      {loading && !selectedAsset ? (
        <AppLoadingState title="Loading rounded asset tag preview..." />
      ) : (
        <div className="rounded-a4-preview-wrap">
          <div
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
              {selectedAsset && branding ? (
                <div className="rounded-a4-label-frame">
                  <RoundedAssetLabel
                    asset={selectedAsset}
                    branding={branding}
                    showWarnings
                  />
                </div>
              ) : (
                <div className="rounded-a4-empty">
                  Select an asset to preview the full-A4 rounded label.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}
