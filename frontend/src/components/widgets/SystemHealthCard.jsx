// ============================================
// ARAB UNITY SCHOOL
// System Health Card
//
// Purpose:
// Displays health status of critical
// platform services.
//
// Reusable:
// Super Admin
// IT Management
// Asset Management
// Future Modules
// ============================================

import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { dashboardColors } from "../../theme/dashboardColors";

// ============================================
// Status Config
// ============================================

const STATUS_CONFIG = {
  healthy: {
    label: "Healthy",
    color: dashboardColors.success,
    background: dashboardColors.successLight,
    icon: <CheckCircleOutlineIcon fontSize="small" />,
  },

  warning: {
    label: "Warning",
    color: dashboardColors.warning,
    background: dashboardColors.warningLight,
    icon: <WarningAmberOutlinedIcon fontSize="small" />,
  },

  critical: {
    label: "Critical",
    color: dashboardColors.danger,
    background: dashboardColors.dangerLight,
    icon: <ErrorOutlineOutlinedIcon fontSize="small" />,
  },
};

// ============================================
// Component
// ============================================

export default function SystemHealthCard({
  title = "System Health",
  subtitle = "Current platform status",
  data = [],
}) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        border: `1px solid ${dashboardColors.border}`,
        backgroundColor: dashboardColors.cardBackground,
        boxShadow: `0 8px 24px ${dashboardColors.shadow}`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: dashboardColors.textPrimary,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: dashboardColors.textSecondary,
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        {/* Health Items */}
        <Stack spacing={2}>
          {data.map((item) => {
            const config =
              STATUS_CONFIG[item.status] ||
              STATUS_CONFIG.healthy;

            return (
              <Box
                key={item.name}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 3,
                  border: `1px solid ${dashboardColors.border}`,
                }}
              >
                {/* Left */}
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
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
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: dashboardColors.textPrimary,
                      }}
                    >
                      {item.name}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: dashboardColors.textSecondary,
                      }}
                    >
                      Uptime: {item.uptime}
                    </Typography>
                  </Box>
                </Stack>

                {/* Right */}
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
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}