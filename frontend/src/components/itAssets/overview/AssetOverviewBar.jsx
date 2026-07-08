// ============================================
// Asset Overview Bar
// Arab Unity School Operations Platform
// ============================================

import { Box, Paper, Stack, Typography, alpha } from "@mui/material";

import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";

const AssetOverviewBar = ({ categories = [] }) => {
  const totals = categories.reduce(
    (acc, item) => {
      acc.total += Number(item.TotalAssets || 0);
      acc.available += Number(item.AvailableCount || 0);
      acc.assigned += Number(item.AssignedCount || 0);
      acc.maintenance += Number(item.MaintenanceCount || 0);
      return acc;
    },
    { total: 0, available: 0, assigned: 0, maintenance: 0 }
  );

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        mt: 3,
        p: 2.5,
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
      })}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2.5}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 280 }}>
          <IconCircle colorKey="success">
            <BarChartRoundedIcon />
          </IconCircle>

          <Box>
            <Typography fontWeight={900}>Asset Overview</Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time overview across visible categories.
            </Typography>
          </Box>
        </Stack>

        <OverviewItem icon={<Inventory2RoundedIcon />} label="Total Assets" value={totals.total} colorKey="secondary" />
        <OverviewItem icon={<CheckCircleOutlineRoundedIcon />} label="Available" value={totals.available} colorKey="success" />
        <OverviewItem icon={<PersonOutlineRoundedIcon />} label="Assigned" value={totals.assigned} colorKey="primary" />
        <OverviewItem icon={<BuildRoundedIcon />} label="In Maintenance" value={totals.maintenance} colorKey="warning" />
      </Stack>
    </Paper>
  );
};

const OverviewItem = ({ icon, label, value, colorKey }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1.2}
    sx={(theme) => ({
      flex: 1,
      minWidth: 160,
      borderLeft: { md: `1px solid ${theme.palette.divider}` },
      pl: { md: 2.5 },
    })}
  >
    <IconCircle colorKey={colorKey}>{icon}</IconCircle>

    <Box>
      <Typography variant="body2" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Typography fontSize={24} lineHeight={1.1} fontWeight={900}>
        {value}
      </Typography>
    </Box>
  </Stack>
);

const IconCircle = ({ children, colorKey }) => (
  <Box
    sx={(theme) => {
      const color = theme.palette[colorKey]?.main || theme.palette.primary.main;
      return {
        width: 46,
        height: 46,
        borderRadius: "50%",
        bgcolor: alpha(color, 0.1),
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      };
    }}
  >
    {children}
  </Box>
);

export default AssetOverviewBar;