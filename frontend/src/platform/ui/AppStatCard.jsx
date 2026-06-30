// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// App Stat Card
// ============================================
//
// Purpose:
// Single reusable KPI/stat card for platform pages.
// Used by dashboards, module manager, menu manager,
// user management, assets, reports, and future modules.
// ============================================

import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
} from "@mui/material";

// ============================================
// Component
// ============================================

export default function AppStatCard({
  title,
  value,
  helperText,
  icon = null,
  color = "primary.main",
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ mt: 1 }}
            >
              {value ?? 0}
            </Typography>

            {helperText && (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {helperText}
              </Typography>
            )}
          </Box>

          {icon && (
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: "action.hover",
                color,
              }}
            >
              {icon}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
