import { Box } from "@mui/material";

const TOPBAR_HEIGHT = 80;
const SIDEBAR_WIDTH = 260;

export default function DashboardLayout({
  children,
  sidebar,
  topbar,
}) {
  return (
    <Box sx={{ bgcolor: "#F8FAFC" }}>

      {/* Fixed Topbar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: `${TOPBAR_HEIGHT}px`,
          zIndex: 2000,
        }}
      >
        {topbar}
      </Box>

      {/* Fixed Sidebar */}
      <Box
        sx={{
          position: "fixed",
          top: `${TOPBAR_HEIGHT}px`,
          left: 0,
          width: `${SIDEBAR_WIDTH}px`,
          height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          zIndex: 1500,
          bgcolor: "#0F172A",
          overflowY: "auto",
        }}
      >
        {sidebar}
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          marginLeft: `${SIDEBAR_WIDTH}px`,
          marginTop: `${TOPBAR_HEIGHT}px`,
          padding: "32px",
          minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          bgcolor: "#F8FAFC",
        }}
      >
        {children}
      </Box>

    </Box>
  );
}