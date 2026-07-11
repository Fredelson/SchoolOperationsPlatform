import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Grid, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import KeyboardReturnOutlinedIcon from "@mui/icons-material/KeyboardReturnOutlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";

import { useAuth } from "../../../context/AuthContext";
import usePageTitle from "../../../platform/hooks/usePageTitle";
import {
  AppBreadcrumbs,
  AppButton,
  AppCard,
  AppChip,
  AppEmptyState,
  AppLoadingState,
  AppPageHeader,
} from "../../../platform/ui";

import AssetAuditPanel from "../components/AssetAuditPanel";
import AssetInformationPanel from "../components/AssetInformationPanel";
import AssetTimelinePanel from "../components/AssetTimelinePanel";
import AssignAssetDialog from "../dialogs/AssignAssetDialog";
import DisposalDialog from "../dialogs/DisposalDialog";
import MaintenanceDialog from "../dialogs/MaintenanceDialog";
import ReturnAssetDialog from "../dialogs/ReturnAssetDialog";
import TransferAssetDialog from "../dialogs/TransferAssetDialog";
import {
  assignItAssetService,
  createItAssetMaintenanceService,
  getItAssetAuditService,
  getItAssetByIdService,
  getItAssetLookupsService,
  getItAssetTimelineService,
  requestItAssetDisposalService,
  returnItAssetService,
  transferItAssetService,
} from "../services/itAssetService";
import resolveAssetLookups from "../utils/resolveAssetLookups";

const isAssigned = (asset) =>
  Boolean(asset?.CurrentAssignedUserId || asset?.CurrentAssignedName);

const Detail = ({ label, value }) => (
  <Stack spacing={0.35}>
    <Typography variant="caption" color="text.secondary" fontWeight={700}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={800}>
      {value || "—"}
    </Typography>
  </Stack>
);

const AssetDetails = () => {
  usePageTitle("Asset Details");

  const { assetId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.roleKey || user?.role;
  const canManageLifecycle = ["SuperAdmin", "PlatformAdmin"].includes(role);

  const [asset, setAsset] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [lookups, setLookups] = useState({});
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [actionSaving, setActionSaving] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [dialog, setDialog] = useState(null);

  const loadAsset = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [assetData, lookupData, timelineData, auditData] = await Promise.all([
        getItAssetByIdService(assetId),
        getItAssetLookupsService(),
        getItAssetTimelineService(assetId),
        getItAssetAuditService(assetId),
      ]);

      setLookups(lookupData || {});
      setAsset(resolveAssetLookups(assetData, lookupData || {}));
      setTimeline(timelineData?.timeline || []);
      setAuditLogs(auditData || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load asset details.");
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    // Initial synchronization with asset, lookup, timeline, and audit APIs.
     
    loadAsset();
  }, [loadAsset]);

  const runAction = async (action, closeDialog = true) => {
    try {
      setActionSaving(true);
      setActionError("");
      await action();
      if (closeDialog) setDialog(null);
      await loadAsset();
      setTab("overview");
    } catch (err) {
      setActionError(err?.response?.data?.message || "Unable to complete this action.");
    } finally {
      setActionSaving(false);
    }
  };

  const disposed = useMemo(
    () => String(asset?.StatusKey || asset?.StatusName || "").toUpperCase() === "DISPOSED",
    [asset]
  );
  const maintenanceUnfinished = useMemo(() => {
    const status = String(asset?.StatusKey || asset?.StatusName || "")
      .replace(/[\s_-]/g, "")
      .toUpperCase();
    return ["UNDERREPAIR", "UNDERMAINTENANCE", "MAINTENANCE"].includes(status);
  }, [asset]);

  if (loading && !asset) return <AppLoadingState title="Loading asset details..." />;

  if (error && !asset) {
    return (
      <AppEmptyState
        title="Unable to load asset"
        message={error}
        actionLabel="Retry"
        onAction={loadAsset}
      />
    );
  }

  if (!asset) {
    return (
      <AppEmptyState
        title="Asset not found"
        message="The selected IT asset could not be found."
        actionLabel="Back to Asset Explorer"
        onAction={() => navigate("/it-assets/assets")}
      />
    );
  }

  const openDialog = (name) => {
    setActionError("");
    setDialog(name);
  };

  return (
    <Box>
      <AppBreadcrumbs
        items={[
          { label: "IT Assets", to: "/it-assets/dashboard" },
          { label: "Asset Explorer", to: "/it-assets/assets" },
          { label: asset.AssetTag },
        ]}
      />

      <AppPageHeader
        title="Asset Details"
        subtitle="Asset profile, assignment, location, lifecycle history, and administrative actions."
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <AppButton variant="outlined" onClick={() => navigate("/it-assets/assets")}>
              Back
            </AppButton>
            <AppButton
              variant="outlined"
              startIcon={<LocalPrintshopOutlinedIcon />}
              onClick={() =>
                navigate(`/it-assets/asset-tag-printer?assetId=${encodeURIComponent(asset.AssetId)}`)
              }
            >
              Print Label
            </AppButton>
            <AppButton startIcon={<RefreshOutlinedIcon />} onClick={loadAsset} disabled={loading}>
              Refresh
            </AppButton>
          </Stack>
        }
      />

      <Stack spacing={2.5}>
        <AppCard>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 2 }}>
              <Box
                sx={{
                  minHeight: 132,
                  borderRadius: 4,
                  bgcolor: "action.hover",
                  color: "primary.main",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <DevicesOutlinedIcon sx={{ fontSize: 72 }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={1.25}>
                <Typography variant="h4" fontWeight={900}>
                  {asset.AssetTag}
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight={700}>
                  {[asset.BrandName, asset.ModelName || asset.ModelDescription]
                    .filter(Boolean)
                    .join(" ") || "Asset model not recorded"}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <AppChip label={asset.StatusName || "Status unknown"} status={asset.StatusName} />
                  <AppChip label={asset.ConditionName || "Condition unknown"} status={asset.ConditionName} />
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><Detail label="Category" value={asset.CategoryName} /></Grid>
                <Grid size={{ xs: 6 }}><Detail label="Department" value={asset.DepartmentName} /></Grid>
                <Grid size={{ xs: 6 }}><Detail label="Location" value={asset.LocationName} /></Grid>
                <Grid size={{ xs: 6 }}><Detail label="Room" value={asset.RoomName} /></Grid>
                <Grid size={{ xs: 6 }}><Detail label="Serial / IP / MAC" value={asset.SerialIpMac} /></Grid>
                <Grid size={{ xs: 6 }}><Detail label="School" value={asset.SchoolName} /></Grid>
              </Grid>
            </Grid>
          </Grid>
        </AppCard>

        <AppCard noPadding>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: { xs: 1, md: 2 }, borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Tab value="overview" label="Overview" />
            <Tab value="timeline" label="History & Timeline" />
            <Tab value="audit" label="Audit" />
          </Tabs>
        </AppCard>

        {tab === "overview" && (
          <Grid container spacing={2} alignItems="flex-start">
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={2}>
                <AssetInformationPanel asset={asset} />
                <AppCard>
                  <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 2 }}>
                    Recent Asset Timeline
                  </Typography>
                  <AssetTimelinePanel timeline={timeline.slice(0, 5)} />
                </AppCard>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={2}>
                <AppCard>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={900}>Current Assignment</Typography>
                    <AppChip
                      label={isAssigned(asset) ? "Assigned" : "Unassigned"}
                      status={isAssigned(asset) ? "Active" : "Pending"}
                    />
                  </Stack>
                  <Stack spacing={1.25}>
                    <Detail
                      label="Assigned To"
                      value={asset.CurrentAssignedUserName || asset.CurrentAssignedName}
                    />
                    <Detail label="Employee Code" value={asset.CurrentAssignedEmployeeCode} />
                    <Detail label="Email" value={asset.CurrentAssignedEmail} />
                    <Detail label="Department" value={asset.DepartmentName} />
                  </Stack>
                </AppCard>

                <AppCard>
                  <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 2 }}>
                    Quick Actions
                  </Typography>
                  <Stack spacing={1}>
                    <AppButton
                      fullWidth
                      variant="outlined"
                      startIcon={<AssignmentIndOutlinedIcon />}
                      disabled={isAssigned(asset) || disposed || maintenanceUnfinished}
                      onClick={() => openDialog("assign")}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      Assign Asset
                    </AppButton>
                    <AppButton
                      fullWidth
                      variant="outlined"
                      startIcon={<KeyboardReturnOutlinedIcon />}
                      disabled={!isAssigned(asset) || disposed}
                      onClick={() => openDialog("return")}
                      sx={{ justifyContent: "flex-start" }}
                    >
                      Return Asset
                    </AppButton>
                    {canManageLifecycle && (
                      <>
                        <AppButton
                          fullWidth
                          variant="outlined"
                          startIcon={<SwapHorizOutlinedIcon />}
                          disabled={disposed}
                          onClick={() => openDialog("transfer")}
                          sx={{ justifyContent: "flex-start" }}
                        >
                          Transfer Asset
                        </AppButton>
                        <AppButton
                          fullWidth
                          variant="outlined"
                          color="warning"
                          startIcon={<BuildOutlinedIcon />}
                          disabled={disposed}
                          onClick={() => openDialog("maintenance")}
                          sx={{ justifyContent: "flex-start" }}
                        >
                          Record Maintenance
                        </AppButton>
                        <AppButton
                          fullWidth
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteOutlineOutlinedIcon />}
                          disabled={disposed}
                          onClick={() => openDialog("disposal")}
                          sx={{ justifyContent: "flex-start" }}
                        >
                          Request Disposal
                        </AppButton>
                      </>
                    )}
                  </Stack>
                </AppCard>
              </Stack>
            </Grid>
          </Grid>
        )}

        {tab === "timeline" && (
          <AppCard><AssetTimelinePanel timeline={timeline} /></AppCard>
        )}
        {tab === "audit" && (
          <AppCard><AssetAuditPanel auditLogs={auditLogs} /></AppCard>
        )}
      </Stack>

      {dialog === "assign" && (
        <AssignAssetDialog
          open
          asset={asset}
          lookups={lookups}
          saving={actionSaving}
          error={actionError}
          onClose={() => !actionSaving && setDialog(null)}
          onSubmit={(payload) => runAction(() => assignItAssetService(payload))}
        />
      )}
      {dialog === "return" && (
        <ReturnAssetDialog
          open
          asset={asset}
          lookups={lookups}
          saving={actionSaving}
          error={actionError}
          onClose={() => !actionSaving && setDialog(null)}
          onSubmit={(payload) => runAction(() => returnItAssetService(asset.AssetId, payload))}
        />
      )}
      {dialog === "transfer" && (
        <TransferAssetDialog
          open
          asset={asset}
          lookups={lookups}
          saving={actionSaving}
          error={actionError}
          onClose={() => !actionSaving && setDialog(null)}
          onSubmit={(payload) => runAction(() => transferItAssetService(payload))}
        />
      )}
      {dialog === "maintenance" && (
        <MaintenanceDialog
          open
          asset={asset}
          saving={actionSaving}
          error={actionError}
          onClose={() => !actionSaving && setDialog(null)}
          onSubmit={(payload) => runAction(() => createItAssetMaintenanceService(payload))}
        />
      )}
      {dialog === "disposal" && (
        <DisposalDialog
          open
          asset={asset}
          saving={actionSaving}
          error={actionError}
          onClose={() => !actionSaving && setDialog(null)}
          onSubmit={(payload) => runAction(() => requestItAssetDisposalService(payload))}
        />
      )}
    </Box>
  );
};

export default AssetDetails;
