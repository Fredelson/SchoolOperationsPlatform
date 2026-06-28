// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppSection
// ============================================
//
// Purpose:
// Reusable section wrapper for grouped page
// content such as forms, tables, and reports.
// ============================================

import { Box, Divider, Stack, Typography } from "@mui/material";

import AppCard from "./AppCard";

// ============================================
// Component
// ============================================

export default function AppSection({
  title,
  subtitle,
  actions = null,
  children,
  sx = {},
  contentSx = {},
}) {
  return (
    <AppCard sx={sx} contentSx={contentSx}>
      {(title || subtitle || actions) && (
        <>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <Stack spacing={0.4}>
              {title && (
                <Typography variant="h6" fontWeight={900}>
                  {title}
                </Typography>
              )}

              {subtitle && (
                <Typography fontSize={14} color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Stack>

            {actions && <Box>{actions}</Box>}
          </Box>

          <Divider sx={{ mb: 2 }} />
        </>
      )}

      {children}
    </AppCard>
  );
}