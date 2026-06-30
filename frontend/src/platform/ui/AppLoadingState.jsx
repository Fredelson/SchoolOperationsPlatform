// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppLoadingState
// ============================================
//
// Purpose:
// Reusable loading state while API data is being fetched.
// ============================================

import { Box, CircularProgress, Typography } from "@mui/material";

export default function AppLoadingState({
  message = "Loading data...",
  minHeight = 240,
}) {
  return (
    <Box
      sx={{
        minHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <CircularProgress size={34} />

      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
