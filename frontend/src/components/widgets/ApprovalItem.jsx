// ============================================
// ARAB UNITY SCHOOL
// Approval Item Component
//
// Purpose:
// Single pending approval row.
//
// Used By:
// PendingApprovals.jsx
// ============================================

import { Box, Chip, Typography } from "@mui/material";

import HourglassTopIcon from "@mui/icons-material/HourglassTop";

import { dashboardColors } from "../../theme/dashboardColors";

export default function ApprovalItem({
  title,
  module,
  requestedBy,
  time,
  status = "Pending",
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        border: `1px solid ${dashboardColors.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: dashboardColors.textPrimary,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: dashboardColors.textSecondary,
            mt: 0.5,
          }}
        >
          {module}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: dashboardColors.textSecondary,
          }}
        >
          Requested by {requestedBy}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: dashboardColors.textSecondary,
          }}
        >
          {time}
        </Typography>
      </Box>

      <Chip
        icon={<HourglassTopIcon />}
        label={status}
        size="small"
        sx={{
          fontWeight: 700,
          color: dashboardColors.warning,
          backgroundColor: dashboardColors.warningLight,
        }}
      />
    </Box>
  );
}