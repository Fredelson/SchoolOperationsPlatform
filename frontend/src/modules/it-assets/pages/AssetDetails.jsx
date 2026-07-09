// ============================================
// Asset Details Page
// Arab Unity School Operations Platform
// ============================================

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import usePageTitle from "../../../platform/hooks/usePageTitle";
import {
  AppBreadcrumbs,
  AppEmptyState,
  AppLoadingState,
  AppPageHeader,
} from "../../../platform/ui";

import {
  getItAssetByIdService,
  getItAssetTimelineService,
} from "../services/itAssetService";

import AssetInformationPanel from "../components/AssetInformationPanel";
import AssetTimelinePanel from "../components/AssetTimelinePanel";

const AssetDetails = () => {
  usePageTitle("AUS | Asset Details");

  const { assetId } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [tab, setTab] = useState(0);

  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAsset = useCallback(async () => {
    try {
      setLoading(true);
      setTimelineLoading(true);
      setError("");

      const assetData = await getItAssetByIdService(assetId);
      setAsset(assetData);

      const timelineData = await getItAssetTimelineService(assetId);
      setTimeline(timelineData?.timeline || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to load asset details."
      );
    } finally {
      setLoading(false);
      setTimelineLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);

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
            <Button
              variant="outlined"
              onClick={() => navigate("/it-assets/assets")}
            >
              Back
            </Button>

            <Button variant="contained" onClick={loadAsset}>
              Refresh
            </Button>
          </Stack>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

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
                <Typography color="text.secondary">
                  Loading timeline...
                </Typography>
              ) : (
                <AssetTimelinePanel timeline={timeline} />
              ))}

            {tab === 1 && (
              <Typography color="text.secondary">
                Audit history will be connected next.
              </Typography>
            )}

            {tab === 2 && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="outlined" disabled>
                  Assign
                </Button>

                <Button variant="outlined" disabled>
                  Return
                </Button>

                <Button variant="outlined" disabled>
                  Transfer
                </Button>

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
    </Box>
  );
};

export default AssetDetails;