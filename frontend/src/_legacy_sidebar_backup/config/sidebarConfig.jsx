// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Sidebar Configuration
// Phase 3 Super Admin UI Foundation
// ============================================
//
// Description:
// Central sidebar configuration for platform menus.
//
// Responsibilities:
// - Keep sidebar items readable
// - Avoid hardcoded menus inside Sidebar.jsx
// - Support module-based sidebar filtering
// - Support permission-based sidebar filtering
// - Support feature flag filtering
//
// Future Enhancements:
// - Load menu config from backend database
// - Super Admin controlled menu ordering
// - Role-based menu preview
//
// ============================================

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import TouchAppOutlinedIcon from "@mui/icons-material/TouchAppOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";


import { MODULES } from "./modules";

// ============================================
// Super Admin Sidebar Items
// ============================================

export const superAdminSidebarItems = [
  {
    label: "Dashboard",
    path: "/super-admin/dashboard",
    icon: <DashboardOutlinedIcon />,
    module: MODULES.SUPER_ADMIN,
  },
  {
    label: "Module Manager",
    path: "/super-admin/modules",
    icon: <AppsOutlinedIcon />,
    module: MODULES.SUPER_ADMIN,
  },
  {
    label: "Menu Manager",
    path: "/super-admin/menus",
    icon: <MenuOpenOutlinedIcon />,
    module: MODULES.SUPER_ADMIN,
  },
  {
    label: "Button Manager",
    path: "/super-admin/buttons",
    icon: <TouchAppOutlinedIcon />,
    module: MODULES.SUPER_ADMIN,
  },
  {
    label: "Widget Manager",
    path: "/super-admin/widgets",
    icon: <WidgetsOutlinedIcon />,
    module: MODULES.SUPER_ADMIN,
  },
  {
    label: "Feature Flags",
    path: "/super-admin/feature-flags",
    icon: <FlagOutlinedIcon />,
    module: MODULES.SUPER_ADMIN,
  },
  {
    label: "Roles",
    path: "/super-admin/roles",
    icon: <ShieldOutlinedIcon />,
    module: MODULES.SUPER_ADMIN,
  },
  {
    label: "Permissions",
    path: "/super-admin/permissions",
    icon: <SecurityOutlinedIcon />,
    module: MODULES.SUPER_ADMIN,
  },
  {
    label: "Audit Logs",
    path: "/super-admin/audit-logs",
    icon: <HistoryOutlinedIcon />,
    module: MODULES.SUPER_ADMIN,
  },
  {
    label: "System Settings",
    path: "/super-admin/settings",
    icon: <SettingsOutlinedIcon />,
    module: MODULES.SUPER_ADMIN,
  },
];

// ============================================
// Future Global Sidebar Items
// Later we can combine all module sidebars here
// ============================================

export const platformSidebarItems = [
  ...superAdminSidebarItems,
];

// ============================================
// Default Export
// ============================================

export default platformSidebarItems;