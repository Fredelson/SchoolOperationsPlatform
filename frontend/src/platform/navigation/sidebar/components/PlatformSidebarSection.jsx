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

import { Box, ListItemButton, Typography, alpha, useTheme } from "@mui/material";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

export default function PlatformSidebarSection({
  title,
  open = true,
  showHierarchy = false,
  onToggle,
}) {
  const theme = useTheme();

  const platform = theme.palette.platform || {};
  const sidebarText = theme.palette.primary.contrastText;
  const accent = platform.accent || theme.palette.success.main;

  return (
    <Box sx={{ mb: 0.25 }}>
      <ListItemButton
        onClick={onToggle}
        aria-expanded={open}
        sx={{
          minHeight: 40,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.25,
          borderRadius: 1.5,
          color: alpha(sidebarText, 0.68),
          transition: theme.transitions.create(
            ["background-color", "color"],
            { duration: theme.transitions.duration.shortest }
          ),
          "&:hover": {
            bgcolor: alpha(sidebarText, 0.06),
            color: sidebarText,
          },
        }}
      >
        {showHierarchy && (
          <Box
            aria-hidden="true"
            sx={{
              width: 3,
              height: 18,
              flex: "0 0 auto",
              borderRadius: 1,
              bgcolor: accent,
              boxShadow: `0 0 0 1px ${alpha(accent, 0.14)}`,
            }}
          />
        )}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            flex: 1,
            minWidth: 0,
            color: "inherit",
            fontSize: 12.5,
            lineHeight: 1.2,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>
        <Box
          aria-hidden="true"
          sx={{
            width: 26,
            height: 26,
            flex: "0 0 26px",
            display: "grid",
            placeItems: "center",
            borderRadius: 1.5,
            bgcolor: alpha(sidebarText, open ? 0.1 : 0.06),
          }}
        >
          <KeyboardArrowDownRoundedIcon
            sx={{
              fontSize: 18,
              transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              transition: theme.transitions.create("transform", {
                duration: theme.transitions.duration.shortest,
              }),
            }}
          />
        </Box>
      </ListItemButton>
    </Box>
  );
}
