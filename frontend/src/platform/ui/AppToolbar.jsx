// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppToolbar
// ============================================
//
// Purpose:
// Reusable toolbar for tables, filters,
// search, exports, and page actions.
// ============================================

import { Box, Stack } from "@mui/material";

// ============================================
// Component
// ============================================

export default function AppToolbar({
  left = null,
  right = null,
  children = null,
  sx = {},
}) {
  return (
    <Box
      sx={{
        mb: 2,
        display: "flex",
        alignItems: { xs: "stretch", md: "center" },
        justifyContent: "space-between",
        gap: 2,
        flexDirection: { xs: "column", md: "row" },
        ...sx,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ flex: 1 }}
      >
        {left || children}
      </Stack>

      {right && (
        <Stack direction="row" spacing={1.5}>
          {right}
        </Stack>
      )}
    </Box>
  );
}