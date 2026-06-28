// ============================================
// ARAB UNITY SCHOOL
// Platform Theme Provider
// ============================================
//
// Purpose:
// Builds the MUI theme from database branding.
// Prevents theme flicker while branding loads.
// ============================================

import { useMemo } from "react";

import { Box, CircularProgress } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import useBranding from "../../modules/system/hooks/useBranding";
import { buildTheme } from "../buildTheme";

export default function PlatformThemeProvider({ children }) {
  const { branding, loading } = useBranding();

  const theme = useMemo(() => {
    return buildTheme(branding);
  }, [branding]);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: theme.palette.background.default,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}