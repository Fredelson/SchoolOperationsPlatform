// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Super Admin Layout
//
// Purpose:
// Provides one shared layout for all Super Admin pages.
//
// Layout:
// - Topbar stays fixed at the top
// - Sidebar stays fixed below the topbar
// - Content starts beside the sidebar and below the topbar
//
// Important:
// This layout controls spacing for ALL Super Admin pages.
// If spacing is wrong here, Dashboard, Module Manager,
// Menu Manager, Button Manager, Widget Manager, etc.
// will all look wrong.
// ============================================

// ============================================
// Imports
// ============================================

import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminTopbar from "./SuperAdminTopbar";

// ============================================
// Layout Constants
// ============================================

// Matches the approved dashboard reference width
const SIDEBAR_WIDTH = 340;

// Fixed topbar height
const TOPBAR_HEIGHT = 78;

// ============================================
// Super Admin Layout Component
// ============================================

export default function SuperAdminLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
      }}
    >
      {/* Fixed Topbar */}
      <SuperAdminTopbar height={TOPBAR_HEIGHT} />

      {/* Fixed Sidebar Below Topbar */}
      <SuperAdminSidebar
        width={SIDEBAR_WIDTH}
        topOffset={TOPBAR_HEIGHT}
      />

      {/* Main Page Content */}
      <Box
        component="main"
        sx={{
          // Content starts after sidebar
          ml: `${SIDEBAR_WIDTH}px`,

          // Content starts after topbar
          pt: `${TOPBAR_HEIGHT}px`,

          // Page background
          bgcolor: "#f8fafc",

          // Full page height
          minHeight: "100vh",

          // IMPORTANT:
          // Keep this small because pages already have their own spacing.
          // This prevents the dashboard from being too far from sidebar/topbar.
          p: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

// ============================================
// End Component
// ============================================