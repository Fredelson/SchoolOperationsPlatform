// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Platform Sidebar Section
// ============================================
//
// Purpose:
// Renders a sidebar section heading.
//
// Example:
//
// MAIN
// ORGANIZATION
// OPERATIONS
//
// ============================================

import { Box, Divider, Typography, alpha, useTheme } from "@mui/material";

export default function PlatformSidebarSection({
  title,
  open = true,
  onToggle,
}) {
  const theme = useTheme();

  const platform = theme.palette.platform || {};
  const sidebarText = theme.palette.primary.contrastText;
  const accent = platform.accent || theme.palette.success.main;

  return (
    <Box
      component={onToggle ? "button" : "div"}
      onClick={onToggle}
      aria-expanded={onToggle ? open : undefined}
      type={onToggle ? "button" : undefined}
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 1,
        mb: 0.9,
        px: 1,
        py: 0.35,
        border: 0,
        bgcolor: "transparent",
        color: alpha(sidebarText, 0.58),
        textAlign: "left",
        cursor: onToggle ? "pointer" : "default",
        "&:hover": onToggle
          ? {
              color: sidebarText,
            }
          : undefined,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 6,
          height: 6,
          flex: "0 0 auto",
          borderRadius: "50%",
          bgcolor: accent,
          boxShadow: `0 0 0 3px ${alpha(accent, 0.12)}`,
        }}
      />
      <Typography
        variant="caption"
        sx={{
          flex: "0 0 auto",
          color: "inherit",
          fontSize: 10.5,
          lineHeight: 1.2,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: 0,
        }}
      >
        {title}
      </Typography>
      <Divider
        flexItem
        sx={{
          flex: 1,
          borderColor: alpha(sidebarText, 0.12),
        }}
      />
    </Box>
  );
}
