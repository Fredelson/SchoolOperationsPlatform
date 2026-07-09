// ============================================
// Enterprise IT Asset Card Stats
// Arab Unity School Operations Platform
//
// Purpose:
// - Shared compact stats row for IT Asset cards.
// - Used for Available, Assigned, and Maintenance totals.
// ============================================

import { Box, Stack, Typography, alpha } from "@mui/material";

const AssetCardStats = ({ items = [] }) => {
  return (
    <Box
      sx={(theme) => ({
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.default, 0.75),
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        overflow: "hidden",
      })}
    >
      {items.map((item) => (
        <StatItem key={item.label} {...item} />
      ))}
    </Box>
  );
};

const StatItem = ({ label, value, colorKey }) => (
  <Stack
    alignItems="center"
    spacing={0.05}
    sx={(theme) => ({
      py: 0.35,
      px: 0.25,
      borderRight: `1px solid ${theme.palette.divider}`,
      "&:last-of-type": {
        borderRight: "none",
      },
    })}
  >
    <Typography
      fontSize={10.5}
      fontWeight={900}
      sx={(theme) => ({
        color: theme.palette[colorKey]?.main || theme.palette.text.secondary,
      })}
    >
      {value || 0}
    </Typography>

    <Typography fontSize={8.5} color="text.secondary" fontWeight={700} noWrap>
      {label}
    </Typography>
  </Stack>
);

export default AssetCardStats;