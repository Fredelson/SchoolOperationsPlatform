// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Shared Role-Based Sidebar
// ============================================
//
// Purpose:
// Displays role-based navigation using the
// platform theme and dynamic branding colors.
// ============================================

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";

import { Settings, Logout } from "@mui/icons-material";

import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getSidebarItemsByRole } from "../../platform/navigation/sidebar/getSidebarItemsByRole";

// ============================================
// Layout Constants
// ============================================

const SIDEBAR_WIDTH = 240;

// ============================================
// Component
// ============================================

export default function Sidebar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const role = user?.role || user?.Role;
  const menuItems = getSidebarItemsByRole(role);

  // ============================================
  // Theme Values
  // ============================================

  const sidebarColor =
    theme.palette.platform?.sidebar || theme.palette.primary.dark;

  const sidebarText = theme.palette.primary.contrastText;

  const accent =
    theme.palette.platform?.accent || theme.palette.success.main;

  const activeBg = `linear-gradient(
    135deg,
    ${accent},
    ${theme.palette.primary.main}
  )`;

  // ============================================
  // Helpers
  // ============================================

  const isActiveRoute = (path) => location.pathname === path;

  const getSettingsPath = () => {
    if (role === "SuperAdmin") return "/super-admin/settings";
    if (role === "PrintingAdmin") return "/printing/settings";
    if (role === "HOD") return "/hod/settings";
    if (role === "HOS") return "/hos/settings";
    if (role === "Admin") return "/admin/settings";

    return "/teacher/settings";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ============================================
  // UI
  // ============================================

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        color: sidebarText,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        bgcolor: sidebarColor,
        borderRight: `1px solid ${alpha(sidebarText, 0.08)}`,
      }}
    >
      {/* Background Accent */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(
            circle at 20% 20%,
            ${alpha(accent, 0.14)},
            transparent 35%
          )`,
          pointerEvents: "none",
        }}
      />

      {/* Main Navigation */}
      <List
        sx={{
          position: "relative",
          zIndex: 1,
          px: 1.8,
          pt: 4,
        }}
      >
        {menuItems.map((item) => {
          const active = isActiveRoute(item.path);

          return (
            <ListItemButton
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 1.1,
                minHeight: 50,
                px: 1.8,
                color: active ? sidebarText : alpha(sidebarText, 0.9),
                background: active ? activeBg : "transparent",
                boxShadow: active
                  ? `0 8px 18px ${alpha(accent, 0.35)}`
                  : "none",
                transition: theme.transitions.create(
                  ["background", "transform", "box-shadow"],
                  {
                    duration: theme.transitions.duration.short,
                  }
                ),

                "&:hover": {
                  background: active ? activeBg : alpha(accent, 0.14),
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 38,
                  color: active ? sidebarText : alpha(sidebarText, 0.9),
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: active ? 900 : 700,
                  noWrap: true,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider
        sx={{
          mx: 2,
          borderColor: alpha(sidebarText, 0.16),
        }}
      />

      {/* Bottom Actions */}
      <List
        sx={{
          position: "relative",
          zIndex: 1,
          px: 1.8,
          py: 2,
        }}
      >
        <ListItemButton
          onClick={() => navigate(getSettingsPath())}
          sx={{
            borderRadius: 2,
            mb: 1,
            minHeight: 50,
            color: sidebarText,
            transition: theme.transitions.create(["background", "transform"], {
              duration: theme.transitions.duration.short,
            }),

            "&:hover": {
              background: alpha(accent, 0.14),
              transform: "translateX(4px)",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 38,
              color: sidebarText,
            }}
          >
            <Settings />
          </ListItemIcon>

          <ListItemText
            primary="Settings"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 700,
              noWrap: true,
            }}
          />
        </ListItemButton>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            minHeight: 50,
            color: sidebarText,
            transition: theme.transitions.create(["background", "transform"], {
              duration: theme.transitions.duration.short,
            }),

            "&:hover": {
              background: alpha(theme.palette.error.main, 0.16),
              transform: "translateX(4px)",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 38,
              color: sidebarText,
            }}
          >
            <Logout />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 700,
              noWrap: true,
            }}
          />
        </ListItemButton>
      </List>

      {/* Bottom Accent Bar */}
      <Box
        sx={{
          height: 4,
          width: "100%",
          bgcolor: accent,
        }}
      />
    </Box>
  );
}
