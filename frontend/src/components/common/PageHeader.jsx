// ============================================
// ARAB UNITY SCHOOL
// Reusable Page Header
//
// Purpose:
// Standard page title/header used across
// all modules in the AUS Operations Platform.
//
// Reusable:
// - Super Admin
// - Printing Admin
// - HOD
// - HOS
// - Admin
// - Teacher
// ============================================

import { Box, Typography } from "@mui/material";
import { dashboardColors } from "../../theme/dashboardColors";

export default function PageHeader({
  title,
  subtitle,
  action,
}) {
  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      {/* Left Side */}
      <Box>
        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 900,
            color: dashboardColors.textPrimary,
            lineHeight: 1.1,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            sx={{
              mt: 0.5,
              fontSize: 14,
              color: dashboardColors.textSecondary,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Right Side Actions */}
      {action && <Box>{action}</Box>}
    </Box>
  );
}
