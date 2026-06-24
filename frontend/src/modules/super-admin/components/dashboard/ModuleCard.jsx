// ============================================
// ARAB UNITY SCHOOL
// Reusable Module Card
// ============================================

import { Card, CardContent, Typography, Avatar, Chip, Box } from "@mui/material";
import { dashboardColors } from "../../theme/dashboardColors";

export default function ModuleCard({
  title,
  description,
  icon: Icon,
  enabled,
  color = dashboardColors.modules,
}) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        border: `1px solid ${dashboardColors.border}`,
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
        transition: "all 0.25s ease",

        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 20px 42px rgba(15,23,42,0.12)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: color,
              color: "#ffffff",
              boxShadow: `0 12px 28px ${color}40`,
            }}
          >
            {Icon && <Icon sx={{ fontSize: 34 }} />}
          </Avatar>

          <Chip
            label={enabled ? "Enabled" : "Disabled"}
            size="small"
            sx={{
              fontWeight: 800,
              bgcolor: enabled
                ? dashboardColors.successLight
                : dashboardColors.dangerLight,
              color: enabled ? "#166534" : "#991b1b",
            }}
          />
        </Box>

        <Typography fontWeight={900} color={dashboardColors.navy} sx={{ mb: 0.5 }}>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}