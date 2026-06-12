// ============================================
// ARAB UNITY SCHOOL
// Department Distribution Chart
// Live Backend Data Version
// ============================================

// React
import { useMemo } from "react";

// MUI components
import { Card, CardContent, Typography } from "@mui/material";

// Recharts components
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

// Chart colors
const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

// ============================================
// Component
// Receives live requests from HodDashboard.jsx
// ============================================
export default function DepartmentDistributionChart({ requests = [] }) {
  // ============================================
  // Convert request list into department count data
  // Example:
  // [{ name: "Primary", value: 5 }]
  // ============================================
  const chartData = useMemo(() => {
    const departmentMap = {};

    // Count how many requests belong to each department
    requests.forEach((request) => {
      const department = request.department || "Unknown";

      departmentMap[department] =
        (departmentMap[department] || 0) + 1;
    });

    // Convert object into array for Recharts PieChart
    return Object.keys(departmentMap).map((department) => ({
      name: department,
      value: departmentMap[department],
    }));
  }, [requests]);

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        height: "100%",
      }}
    >
      <CardContent>
        {/* Chart title */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Department Distribution
        </Typography>

        {/* Show message if there is no request data */}
        {chartData.length === 0 ? (
          <Typography color="text.secondary">
            No department data available.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={85}
                label
              >
                {/* Apply chart colors to each department */}
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              {/* Hover tooltip */}
              <Tooltip />

              {/* Chart legend */}
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}