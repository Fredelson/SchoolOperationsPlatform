// ============================================
// ARAB UNITY SCHOOL
// Dashboard Section
//
// Purpose:
// Reusable wrapper for dashboard sections.
// ============================================

import { Box, Typography } from "@mui/material";
import { dashboardColors } from "../../theme/dashboardColors";

export default function DashboardSection({
  title,
  subtitle,
  action,
  children,
}) {
  return (
    <Box>
      {(title || subtitle || action) && (
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            {title && (
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: dashboardColors.textPrimary,
                }}
              >
                {title}
              </Typography>
            )}

            {subtitle && (
              <Typography
                sx={{
                  mt: 0.3,
                  fontSize: 13,
                  color: dashboardColors.textSecondary,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {action && <Box>{action}</Box>}
        </Box>
      )}

      {children}
    </Box>
  );
}
