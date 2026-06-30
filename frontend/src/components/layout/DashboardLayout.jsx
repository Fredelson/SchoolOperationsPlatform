// ============================================
// ARAB UNITY SCHOOL
// Reusable Dashboard Layout
// Supports desktop sidebar
// Supports mobile drawer sidebar
// Works with Topbar hamburger button
// ============================================

import { useState } from "react";

import {
  Box,
  Drawer,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

// ============================================
// Layout Sizes
// ============================================

const TOPBAR_HEIGHT = 86;
const SIDEBAR_WIDTH = 240;

export default function DashboardLayout({ sidebar, topbar, children }) {
  const theme = useTheme();

  // Detect small screens
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Open mobile sidebar
  const handleMenuClick = () => {
    setMobileOpen(true);
  };

  // Close mobile sidebar
  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
      }}
    >
      {/* ===================================== */}
      {/* TOPBAR */}
      {/* ===================================== */}
      <Box
        sx={{
          height: TOPBAR_HEIGHT,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2000,
        }}
      >
        {typeof topbar === "function"
          ? topbar(handleMenuClick)
          : topbar}
      </Box>

      {/* ===================================== */}
      {/* DESKTOP SIDEBAR */}
      {/* ===================================== */}
      {!isMobile && (
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            position: "fixed",
            top: `${TOPBAR_HEIGHT}px`,
            left: 0,
            bottom: 0,
            zIndex: 1200,
          }}
        >
          {sidebar}
        </Box>
      )}

      {/* ===================================== */}
      {/* MOBILE SIDEBAR DRAWER */}
      {/* ===================================== */}
      <Drawer
        open={mobileOpen}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {sidebar}
      </Drawer>

      {/* ===================================== */}
      {/* MAIN CONTENT */}
      {/* ===================================== */}
      <Box
        component="main"
        sx={{
          ml: {
            xs: 0,
            md: `${SIDEBAR_WIDTH}px`,
          },
          pt: `${TOPBAR_HEIGHT}px`,
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
