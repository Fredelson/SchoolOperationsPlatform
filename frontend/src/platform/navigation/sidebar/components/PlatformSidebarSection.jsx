// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Platform Sidebar Section
// ============================================
//
// Purpose:
// Renders a sidebar section heading.
//
// Example:
//
// MAIN
// ORGANIZATION
// OPERATIONS
//
// ============================================

import { Box, Typography, alpha, useTheme } from "@mui/material";

export default function PlatformSidebarSection({ title }) {
  const theme = useTheme();

  const sidebarText = theme.palette.primary.contrastText;

  return (
    <Box sx={{ mb: 2.4 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          px: 2,
          mb: 0.9,
          color: alpha(sidebarText, 0.42),
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: 0.9,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}