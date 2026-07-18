// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Platform Sidebar Badge
// ============================================
//
// Purpose:
// Reusable sidebar badge for labels like:
// - Soon
// - New
// - Count badges
// ============================================

import { Chip, alpha, useTheme } from "@mui/material";

export default function PlatformSidebarBadge({ label = "Soon" }) {
  const theme = useTheme();
  const sidebarText = theme.palette.primary.contrastText;

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 18,
        ml: 0.75,
        flex: "0 0 auto",
        fontSize: 9.5,
        fontWeight: 800,
        letterSpacing: 0,
        color: sidebarText,
        bgcolor: alpha(sidebarText, 0.12),
        border: `1px solid ${alpha(sidebarText, 0.12)}`,
        "& .MuiChip-label": {
          px: 0.75,
        },
      }}
    />
  );
}
