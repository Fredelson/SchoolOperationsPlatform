// ============================================
// ARAB UNITY SCHOOL
// Super Admin Dashboard Middle Row
//
// Purpose:
// Displays the main dashboard analytics row.
//
// Layout:
// System Overview | Module Status | System Health | Recent Activities
//
// Responsive:
// Mobile: 1 column
// Tablet: 2 columns
// Desktop: 4 columns with System Overview wider
// ============================================

import { Box } from "@mui/material";

import PlatformActivityChart from "./PlatformActivityChart";
import ModuleStatusChart from "./ModuleStatusChart";
import SystemHealth from "./SystemHealth";
import RecentActivity from "./RecentActivity";

export default function DashboardMiddleRow({
  platformActivityData = [],
  moduleStatusData = [],
  systemHealthData = [],
  recentActivityData = [],
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
          lg: "2fr 1.15fr 1.15fr 1.35fr",
        },
        gap: 0.5,
        alignItems: "stretch",
        mb: 1,
      }}
    >
      {/* System Overview / Platform Activity */}
      <PlatformActivityChart data={platformActivityData} />

      {/* Module Status */}
      <ModuleStatusChart data={moduleStatusData} />

      {/* System Health */}
      <SystemHealth items={systemHealthData} />

      {/* Recent Activities */}
      <RecentActivity items={recentActivityData} />
    </Box>
  );
}