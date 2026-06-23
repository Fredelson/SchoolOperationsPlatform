// ============================================
// ARAB UNITY SCHOOL
// Common Role-Based Sidebar
// Navy + AUS Green Theme
// ============================================

import {
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
  Logout,
  PendingActions,
  CheckCircle,
  KeyboardReturn,
  Cancel,
  LocalPrintshop,
  Inventory,
  AccountBalance,
} from "@mui/icons-material";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocalShipping from "@mui/icons-material/LocalShipping";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import HistoryIcon from "@mui/icons-material/History";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsIcon from "@mui/icons-material/Settings";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAVY = "#071B4D";
const NAVY_DARK = "#041338";
const GREEN = "#2E8B3C";
const GREEN_LIGHT = "#4CAF50";
const WHITE = "#FFFFFF";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const role = user?.role || user?.Role;

  const teacherMenuItems = [
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

  const hodMenuItems = [
    {
      label: "Dashboard",
      icon: <Dashboard />,
      path: "/hod/dashboard",
    },
    {
      label: "My Requests",
      icon: <Description />,
      path: "/hod/my-requests",
    },
    {
      label: "Create Request",
      icon: <AddCircle />,
      path: "/hod/create-request",
    },
        {
      label: "Attachments",
      icon: <AttachFile />,
      path: "/hod/attachments",
    },
    {
      label: "Pending Approvals",
      icon: <PendingActions />,
      path: "/hod/pending-requests",
    },
    {
      label: "Approved Requests",
      icon: <CheckCircle />,
      path: "/hod/approved-requests",
    },
    {
      label: "Returned Requests",
      icon: <KeyboardReturn />,
      path: "/hod/returned-requests",
    },
    {
      label: "Rejected Requests",
      icon: <Cancel />,
      path: "/hod/rejected-requests",
    },
    {
      label: "Reports",
      icon: <Assessment />,
      path: "/hod/reports",
    },
    {
      label: "History",
      icon: <History />,
      path: "/hod/history",
    },
  ];

  const hosMenuItems = [
    {
      label: "Dashboard",
      icon: <Dashboard />,
      path: "/hos/dashboard",
    },
    {
      label: "Subject Allocation",
      icon: <AccountBalance />,
      path: "/hos/subject-allocation",
    },
    {
      label: "Pending Requests",
      icon: <PendingActions />,
      path: "/hos/pending-requests",
    },
    {
      label: "Approved Requests",
      icon: <CheckCircle />,
      path: "/hos/approved-requests",
    },
    {
      label: "Returned Requests",
      icon: <KeyboardReturn />,
      path: "/hos/returned-requests",
    },
    {
      label: "Rejected Requests",
      icon: <Cancel />,
      path: "/hos/rejected-requests",
    },
    {
      label: "Reports",
      icon: <Assessment />,
      path: "/hos/reports",
    },
    {
      label: "History",
      icon: <History />,
      path: "/hos/history",
    },
  ];

  const printingMenuItems = [
    {
      label: "Dashboard",
      icon: <Dashboard />,
      path: "/printing/dashboard",
    },
    {
      label: "Department Limits",
      icon: <AccountBalance />,
      path: "/printing/department-limits",
    },
    {
      label: "Access Levels",
      icon: <AdminPanelSettingsIcon />,
      path: "/printing/access-levels",
    },
    {
      label: "Master Data",
      path: "/printing/master-data",
      icon: <SettingsIcon />,
    },
    {
      label: "User Management",
      icon: <ManageAccountsIcon />,
      path: "/printing/user-management",
    },
    {
      label: "Print Queue",
      icon: <LocalPrintshop />,
      path: "/printing/queue",
    },
    {
      label: "Completed Jobs",
      icon: <CheckCircle />,
      path: "/printing/completed",
    },
    {
      label: "Inventory Logs",
      path: "/printing/inventory-transactions",
      icon: <Inventory2Icon />,
    },
    {
      label: "Inventory",
      icon: <Inventory />,
      path: "/printing/inventory",
    },
    {
      label: "Paper Distribution",
      path: "/printing/distributions",
      icon: <LocalShipping />,
    },
    {
      label: "Paper Stock",
      icon: <Inventory />,
      path: "/printing/paper-stock",
    },
    {
      label: "Paper Purchases",
      icon: <Inventory />,
      path: "/printing/purchases",
    },
    {
      label: "Reports",
      icon: <Assessment />,
      path: "/printing/reports",
    },
    {
      label: "History",
      icon: <History />,
      path: "/printing/history",
    },
  ];

  const getMenuItems = () => {
    if (role === "HOD") return hodMenuItems;
    if (role === "HOS") return hosMenuItems;
    if (role === "PrintingAdmin") return printingMenuItems;
    return teacherMenuItems;
  };

  const menuItems = getMenuItems();

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const getSettingsPath = () => {
    if (role === "HOD") return "/hod/settings";
    if (role === "HOS") return "/hos/settings";
    if (role === "PrintingAdmin") return "/printing/settings";
    return "/teacher/settings";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        width: 240,
        height: "100%",
        color: WHITE,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 20%, rgba(76,175,80,0.14), transparent 35%)",
          pointerEvents: "none",
        }}
      />

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
                color: active ? WHITE : "rgba(255,255,255,0.9)",
                background: active
                  ? `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`
                  : "transparent",
                boxShadow: active
                  ? "0 8px 18px rgba(46,139,60,0.35)"
                  : "none",
                transition: "all 0.2s ease",

                "&:hover": {
                  background: active
                    ? `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`
                    : "rgba(76,175,80,0.14)",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 38,
                  color: active ? WHITE : "rgba(255,255,255,0.9)",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: active ? 900 : 700,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ mx: 2, borderColor: "rgba(255,255,255,0.16)" }} />

      <List sx={{ position: "relative", zIndex: 1, px: 1.8, py: 2 }}>
        <ListItemButton
          onClick={() => navigate(getSettingsPath())}
          sx={{
            borderRadius: 2,
            mb: 1,
            minHeight: 50,
            color: WHITE,
            transition: "all 0.2s ease",

            "&:hover": {
              background: "rgba(76,175,80,0.14)",
              transform: "translateX(4px)",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: WHITE }}>
            <Settings />
          </ListItemIcon>

          <ListItemText
            primary="Settings"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 700,
            }}
          />
        </ListItemButton>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            minHeight: 50,
            color: WHITE,
            transition: "all 0.2s ease",

            "&:hover": {
              background: "rgba(239,68,68,0.16)",
              transform: "translateX(4px)",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: WHITE }}>
            <Logout />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 700,
            }}
          />
        </ListItemButton>
      </List>

      <Box sx={{ height: 4, width: "100%", bgcolor: GREEN_LIGHT }} />
    </Box>
  );
}