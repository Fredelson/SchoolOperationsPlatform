import { Box, Grid, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

import { AppCard, AppChip } from "../../../platform/ui";
import AssetQrCode from "./qrcode/AssetQrCode";

const safeText = (value) =>
  value === undefined || value === null || String(value).trim() === "" ? "—" : value;

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(new Date(value)) : "—";

const InfoItem = ({ label, value, children }) => (
  <Stack spacing={0.45}>
    <Typography variant="caption" color="text.secondary" fontWeight={700}>
      {label}
    </Typography>
    {children || (
      <Typography variant="body2" fontWeight={800}>
        {safeText(value)}
      </Typography>
    )}
  </Stack>
);

const SectionTitle = ({ icon, children }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
    <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
    <Typography variant="subtitle1" fontWeight={900}>
      {children}
    </Typography>
  </Stack>
);

const AssetInformationPanel = ({ asset }) => {
  if (!asset) return null;

  return (
    <Stack spacing={2}>
      <AppCard>
        <SectionTitle icon={<InfoOutlinedIcon />}>Asset Information</SectionTitle>
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Asset Tag" value={asset.AssetTag} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Category" value={asset.CategoryName} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Brand" value={asset.BrandName} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Model" value={asset.ModelName || asset.ModelDescription} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Serial / IP / MAC" value={asset.SerialIpMac} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Status">
              <AppChip label={safeText(asset.StatusName)} status={asset.StatusName} />
            </InfoItem>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Condition">
              <AppChip 
                label={asset.ConditionName === "Beyond Repair" ? "Beyond Repair / Disposed" : safeText(asset.ConditionName)} 
                status={asset.ConditionName === "Beyond Repair" ? "Disposed" : asset.ConditionName} 
              />
            </InfoItem>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Acquired / Changed Date" value={formatDate(asset.AcquiredChangedDate)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <InfoItem label="Previous Owner" value={asset.PreviousOwner} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <InfoItem label="Model Description" value={asset.ModelDescription} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoItem label="Asset QR Code">
              <AssetQrCode assetId={asset.AssetId} size={72} />
            </InfoItem>
          </Grid>
        </Grid>
      </AppCard>

      <AppCard>
        <SectionTitle icon={<LocationOnOutlinedIcon />}>Location Details</SectionTitle>
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoItem label="School" value={asset.SchoolName} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoItem label="Department" value={asset.DepartmentName} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoItem label="Location" value={asset.LocationName} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <InfoItem label="Room" value={asset.RoomName} />
          </Grid>
        </Grid>
      </AppCard>
    </Stack>
  );
};

export default AssetInformationPanel;
