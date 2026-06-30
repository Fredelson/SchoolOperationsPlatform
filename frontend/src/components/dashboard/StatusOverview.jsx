// ============================================
// ARAB UNITY SCHOOL
// Teacher Dashboard
// Modern Request Status Overview Component
// Connected to live KPI data
// ============================================

import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from "@mui/material";

import DonutLargeIcon from "@mui/icons-material/DonutLarge";

// ============================================
// Status Overview Component
// ============================================

export default function StatusOverview({ kpis }) {
  // ============================================
  // Total requests from backend KPI
  // ============================================
  const total = kpis?.totalRequests || 0;

  // ============================================
  // Status data
  // Completed included because teacher needs workflow visibility
  // ============================================
  const requestStatusData = [
    {
      status: "Pending",
      count: kpis?.pendingRequests || 0,
      color: "#F59E0B",
    },
    {
      status: "Approved",
      count: kpis?.approvedRequests || 0,
      color: "#22C55E",
    },
    {
      status: "Completed",
      count: kpis?.completedRequests || 0,
      color: "#06B6D4",
    },
    {
      status: "Rejected",
      count: kpis?.rejectedRequests || 0,
      color: "#EF4444",
    },
  ];

  // ============================================
  // Main UI
  // ============================================

  return (
    <Card
      sx={{
        height: "100%",
        minWidth: 0,
        borderRadius: 5,
        border: "1px solid #E2E8F0",
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        background: "linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: "#EAF7EE",
              color: "#16A34A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DonutLargeIcon />
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={900}>
              Request Status Overview
            </Typography>
            <Typography color="text.secondary" fontSize={14}>
              Current status of your requests.
            </Typography>
          </Box>
        </Box>

        {/* Total Requests Center */}
        <Box
          sx={{
            textAlign: "center",
            py: 2,
            mb: 3,
            borderRadius: 4,
            bgcolor: "#F1F5F9",
          }}
        >
          <Typography variant="h3" fontWeight={900}>
            {total}
          </Typography>
          <Typography color="text.secondary">Total Requests</Typography>
        </Box>

        {/* Status Rows */}
        {requestStatusData.map((item) => {
          const percentage =
            total > 0 ? Math.round((item.count / total) * 100) : 0;

          return (
            <Box key={item.status} mb={2.3}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.8,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: item.color,
                    }}
                  />

                  <Typography fontWeight={700}>
                    {item.status}
                  </Typography>
                </Box>

                <Typography fontWeight={900}>
                  {item.count} ({percentage}%)
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 9,
                  borderRadius: 10,
                  backgroundColor: "#E5E7EB",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: item.color,
                    borderRadius: 10,
                  },
                }}
              />
            </Box>
          );
        })}

        {/* Positive Status Message */}
        {total > 0 && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 3,
              bgcolor: "#EAF7EE",
              color: "#166534",
            }}
          >
            <Typography fontSize={14} fontWeight={700}>
              {Math.round(
                ((kpis?.completedRequests || 0) / total) * 100
              )}
              % of your requests are completed.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
