// ============================================
// ARAB UNITY SCHOOL
// Photocopy Management System
// Teacher Sidebar Navigation
// ============================================

import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

import {
  Dashboard,
  Description,
  AddCircle,
  AttachFile,
  Assessment,
  History,
  Settings,
} from "@mui/icons-material";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

// ============================================
// Sidebar Width
// ============================================

const drawerWidth = 240;

// ============================================
// Sidebar Menu Items
// ============================================

const menuItems = [
  {
    label: "Dashboard",
    icon: <Dashboard />,
    path: "/teacher/dashboard",
  },

  {
    label: "My Requests",
    icon: <Description />,
    path: "/teacher/my-requests",
  },

  {
    label: "Create Request",
    icon: <AddCircle />,
    path: "/teacher/create-request",
  },

  {
    label: "Attachments",
    icon: <AttachFile />,
    path: "/teacher/attachments",
  },

  {
    label: "Reports",
    icon: <Assessment />,
    path: "/teacher/reports",
  },

  {
    label: "History",
    icon: <History />,
    path: "/teacher/history",
  },
];

// ============================================
// Sidebar Component
// ============================================

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",

          backgroundColor: "#0F172A",
          color: "#fff",

          borderRight: "none",

          position: "fixed",

          top: "72px",

          left: 0,

          height: "calc(100vh - 72px)",
        },
      }}
    >
      {/* Navigation Menu */}
      <List
        sx={{
          px: 2,
          pt: 3,
        }}
      >
        {menuItems.map((item) => {
          const active =
            location.pathname === item.path;

          return (
            <ListItemButton
              key={item.label}
              onClick={() =>
                navigate(item.path)
              }
              sx={{
                borderRadius: 3,
                mb: 1,

                backgroundColor: active
                  ? "#2563EB"
                  : "transparent",

                "&:hover": {
                  backgroundColor: active
                    ? "#2563EB"
                    : "#1E293B",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#fff",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: active
                    ? 700
                    : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Push Settings To Bottom */}
      <Box sx={{ flexGrow: 1 }} />

      <Divider
        sx={{
          borderColor:
            "rgba(255,255,255,0.08)",
        }}
      />

      {/* Settings */}
      <List
        sx={{
          px: 2,
          py: 2,
        }}
      >
        <ListItemButton
          sx={{
            borderRadius: 3,

            "&:hover": {
              backgroundColor: "#1E293B",
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: "#fff",
              minWidth: 40,
            }}
          >
            <Settings />
          </ListItemIcon>

          <ListItemText
            primary="Settings"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 500,
            }}
          />
        </ListItemButton>
      </List>
    </Drawer>
  );
}