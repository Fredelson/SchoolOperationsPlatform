// ============================================
// ARAB UNITY SCHOOL
// Module Status Chart
//
// Purpose:
// Displays compact module status summary.
//
// Design:
// Matches approved Super Admin dashboard row.
// ============================================

import { Box, Typography } from "@mui/material";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import DashboardCard from "../common/DashboardCard";
import { dashboardColors } from "../../theme/dashboardColors";

// ============================================
// Status Colors
// ============================================

const STATUS_COLORS = {
  // Platform module statuses
  active: dashboardColors.success,
  inProgress: dashboardColors.info,
  comingSoon: dashboardColors.warning,
  disabled: dashboardColors.neutral,
  inactive: dashboardColors.neutral,
  maintenance: dashboardColors.warning,

  // Printing dashboard statuses
  pending: dashboardColors.warning,
  printing: dashboardColors.info,
  completed: dashboardColors.success,
  rejected: dashboardColors.danger,
};

// ============================================
// Component
// ============================================

export default function ModuleStatusChart({
  title = "Module Status",
  subtitle = "Availability of platform modules",
  data = [],
}) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <DashboardCard title={title} subtitle={subtitle}>
      <Box
        sx={{
          height: 260,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Chart */}
        <Box
          sx={{
            height: 135,
            position: "relative",
            mb: 1.5,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={42}
                outerRadius={58}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`${entry.key}-${index}`}
                    fill={
                      STATUS_COLORS[entry.key] ||
                      dashboardColors.neutral
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [`${value}`, name]}
                contentStyle={{
                  borderRadius: 10,
                  border: `1px solid ${dashboardColors.border}`,
                  boxShadow: `0 10px 24px ${dashboardColors.shadow}`,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Total */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              pointerEvents: "none",
            }}
          >
            <Typography
              sx={{
                fontSize: "1.45rem",
                fontWeight: 900,
                color: dashboardColors.textPrimary,
                lineHeight: 1,
              }}
            >
              {total}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: dashboardColors.textSecondary,
                mt: 0.2,
              }}
            >
              Total
            </Typography>
          </Box>
        </Box>

        {/* Compact Legend */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.9,
          }}
        >
          {data.map((item, index) => {
            const value = Number(item.value || 0);
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            const color =
              STATUS_COLORS[item.key] || dashboardColors.neutral;

            return (
              <Box
                key={`${item.key}-${index}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: color,
                      flexShrink: 0,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: dashboardColors.textPrimary,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: dashboardColors.textSecondary,
                    whiteSpace: "nowrap",
                  }}
                >
                  {value} ({percent}%)
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </DashboardCard>
  );
}