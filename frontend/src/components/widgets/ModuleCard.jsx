// ============================================
// ARAB UNITY SCHOOL
// Reusable Dashboard Module Card
//
// Purpose:
// Displays one module shortcut/card on the
// Super Admin Dashboard.
//
// Reusable:
// Yes. This card can later be reused in:
// - Module Manager
// - Super Admin Dashboard
// - User Permission Dashboard
// - Future system module overview pages
// ============================================

import { Box, Typography } from "@mui/material";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

// ============================================
// Component
// ============================================

export default function ModuleCard({
  title,
  description,
  icon: Icon,
  color,
  lightColor,
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: "#ffffff",
        border: "1px solid #e8edf3",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        cursor: "pointer",
        transition: "all 0.2s ease",

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
          borderColor: color,
        },
      }}
    >
      {/* Left side: icon + text */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          minWidth: 0,
        }}
      >
        {/* Module icon box */}
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2.5,
            bgcolor: lightColor,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {Icon && <Icon sx={{ fontSize: 25 }} />}
        </Box>

        {/* Module text */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "#64748b",
              lineHeight: 1.3,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      {/* Right arrow */}
      <ArrowForwardIosRoundedIcon
        sx={{
          fontSize: 15,
          color: "#94a3b8",
          flexShrink: 0,
        }}
      />
    </Box>
  );
}