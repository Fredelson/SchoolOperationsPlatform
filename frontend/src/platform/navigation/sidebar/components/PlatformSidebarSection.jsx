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

import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";

export default function PlatformSidebarSection({
  title,
  open = true,
  showHierarchy = false,
  onToggle,
}) {
  const theme = useTheme();

  const sidebarText = theme.palette.primary.contrastText;

  return (
    <Box sx={{ mb: 0.7 }}>
      <ListItemButton
        onClick={onToggle}
        aria-expanded={open}
        sx={{
          minHeight: 34,
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          px: 1.8,
          borderRadius: 2.2,
          color: alpha(sidebarText, 0.62),
          "&:hover": {
            bgcolor: alpha(sidebarText, 0.07),
            color: sidebarText,
          },
        }}
      >
        {showHierarchy && (
          <Box
            aria-hidden="true"
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: alpha(sidebarText, 0.42),
              boxShadow: `0 0 0 4px ${alpha(sidebarText, 0.08)}`,
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
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: 0.9,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>
        {open ? (
          <ExpandLessOutlinedIcon sx={{ fontSize: 18 }} />
        ) : (
          <ExpandMoreOutlinedIcon sx={{ fontSize: 18 }} />
        )}
      </ListItemButton>
    </Box>
  );
}
