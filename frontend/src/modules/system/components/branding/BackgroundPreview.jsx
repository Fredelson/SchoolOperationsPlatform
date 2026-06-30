// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Background Preview
// ============================================
//
// Purpose:
// Reusable live preview for solid, linear,
// radial, and conic backgrounds.
// ============================================

import { Box, Typography, useTheme } from "@mui/material";

export default function BackgroundPreview({ label, background }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: 96,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Typography
        sx={{
          px: 2,
          py: 0.6,
          borderRadius: 999,
          bgcolor: "rgba(255,255,255,0.88)",
          color: "text.primary",
          fontWeight: 900,
          fontSize: 13,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
