// ============================================
// ARAB UNITY SCHOOL
// Compact Health Item
// ============================================

import { Box, Typography } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";

import { dashboardColors } from "../../theme/dashboardColors";

export default function HealthItem({ label, status, value }) {
  const isHealthy =
    status === "Healthy" ||
    status === "Connected" ||
    status === "Active" ||
    status === "Up to date";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        py: 0.75,
        borderBottom: `1px solid ${dashboardColors.border}`,
        "&:last-child": {
          borderBottom: "none",
        },
      }}
    >
      {/* Left label */}
      <Typography
        sx={{
          fontSize: "0.8rem",
          fontWeight: 700,
          color: dashboardColors.textPrimary,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>

      {/* Right status */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.6,
          minWidth: 0,
        }}
      >
        <CircleIcon
          sx={{
            fontSize: 7,
            color: isHealthy ? dashboardColors.success : dashboardColors.warning,
          }}
        />

        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 800,
            color: isHealthy ? dashboardColors.success : dashboardColors.warning,
            whiteSpace: "nowrap",
          }}
        >
          {status}
        </Typography>
      </Box>
    </Box>
  );
}