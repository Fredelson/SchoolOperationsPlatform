// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Platform Sidebar
// ============================================
//
// Purpose:
// Shared sidebar container for platform role layouts.
// Sidebar menu data now comes from backend.
// ============================================

import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Stack, Typography, alpha, useTheme } from "@mui/material";

import PlatformSidebarTree from "../navigation/sidebar/components/PlatformSidebarTree";
import { getMySidebar } from "../navigation/sidebar/services/sidebarService";

// ============================================
// Component
// ============================================

export default function PlatformSidebar({
  width = 340,
  topOffset = 78,
  isMobile = false,
  onNavigate,
}) {
  const theme = useTheme();

  const [sidebarSections, setSidebarSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const platform = theme.palette.platform || {};

  const sidebarBg =
    platform.sidebarBackground || platform.sidebar || theme.palette.primary.dark;

  const sidebarText = theme.palette.primary.contrastText;

  useEffect(() => {
    let mounted = true;

    async function loadSidebar() {
      try {
        setLoading(true);
        setError("");
        const sections = await getMySidebar();

        if (mounted) {
          setSidebarSections(Array.isArray(sections) ? sections : []);
        }
      } catch (error) {
        console.error("Failed to load sidebar:", error);

        if (mounted) {
          setSidebarSections([]);
          setError("Unable to load navigation.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSidebar();

    return () => {
      mounted = false;
    };
  }, [reloadKey]);

  return (
    <Box
      sx={{
        width,
        height: isMobile ? "100%" : `calc(100vh - ${topOffset}px)`,
        position: isMobile ? "relative" : "fixed",
        left: 0,
        top: isMobile ? 0 : `${topOffset}px`,
        background: sidebarBg,
        color: sidebarText,
        borderRight: `1px solid ${alpha(sidebarText, 0.08)}`,
        overflowY: "auto",
        overflowX: "hidden",
        zIndex: 1200,
      }}
    >
      {loading && (
        <Stack spacing={1.5} sx={{ py: 5, alignItems: "center" }}>
          <CircularProgress size={26} color="inherit" />
          <Typography variant="body2" sx={{ color: alpha(sidebarText, 0.72) }}>
            Loading navigation...
          </Typography>
        </Stack>
      )}

      {!loading && error && (
        <Stack spacing={1.5} sx={{ px: 3, py: 5, textAlign: "center", alignItems: "center" }}>
          <Typography variant="body2">{error}</Typography>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => setReloadKey((value) => value + 1)}
          >
            Retry
          </Button>
        </Stack>
      )}

      {!loading && !error && sidebarSections.length === 0 && (
        <Typography variant="body2" sx={{ px: 3, py: 5, color: alpha(sidebarText, 0.72) }}>
          No navigation items are available.
        </Typography>
      )}

      {!loading && !error && sidebarSections.length > 0 && (
        <PlatformSidebarTree
          sections={sidebarSections}
          onNavigate={onNavigate}
          defaultOpenAll
          showHierarchy
        />
      )}
    </Box>
  );
}
