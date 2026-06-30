// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Alert Item
//
// Purpose:
// Reusable dashboard alert row.
//
// Reusable:
// - Super Admin
// - Platform Admin
// - Printing Admin
// - IT Dashboard
// - Future Modules
// ============================================

import { Box, Chip, Typography } from "@mui/material";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

import { dashboardColors } from "../../theme/dashboardColors";

// ============================================
// Alert Configuration
// ============================================

const ALERT_CONFIG = {
  info: {
    label: "Info",
    color: dashboardColors.info,
    background: dashboardColors.infoLight,
    icon: <InfoOutlinedIcon fontSize="small" />,
  },

  success: {
    label: "Success",
    color: dashboardColors.success,
    background: dashboardColors.successLight,
    icon: <CheckCircleOutlineOutlinedIcon fontSize="small" />,
  },

  warning: {
    label: "Warning",
    color: dashboardColors.warning,
    background: dashboardColors.warningLight,
    icon: <WarningAmberOutlinedIcon fontSize="small" />,
  },

  error: {
    label: "Error",
    color: dashboardColors.danger,
    background: dashboardColors.dangerLight,
    icon: <ErrorOutlineOutlinedIcon fontSize="small" />,
  },
};

// ============================================
// Component
// ============================================

export default function AlertItem({
  title,
  message,
  severity = "info",
}) {
  const config =
    ALERT_CONFIG[severity] || ALERT_CONFIG.info;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        p: 1.5,
        mb: 1.5,
        borderRadius: 3,
        border: `1px solid ${dashboardColors.border}`,
        backgroundColor: dashboardColors.cardBackground,
      }}
    >
      {/* Left Side */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flex: 1,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: config.background,
            color: config.color,
          }}
        >
          {config.icon}
        </Box>

        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: dashboardColors.textPrimary,
            }}
          >
            {title}
          </Typography>

          {message && (
            <Typography
              variant="body2"
              sx={{
                color: dashboardColors.textSecondary,
              }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right Side */}
      <Chip
        label={config.label}
        size="small"
        sx={{
          fontWeight: 700,
          color: config.color,
          backgroundColor: config.background,
        }}
      />
    </Box>
  );
}
