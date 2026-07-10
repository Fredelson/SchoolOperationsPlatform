// ============================================
// Asset Details Page
// Arab Unity School Operations Platform
// ============================================

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import usePageTitle from "../../../platform/hooks/usePageTitle";
import { useAuth } from "../../../context/AuthContext";
import {
  AppBreadcrumbs,
  AppEmptyState,
  AppLoadingState,
  AppPageHeader,
} from "../../../platform/ui";

import {
  getItAssetByIdService,
  getItAssetTimelineService,
  getItAssetAuditService,
  getItAssetLookupsService,
  assignItAssetService,
  returnItAssetService,
  transferItAssetService,
} from "../services/itAssetService";

import AssetInformationPanel from "../components/AssetInformationPanel";
import AssetTimelinePanel from "../components/AssetTimelinePanel";
import AssetAuditPanel from "../components/AssetAuditPanel";
import AssignAssetDialog from "../dialogs/AssignAssetDialog";
import ReturnAssetDialog from "../dialogs/ReturnAssetDialog";
import TransferAssetDialog from "../dialogs/TransferAssetDialog";

const AssetDetails = () => {
  usePageTitle("AUS | Asset Details");

  const { assetId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canTransfer = ["SuperAdmin", "PlatformAdmin"].includes(
    user?.roleKey || user?.role
  );

  const [asset, setAsset] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [lookups, setLookups] = useState({});
  const [tab, setTab] = useState(0);

  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [actionSaving, setActionSaving] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const loadAsset = useCallback(async () => {
    try {
      setLoading(true);
      setTimelineLoading(true);
      setAuditLoading(true);
      setError("");

      const assetData = await getItAssetByIdService(assetId);
      setAsset(assetData);

      const timelineData = await getItAssetTimelineService(assetId);
      setTimeline(timelineData?.timeline || []);

      const auditData = await getItAssetAuditService(assetId);
      setAuditLogs(auditData || []);

      const lookupData = await getItAssetLookupsService();
      setLookups(lookupData || {});
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load asset details.");
    } finally {
      setLoading(false);
      setTimelineLoading(false);
      setAuditLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);

  const handleAssignSubmit = async (payload) => {
    try {
      setActionSaving(true);
      setActionError("");

      await assignItAssetService(payload);

      setAssignOpen(false);
      await loadAsset();
      setTab(0);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to assign asset.");
    } finally {
      setActionSaving(false);
    }
  };

  if (loading) {
    return <AppLoadingState title="Loading asset details..." />;
  }

  if (error) {
    return (
      <AppEmptyState
        title="Unable to load asset"
        description={error}
        action={<Button onClick={loadAsset}>Retry</Button>}
      />
    );
  }

  if (!asset) {
    return (
      <AppEmptyState
        title="Asset not found"
        description="The selected IT asset could not be found."
        action={
          <Button onClick={() => navigate("/it-assets/assets")}>Back</Button>
        }
      />
    );
  }

  const handleReturnSubmit = async (payload) => {
    try {
      setActionSaving(true);
      setActionError("");

      await returnItAssetService(asset.AssetId, payload);

      setReturnOpen(false);
      await loadAsset();
      setTab(0);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to return asset.");
    } finally {
      setActionSaving(false);
    }
  };

  const handleTransferSubmit = async (payload) => {
    try {
      setActionSaving(true);
      setActionError("");
      await transferItAssetService(payload);
      setTransferOpen(false);
      await loadAsset();
      setTab(0);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to transfer asset.");
    } finally {
      setActionSaving(false);
    }
  };

  return (
    <Box>
      <AppBreadcrumbs
        items={[
          { label: "IT Assets", path: "/it-assets/dashboard" },
          { label: "Asset Explorer", path: "/it-assets/assets" },
          { label: asset.AssetTag },
        ]}
      />

      <AppPageHeader
        title="Asset Details"
        subtitle="View asset information, timeline, audit history, and available actions."
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate("/it-assets/assets")}>
              Back
            </Button>

            <Button variant="contained" onClick={loadAsset}>
              Refresh
            </Button>
          </Stack>
        }
      />

      <Stack spacing={3}>
        <AssetInformationPanel asset={asset} />

        <Paper
          elevation={0}
          sx={(theme) => ({
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          })}
        >
          <Tabs value={tab} onChange={(_, value) => setTab(value)}>
            <Tab label="Timeline" />
            <Tab label="Audit" />
            <Tab label="Actions" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tab === 0 &&
              (timelineLoading ? (
                <Typography color="text.secondary">Loading timeline...</Typography>
              ) : (
                <AssetTimelinePanel timeline={timeline} />
              ))}

            {tab === 1 &&
              (auditLoading ? (
                <Typography color="text.secondary">
                  Loading audit history...
                </Typography>
              ) : (
                <AssetAuditPanel auditLogs={auditLogs} />
              ))}

            {tab === 2 && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  onClick={() => {
                    setActionError("");
                    setAssignOpen(true);
                  }}
                  disabled={Boolean(asset.CurrentAssignedUserId || asset.CurrentAssignedName)}
                >
                  Assign
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => {
                    setActionError("");
                    setReturnOpen(true);
                  }}
                  disabled={!asset.CurrentAssignedUserId && !asset.CurrentAssignedName}
                >
                  Return
                </Button>

                {canTransfer && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setActionError("");
                      setTransferOpen(true);
                    }}
                  >
                    Transfer
                  </Button>
                )}

                <Button variant="outlined" disabled>
                  Maintenance
                </Button>

                <Button variant="outlined" color="error" disabled>
                  Dispose
                </Button>
              </Stack>
            )}
          </Box>
        </Paper>
      </Stack>

      <AssignAssetDialog
        open={assignOpen}
        asset={asset}
        lookups={lookups}
        saving={actionSaving}
        error={actionError}
        onClose={() => {
          if (!actionSaving) setAssignOpen(false);
        }}
        onSubmit={handleAssignSubmit}
      />
      <ReturnAssetDialog
        open={returnOpen}
        asset={asset}
        lookups={lookups}
        saving={actionSaving}
        error={actionError}
        onClose={() => {
          if (!actionSaving) setReturnOpen(false);
        }}
        onSubmit={handleReturnSubmit}
      />
      {transferOpen && (
        <TransferAssetDialog
          open
          asset={asset}
          lookups={lookups}
          saving={actionSaving}
          error={actionError}
          onClose={() => {
            if (!actionSaving) setTransferOpen(false);
          }}
          onSubmit={handleTransferSubmit}
        />
      )}
    </Box>
  );
};

export default AssetDetails;
