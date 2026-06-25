// ============================================
// ARAB UNITY SCHOOL
// Purpose Usage Trend Chart
// Connected to live backend dashboard data
// ============================================

import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

// ============================================
// Convert backend flat rows into Recharts format
// Example backend:
// [
//   { month: "Jun", purposeKey: "worksheet", requestCount: 2 },
//   { month: "Jun", purposeKey: "exam", requestCount: 1 }
// ]
//
// Recharts format:
// [
//   { month: "Jun", worksheet: 2, exam: 1 }
// ]
// ============================================

const transformPurposeTrendData = (rows = []) => {
  const grouped = {};

  rows.forEach((item) => {
    const month = item.month;
    const purposeKey = item.purposeKey || "others";

    if (!grouped[month]) {
      grouped[month] = {
        month,
      };
    }

    grouped[month][purposeKey] = item.requestCount || 0;
  });

  return Object.values(grouped);
};

// ============================================
// Get unique purpose keys for dynamic chart lines
// ============================================

const getPurposeKeys = (rows = []) => {
  const keys = rows.map((item) => item.purposeKey || "others");
  return [...new Set(keys)];
};

// ============================================
// Purpose Usage Trend Component
// ============================================

export default function PurposeUsageTrend({ data = [] }) {
  const chartData = transformPurposeTrendData(data);
  const purposeKeys = getPurposeKeys(data);

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        height: "100%",
        minWidth: 0,
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={3}>
          Purpose Usage Trend
        </Typography>

        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            height: 300,
          }}
        >
          {chartData.length === 0 ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              No purpose trend data available.
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />

                {purposeKeys.map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    strokeWidth={3}
                    dot
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}