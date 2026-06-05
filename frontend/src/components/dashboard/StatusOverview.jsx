// ============================================
// ARAB UNITY SCHOOL
// Teacher Dashboard
// Request Status Overview Component
// ============================================

import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from "@mui/material";

import { requestStatusData } from "../../data/dashboardData";

export default function StatusOverview() {
  const total = requestStatusData.reduce(
    (sum, item) => sum + item.count,
    0
  );

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
          Request Status Overview
        </Typography>

        {requestStatusData.map((item) => {
          const percentage = Math.round((item.count / total) * 100);

          return (
            <Box key={item.status} mb={2.5}>
              <Box
                display="flex"
                justifyContent="space-between"
                mb={0.8}
              >
                <Typography variant="body2">
                  {item.status}
                </Typography>

                <Typography variant="body2" fontWeight={700}>
                  {item.count}
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 8,
                  borderRadius: 5,
                  backgroundColor: "#E5E7EB",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: item.color,
                    borderRadius: 5,
                  },
                }}
              />
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}