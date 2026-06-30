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
import { Box, alpha, useTheme } from "@mui/material";

import PlatformSidebarTree from "../navigation/sidebar/components/PlatformSidebarTree";
import { getMySidebar } from "../navigation/sidebar/services/sidebarService";

// ============================================
// Component
// ============================================

export default function PlatformSidebar({ width = 340, topOffset = 78 }) {
  const theme = useTheme();

  const [sidebarSections, setSidebarSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const platform = theme.palette.platform || {};

  const sidebarBg =
    platform.sidebarBackground || platform.sidebar || theme.palette.primary.dark;

  const sidebarText = theme.palette.primary.contrastText;

  useEffect(() => {
    let mounted = true;

    async function loadSidebar() {
      try {
        const sections = await getMySidebar();

        if (mounted) {
          setSidebarSections(Array.isArray(sections) ? sections : []);
        }
      } catch (error) {
        console.error("Failed to load sidebar:", error);

        if (mounted) {
          setSidebarSections([]);
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
  }, []);

  return (
    <Box
      sx={{
        width,
        height: `calc(100vh - ${topOffset}px)`,
        position: "fixed",
        left: 0,
        top: `${topOffset}px`,
        background: sidebarBg,
        color: sidebarText,
        borderRight: `1px solid ${alpha(sidebarText, 0.08)}`,
        overflowY: "auto",
        overflowX: "hidden",
        zIndex: 1200,
      }}
    >
      {!loading && <PlatformSidebarTree sections={sidebarSections} />}
    </Box>
  );
}
