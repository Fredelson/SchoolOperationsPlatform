// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Platform Layout
// ============================================
//
// Purpose:
// Shared responsive layout for platform pages.
// Uses dynamic theme colors from System Branding.
// ============================================

import { useState } from "react";
import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";

import PlatformSidebar from "./PlatformSidebar";
import PlatformTopbar from "./PlatformTopbar";

// ============================================
// Layout Constants
// ============================================

const SIDEBAR_WIDTH = 340;
const MOBILE_SIDEBAR_WIDTH = 300;
const TOPBAR_HEIGHT = 78;

// ============================================
// Component
// ============================================

export default function PlatformLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        overflowX: "hidden",
      }}
    >
      <PlatformTopbar
        height={TOPBAR_HEIGHT}
        onMenuClick={() => setMobileOpen((prev) => !prev)}
      />

      {isDesktop && (
        <PlatformSidebar
          width={SIDEBAR_WIDTH}
          topOffset={TOPBAR_HEIGHT}
        />
      )}

      {!isDesktop && (
        <Drawer
          open={mobileOpen}
          onClose={handleCloseMobileSidebar}
          ModalProps={{
            keepMounted: true,
          }}
          slotProps={{
            paper: {
              sx: {
                width: MOBILE_SIDEBAR_WIDTH,
                maxWidth: "85vw",
                bgcolor:
                  theme.palette.platform?.sidebar ||
                  theme.palette.primary.dark,
                overflowX: "hidden",
              },
            },
          }}
        >
          <PlatformSidebar
            width={MOBILE_SIDEBAR_WIDTH}
            topOffset={0}
            isMobile
            onNavigate={handleCloseMobileSidebar}
          />
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          ml: {
            xs: 0,
            lg: `${SIDEBAR_WIDTH}px`,
          },
          pt: `calc(${TOPBAR_HEIGHT}px + 15px)`,
          px: { xs: 2, md: 3 },
          pb: { xs: 2, md: 3 },
          width: {
            xs: "100%",
            lg: `calc(100% - ${SIDEBAR_WIDTH}px)`,
          },
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}