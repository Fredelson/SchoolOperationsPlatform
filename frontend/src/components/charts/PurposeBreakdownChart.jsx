// ============================================
// ARAB UNITY SCHOOL
// Teacher Dashboard
// Purpose Breakdown Donut Chart
// Connected to live backend dashboard data
// ============================================

import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Chart colors
const COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

// ============================================
// Purpose Breakdown Chart Component
// ============================================

export default function PurposeBreakdownChart({ data = [] }) {
  return (
    <Card
      sx={{
        height: "100%",
        minWidth: 0,
        borderRadius: 4,
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={3}>
          Purpose Breakdown
        </Typography>

        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            height: 350,
          }}
        >
          {data.length === 0 ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              No purpose data available.
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}