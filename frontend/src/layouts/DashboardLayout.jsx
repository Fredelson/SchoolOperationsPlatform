import { Box } from "@mui/material";

const TOPBAR_HEIGHT = 70;
const SIDEBAR_WIDTH = 240;

export default function DashboardLayout({ sidebar, topbar, children }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      {/* Topbar */}
      <Box
        sx={{
          height: TOPBAR_HEIGHT,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          bgcolor: "#fff",
        }}
      >
        {topbar}
      </Box>

      {/* Sidebar */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          position: "fixed",
          top: TOPBAR_HEIGHT,
          left: 0,
          bottom: 0,
          zIndex: 1100,
        }}
      >
        {sidebar}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          ml: `${SIDEBAR_WIDTH}px`,
          pt: `${TOPBAR_HEIGHT}px`,
          minHeight: "100vh",
        }}
      >
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}