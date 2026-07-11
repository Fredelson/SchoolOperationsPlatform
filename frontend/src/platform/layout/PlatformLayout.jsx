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
import { Alert, Box, Button, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";

import PlatformSidebar from "./PlatformSidebar";
import PlatformTopbar from "./PlatformTopbar";
import { exitLiveMode } from "../../modules/super-admin/workspaces/services/workspaceService";

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
  const liveToken=sessionStorage.getItem("liveModeToken");
  let livePayload=null; try { if(liveToken) livePayload=JSON.parse(atob(liveToken.split(".")[1].replaceAll("-","+").replaceAll("_","/"))); } catch { livePayload=null; }
  const handleExitLive=async()=>{try{if(livePayload?.liveSessionId)await exitLiveMode(livePayload.liveSessionId);}finally{sessionStorage.removeItem("liveModeToken");window.close();window.location.href="/super-admin/workspaces";}};

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
      {livePayload?.liveMode&&<Alert severity="error" variant="filled" action={<Button color="inherit" onClick={handleExitLive}>Exit Live Mode</Button>} sx={{position:"fixed",top:TOPBAR_HEIGHT,left:0,right:0,zIndex:1300,borderRadius:0}}>LIVE MODE · Acting as {livePayload.fullName} · Reason: {livePayload.reason}</Alert>}

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
          pt: `calc(${TOPBAR_HEIGHT}px + ${livePayload?.liveMode?65:15}px)`,
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
