// ============================================
// ARAB UNITY SCHOOL
// Teacher Dashboard
// Modern Monthly Usage Chart
// ============================================

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";

import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function MonthlyUsageChart({ data = [] }) {
  // ============================================
  // Calculate totals
  // ============================================

  const totalPages = data.reduce(
    (sum, item) => sum + (item.pages || 0),
    0
  );

  const totalSheets = data.reduce(
    (sum, item) => sum + (item.sheets || 0),
    0
  );

  return (
    <Card
      sx={{
        borderRadius: 5,
        border: "1px solid #E2E8F0",

        background:
          "linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)",

        boxShadow:
          "0 10px 30px rgba(15,23,42,0.06)",

        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 3,
                bgcolor: "#EEF4FF",
                color: "#2563EB",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <InsertChartOutlinedIcon />
            </Box>

            <Box>
              <Typography
                variant="h6"
                fontWeight={900}
              >
                Monthly Usage
              </Typography>

              <Typography
                color="text.secondary"
                fontSize={14}
              >
                Pages and sheets used this year.
              </Typography>
            </Box>
          </Box>

          <Chip
            label={`${totalSheets} Sheets`}
            sx={{
              bgcolor: "#EEF4FF",
              color: "#2563EB",
              fontWeight: 800,
            }}
          />
        </Box>

        {/* Summary Stats */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2,1fr)",
            gap: 2,
            mb: 3,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "#F8FAFC",
            }}
          >
            <Typography
              fontSize={13}
              color="text.secondary"
            >
              Total Pages
            </Typography>

            <Typography
              variant="h5"
              fontWeight={900}
            >
              {totalPages}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "#F8FAFC",
            }}
          >
            <Typography
              fontSize={13}
              color="text.secondary"
            >
              Total Sheets
            </Typography>

            <Typography
              variant="h5"
              fontWeight={900}
            >
              {totalSheets}
            </Typography>
          </Box>
        </Box>

        {/* Chart */}
        <Box
          sx={{
            width: "100%",
            height: 320,
          }}
        >
          {data.length === 0 ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              No monthly usage data available.
            </Box>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="pages"
                  fill="#2563EB"
                  radius={[10, 10, 0, 0]}
                />

                <Bar
                  dataKey="sheets"
                  fill="#8B5CF6"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}