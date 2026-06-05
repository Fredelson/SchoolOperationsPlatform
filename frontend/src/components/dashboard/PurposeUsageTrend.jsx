// ============================================
// ARAB UNITY SCHOOL
// Purpose Usage Trend Chart
// Fixed Recharts container sizing
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

import { purposeTrendData } from "../../data/dashboardData";

export default function PurposeUsageTrend() {
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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={purposeTrendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line type="monotone" dataKey="worksheet" stroke="#2563EB" strokeWidth={3} />
              <Line type="monotone" dataKey="exam" stroke="#F59E0B" strokeWidth={3} />
              <Line type="monotone" dataKey="homework" stroke="#10B981" strokeWidth={3} />
              <Line type="monotone" dataKey="others" stroke="#8B5CF6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}