// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Platform Sidebar
// ============================================
//
// Purpose:
// Shared sidebar container for platform role layouts.
// Sidebar visual design stays here.
// Sidebar menu rendering is handled by PlatformSidebarTree.
// ============================================

import { Box, alpha, useTheme } from "@mui/material";

import { useAuth } from "../../context/AuthContext";
import { getSidebarItemsByRole } from "../navigation/sidebar/getSidebarItemsByRole";
import PlatformSidebarTree from "../navigation/sidebar/components/PlatformSidebarTree";

export default function PlatformSidebar({ width = 340, topOffset = 78 }) {
  const theme = useTheme();
  const { user } = useAuth();

  const role = user?.role || user?.Role;
  const sidebarSections = getSidebarItemsByRole(role);

  const platform = theme.palette.platform || {};

  const sidebarBg =
    platform.sidebarBackground || platform.sidebar || theme.palette.primary.dark;

  const sidebarText = theme.palette.primary.contrastText;

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
      <PlatformSidebarTree sections={sidebarSections} />
    </Box>
  );
}