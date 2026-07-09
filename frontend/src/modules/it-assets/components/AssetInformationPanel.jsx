// ============================================
// Asset Information Panel
// Arab Unity School Operations Platform
// ============================================

import {
  Grid,
  Paper,
  Stack,
  Typography,
  Divider,
} from "@mui/material";

import AssetStatusChip from "./AssetStatusChip";

const safeText = (value) => value || "—";

const InfoItem = ({ label, value }) => (
  <Stack spacing={0.4}>
    <Typography variant="caption" color="text.secondary" fontWeight={700}>
      {label}
    </Typography>

    <Typography variant="body2" fontWeight={700}>
      {safeText(value)}
    </Typography>
  </Stack>
);

const SectionTitle = ({ children }) => (
  <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>
    {children}
  </Typography>
);

const AssetInformationPanel = ({ asset }) => {
  if (!asset) return null;

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        p: 3,
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      })}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Stack>
            <Typography variant="h4" fontWeight={900}>
              {asset.AssetTag}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {safeText(asset.CategoryName)} ·{" "}
              {safeText(asset.BrandName)} ·{" "}
              {safeText(asset.ModelName || asset.ModelDescription)}
            </Typography>
          </Stack>

          <AssetStatusChip status={asset.StatusName} />
        </Stack>

        <Divider />

        <Stack>
          <SectionTitle>Asset Information</SectionTitle>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <InfoItem label="Asset Tag" value={asset.AssetTag} />
            </Grid>

            <Grid item xs={12} md={3}>
              <InfoItem label="Category" value={asset.CategoryName} />
            </Grid>

            <Grid item xs={12} md={3}>
              <InfoItem label="Brand" value={asset.BrandName} />
            </Grid>

            <Grid item xs={12} md={3}>
              <InfoItem
                label="Model"
                value={asset.ModelName || asset.ModelDescription}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <InfoItem label="Serial / IP / MAC" value={asset.SerialIpMac} />
            </Grid>

            <Grid item xs={12} md={3}>
              <InfoItem label="Condition" value={asset.ConditionName} />
            </Grid>

            <Grid item xs={12} md={3}>
              <InfoItem label="Status" value={asset.StatusName} />
            </Grid>

            <Grid item xs={12} md={3}>
              <InfoItem label="School" value={asset.SchoolName} />
            </Grid>
          </Grid>
        </Stack>

        <Divider />

        <Stack>
          <SectionTitle>Current Assignment</SectionTitle>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <InfoItem
                label="Assigned To"
                value={
                  asset.CurrentAssignedUserName || asset.CurrentAssignedName
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoItem
                label="Employee Code"
                value={asset.CurrentAssignedEmployeeCode}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoItem label="Email" value={asset.CurrentAssignedEmail} />
            </Grid>
          </Grid>
        </Stack>

        <Divider />

        <Stack>
          <SectionTitle>Current Location</SectionTitle>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <InfoItem label="Department" value={asset.DepartmentName} />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoItem label="Location" value={asset.LocationName} />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoItem label="Room" value={asset.RoomName} />
            </Grid>
          </Grid>
        </Stack>

        <Divider />

        <Stack>
          <SectionTitle>System Information</SectionTitle>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <InfoItem label="Previous Owner" value={asset.PreviousOwner} />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoItem label="Created At" value={asset.CreatedAt} />
            </Grid>

            <Grid item xs={12} md={4}>
              <InfoItem label="Updated At" value={asset.UpdatedAt} />
            </Grid>
          </Grid>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default AssetInformationPanel;