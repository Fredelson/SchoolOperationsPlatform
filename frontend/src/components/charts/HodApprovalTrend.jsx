// ============================================
// ARAB UNITY SCHOOL
// HOD Approval Trend Chart
// Live Backend Data Version
// ============================================

// React
import { useMemo } from "react";

// MUI Components
import { Card, CardContent, Typography } from "@mui/material";

// Recharts Components
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

// ============================================
// Component
// Receives requests from HodDashboard.jsx
// ============================================
export default function HodApprovalTrend({ requests = [] }) {
  // ============================================
  // Build chart data from live requests
  // ============================================
  const chartData = useMemo(() => {
    // Month labels for the chart
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    // Create default chart structure for all months
    const monthlyData = months.map((month) => ({
      month,
      approved: 0,
      rejected: 0,
    }));

    // Loop through all HOD requests
    requests.forEach((request) => {
      // Use raw backend date for accurate sorting/charting
      const dateValue = request.rawSubmittedAt || request.submittedDate;

      // Skip request if date is missing
      if (!dateValue) return;

      // Convert date value to JavaScript date
      const date = new Date(dateValue);

      // Skip invalid date
      if (isNaN(date.getTime())) return;

      // Get month index from date
      const monthIndex = date.getMonth();

      // Normalize backend status
      const status = request.status?.toLowerCase();

      // Count approved by HOD requests
      if (status === "approved by hod") {
        monthlyData[monthIndex].approved += 1;
      }

      // Count rejected by HOD requests
      if (status === "rejected by hod") {
        monthlyData[monthIndex].rejected += 1;
      }
    });

    return monthlyData;
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
          Monthly Approval Trend
        </Typography>

        {/* Responsive bar chart */}
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            {/* Month labels */}
            <XAxis dataKey="month" />

            {/* Number of requests */}
            <YAxis />

            {/* Tooltip when hovering */}
            <Tooltip />

            {/* Chart legend */}
            <Legend />

            {/* Approved requests bar */}
            <Bar
              dataKey="approved"
              fill="#10B981"
              radius={[6, 6, 0, 0]}
            />

            {/* Rejected requests bar */}
            <Bar
              dataKey="rejected"
              fill="#EF4444"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
