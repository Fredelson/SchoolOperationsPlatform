// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppStatCard
// ============================================
//
// Purpose:
// Reusable KPI/stat card for dashboards,
// reports, and module overview pages.
// ============================================

import {
  Box,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import AppCard from "./AppCard";

// ============================================
// Component
// ============================================

export default function AppStatCard({
  title,
  value,
  icon = null,
  helperText = null,
  color,
  sx = {},
}) {
  const theme = useTheme();

  const statColor =
    color || theme.palette.platform?.accent || theme.palette.primary.main;

  return (
    <AppCard sx={sx}>
      <Stack direction="row" spacing={2} alignItems="center">
        {icon && (
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(statColor, 0.12),
              color: statColor,

              "& svg": {
                fontSize: 30,
              },
            }}
          >
            {icon}
          </Box>
        )}

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 800,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 0.4,
              fontSize: 28,
              fontWeight: 900,
              lineHeight: 1.1,
              color: "text.primary",
            }}
          >
            {value}
          </Typography>

          {helperText && (
            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "text.secondary",
              }}
            >
              {helperText}
            </Typography>
          )}
        </Box>
      </Stack>
    </AppCard>
  );
}