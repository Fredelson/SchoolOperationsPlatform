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
        height: 20,
        ml: 1,
        fontSize: 10,
        fontWeight: 800,
        color: sidebarText,
        bgcolor: alpha(sidebarText, 0.14),
      }}
    />
  );
}
