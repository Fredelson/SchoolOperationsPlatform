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

import PlatformActivityChart from "../charts/PlatformActivityChart";
import ModuleStatusChart from "../charts/ModuleStatusChart";
import SystemHealth from "../dashboard/SystemHealth";
import RecentActivity from "../dashboard/RecentActivity";

export default function DashboardMiddleRow({
  children,
  columns,
  platformActivityData = [],
  moduleStatusData = [],
  systemHealthData = [],
  recentActivityData = [],
  activityChartProps = {},
}) {
  const hasCustomContent = Boolean(children);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr",
          md: "repeat(2, minmax(0, 1fr))",
          lg: columns || "2fr 1.15fr 1.15fr 1.35fr",
        },
        gap: hasCustomContent ? 2 : 0.5,
        alignItems: "stretch",
        mb: 1,
      }}
    >
      {hasCustomContent ? (
        children
      ) : (
        <>
          <PlatformActivityChart
            data={platformActivityData}
            {...activityChartProps}
          />
          <ModuleStatusChart data={moduleStatusData} />
          <SystemHealth items={systemHealthData} />
          <RecentActivity items={recentActivityData} />
        </>
      )}
    </Box>
  );
}
