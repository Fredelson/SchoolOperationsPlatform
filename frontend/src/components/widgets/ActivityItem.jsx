// ============================================
// ARAB UNITY SCHOOL
// Compact Activity Item
// ============================================

import { Avatar, Box, Typography } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";

import { dashboardColors } from "../../theme/dashboardColors";

export default function ActivityItem({ title, description, time }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "32px 1fr auto",
        alignItems: "center",
        gap: 1.2,
        py: 1,
        borderBottom: `1px solid ${dashboardColors.border}`,
        "&:last-child": {
          borderBottom: "none",
        },
      }}
    >
      <Avatar
        sx={{
          width: 30,
          height: 30,
          bgcolor: dashboardColors.successLight,
          color: dashboardColors.success,
        }}
      >
        <HistoryIcon sx={{ fontSize: 17 }} />
      </Avatar>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontWeight: 800,
            color: dashboardColors.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: "0.72rem",
            color: dashboardColors.textSecondary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {description}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: "0.7rem",
          fontWeight: 700,
          color: dashboardColors.textSecondary,
          whiteSpace: "nowrap",
        }}
      >
        {time}
      </Typography>
    </Box>
  );
}