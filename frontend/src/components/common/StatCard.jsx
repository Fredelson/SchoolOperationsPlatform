// ============================================
// ARAB UNITY SCHOOL
// Reusable KPI Card
//
// Supports:
// 1. Static frontend icon component
//    icon: PrintOutlinedIcon
//
// 2. Backend icon key
//    icon: "printing"
// ============================================

import { Card, CardContent, Box, Typography, Avatar } from "@mui/material";

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

import { dashboardColors } from "../../theme/dashboardColors";

// ============================================
// Backend Icon Key Map
// ============================================

const KPI_ICON_MAP = {
  pending: AssignmentOutlinedIcon,
  printing: PrintOutlinedIcon,
  completed: CheckCircleOutlineOutlinedIcon,
  calendar: CalendarMonthOutlinedIcon,
  inventory: Inventory2OutlinedIcon,
  warning: WarningAmberOutlinedIcon,
};

export default function StatCard({
  title,
  value,
  change,
  changeLabel,
  status,
  subtitle,
  icon,
  color = dashboardColors.success,
}) {
  const isNegative = String(change || status || "").startsWith("-");

  // Supports icon component OR backend string key
  const Icon =
    typeof icon === "string"
      ? KPI_ICON_MAP[icon] || PersonOutlinedIcon
      : icon || PersonOutlinedIcon;

  return (
    <Card
      sx={{
        height: 112,
        minWidth: 0,
        borderRadius: 3,
        border: `1px solid ${dashboardColors.border}`,
        background: dashboardColors.cardBackground,
        boxShadow: `0 10px 26px ${dashboardColors.shadow}`,
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          p: 1.75,
          "&:last-child": {
            pb: 1.75,
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: color,
              color: "#ffffff",
              boxShadow: `0 8px 18px ${color}30`,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 800,
                color: dashboardColors.textPrimary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: "0.82rem",
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                fontWeight: 900,
                color: dashboardColors.textPrimary,
                lineHeight: 1.05,
                fontSize: {
                  xs: "1.45rem",
                  md: "1.55rem",
                },
              }}
            >
              {value}
            </Typography>

            {(change || status) && (
              <Typography
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  color: isNegative
                    ? dashboardColors.danger
                    : dashboardColors.success,
                  lineHeight: 1.1,
                  mt: 0.3,
                }}
              >
                {isNegative ? "↓" : "↑"} {change || status}
              </Typography>
            )}

            {(changeLabel || subtitle) && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: dashboardColors.textSecondary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.1,
                  mt: 0.2,
                }}
              >
                {changeLabel || subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
