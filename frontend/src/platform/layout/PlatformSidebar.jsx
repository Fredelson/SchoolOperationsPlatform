// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Platform Sidebar
// ============================================
//
// Purpose:
// Shared sidebar for platform role layouts.
// Uses dynamic theme colors and gradients.
// ============================================

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getSidebarItemsByRole } from "../navigation/sidebar/getSidebarItemsByRole";

// ============================================
// Component
// ============================================

export default function PlatformSidebar({ width = 340, topOffset = 78 }) {
  const theme = useTheme();
  const { user } = useAuth();

  const role = user?.role || user?.Role;
  const sidebarSections = getSidebarItemsByRole(role);

  // ============================================
  // Theme Values
  // ============================================

  const platform = theme.palette.platform || {};

  const sidebarBg =
  platform.sidebarBackground || platform.sidebar || theme.palette.primary.dark;

  const sidebarText = theme.palette.primary.contrastText;
  const accent = platform.accent || theme.palette.success.main;

  // ============================================
  // UI
  // ============================================

  return (
    <Box
      sx={{
        width,
        height: `calc(100vh - ${topOffset}px)`,
        position: "fixed",
        left: 0,
        top: `${topOffset}px`,
        background: sidebarBg,
        color: sidebarText,
        borderRight: `1px solid ${alpha(sidebarText, 0.08)}`,
        overflowY: "auto",
        overflowX: "hidden",
        zIndex: 1200,
      }}
    >
      <Box sx={{ px: 2.5, pt: 2, pb: 2 }}>
        {sidebarSections.map((section) => (
          <Box key={section.title} sx={{ mb: 2.4 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                px: 2,
                mb: 0.9,
                color: alpha(sidebarText, 0.42),
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 0.9,
              }}
            >
              {section.title}
            </Typography>

            <List disablePadding>
              {section.items.map((item) => (
                <ListItemButton
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  sx={{
                    minHeight: 46,
                    borderRadius: 2.8,
                    mb: 0.45,
                    px: 2,
                    color: alpha(sidebarText, 0.78),
                    transition: theme.transitions.create(
                      ["background-color", "color", "box-shadow"],
                      { duration: theme.transitions.duration.short }
                    ),

                    "&:hover": {
                      bgcolor: alpha(sidebarText, 0.08),
                      color: sidebarText,
                    },

                    "&.active": {
                      bgcolor: accent,
                      color: sidebarText,
                      boxShadow: `0 10px 24px ${alpha(accent, 0.25)}`,

                      "& .MuiListItemIcon-root": {
                        color: sidebarText,
                      },

                      "&:hover": {
                        bgcolor: accent,
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "inherit",
                      minWidth: 44,

                      "& svg": {
                        fontSize: 21,
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: 14.5,
                          fontWeight: 750,
                          whiteSpace: "nowrap",
                        },
                      },
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
}