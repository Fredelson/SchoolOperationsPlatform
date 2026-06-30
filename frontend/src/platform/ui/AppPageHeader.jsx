// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppPageHeader
// ============================================
//
// Purpose:
// Reusable page header for platform modules.
// Supports title, subtitle, and right actions.
// ============================================

import { Box, Stack, Typography } from "@mui/material";

// ============================================
// Component
// ============================================

export default function AppPageHeader({
  title,
  subtitle,
  actions = null,
  sx = {},
}) {
  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        gap: 2,
        flexDirection: { xs: "column", md: "row" },
        ...sx,
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h4" fontWeight={900}>
          {title}
        </Typography>

        {subtitle && (
          <Typography color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>

      {actions && <Box>{actions}</Box>}
    </Box>
  );
}
