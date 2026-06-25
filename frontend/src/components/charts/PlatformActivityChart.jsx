// ============================================
// ARAB UNITY SCHOOL
// Platform Activity Chart
//
// Purpose:
// Displays platform activity trends.
//
// Design:
// Compact version matching approved dashboard.
// ============================================

import { Box } from "@mui/material";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import DashboardCard from "../common/DashboardCard";
import { dashboardColors } from "../../theme/dashboardColors";

// ============================================
// Component
// ============================================

export default function PlatformActivityChart({
  data = [],
}) {
  return (
    <DashboardCard
      title="Platform Activity"
      subtitle="Print requests and IT tickets activity"
    >
      <Box
        sx={{
          height: 250,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -15,
              bottom: 0,
            }}
          >
            {/* Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            {/* X Axis */}
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />

            {/* Y Axis */}
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${dashboardColors.border}`,
                boxShadow: `0 10px 24px ${dashboardColors.shadow}`,
              }}
            />

            {/* Print Requests */}
            <Line
              type="monotone"
              dataKey="printRequests"
              name="Print Requests"
              stroke={dashboardColors.success}
              strokeWidth={3}
              dot={{
                r: 4,
                strokeWidth: 3,
              }}
              activeDot={{
                r: 6,
              }}
            />

            {/* Tickets */}
            <Line
              type="monotone"
              dataKey="tickets"
              name="Tickets"
              stroke={dashboardColors.info}
              strokeWidth={3}
              dot={{
                r: 4,
                strokeWidth: 3,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
}