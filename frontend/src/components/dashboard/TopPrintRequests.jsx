// ============================================
// ARAB UNITY SCHOOL
// Top Print Requests Section
//
// Purpose:
// Displays the most common print request types
// for the selected period.
//
// Architecture:
// DashboardCard
//   └── ProgressItem rows
// ============================================

import { Box, Typography, LinearProgress, Button } from "@mui/material";
import DashboardCard from "./DashboardCard";
import { dashboardColors } from "../../theme/dashboardColors";

// ============================================
// Component
// ============================================

export default function TopPrintRequests({
  title = "Top Print Requests",
  subtitle = "This Week",
  items = [],
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      action={
        <Button size="small" sx={{ fontWeight: 800, textTransform: "none" }}>
          View All
        </Button>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
        {items.map((item) => {
          const percentage = (item.value / maxValue) * 100;

          return (
            <Box key={item.label}>
              {/* Label row */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: dashboardColors.textPrimary,
                  }}
                >
                  {item.label}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: dashboardColors.textPrimary,
                  }}
                >
                  {item.value}
                </Typography>
              </Box>

              {/* Progress bar */}
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 8,
                  borderRadius: 99,
                  bgcolor: dashboardColors.border,

                  "& .MuiLinearProgress-bar": {
                    borderRadius: 99,
                    bgcolor: item.color || dashboardColors.printing,
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>
    </DashboardCard>
  );
}
