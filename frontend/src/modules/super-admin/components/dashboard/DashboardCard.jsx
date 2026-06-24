// ============================================
// ARAB UNITY SCHOOL
// Reusable Dashboard Card
// ============================================

import { Card, CardContent, Typography, Box } from "@mui/material";
import { dashboardColors } from "../../theme/dashboardColors";

export default function DashboardCard({ title, subtitle, action, children }) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        border: `1px solid ${dashboardColors.border}`,
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow: "0 14px 35px rgba(15, 23, 42, 0.06)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Card Header */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography fontWeight={900} color={dashboardColors.navy}>
              {title}
            </Typography>

            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          {action}
        </Box>

        {/* Card Body */}
        {children}
      </CardContent>
    </Card>
  );
}