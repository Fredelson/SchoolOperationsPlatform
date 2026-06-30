// ============================================
// ARAB UNITY SCHOOL
// Reusable KPI Card
// Used by Teacher, HOD, HOS, Admin dashboards
// ============================================

import { Card, CardContent, Box, Typography } from "@mui/material";

export default function KPICard({
  title,
  value,
  icon,
  color = "#2563EB",
}) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        height: "100%",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#64748B",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 800,
                color: "#0F172A",
                mt: 1,
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: `${color}20`,
              color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "& svg": {
                fontSize: 28,
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
