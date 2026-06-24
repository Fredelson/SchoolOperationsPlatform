// ============================================
// ARAB UNITY SCHOOL
// Reusable KPI Card
// ============================================

import { Card, CardContent, Box, Typography, Avatar } from "@mui/material";
import { dashboardColors } from "../../theme/dashboardColors";

export default function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = dashboardColors.success,
}) {
  const isNegative = String(change || "").startsWith("-");

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
            {Icon && <Icon sx={{ fontSize: 22 }} />}
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

            {change && (
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
                {isNegative ? "↓" : "↑"} {change}
              </Typography>
            )}

            {changeLabel && (
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
                {changeLabel}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}