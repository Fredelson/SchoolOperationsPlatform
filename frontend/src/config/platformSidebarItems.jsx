// ============================================
// ARAB UNITY SCHOOL
// Platform Sidebar Items
//
// Purpose:
// Central sidebar menu configuration for all roles.
//
// Why:
// Keeps menu items outside Sidebar.jsx so later
// Super Admin Menu Manager can control visibility,
// order, labels, and access.
//
// Future:
// These items can later come from the database.
// ============================================

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

// ============================================
// Super Admin Sidebar
// Full platform control
// ============================================

export const superAdminSidebarItems = [
  {
    label: "Dashboard",
    path: "/super-admin/dashboard",
    icon: <DashboardOutlinedIcon />,
    menuKey: "SuperAdmin.Dashboard",
  },
  {
    label: "Module Manager",
    path: "/super-admin/modules",
    icon: <SettingsOutlinedIcon />,
    menuKey: "SuperAdmin.ModuleManager",
  },
  {
    label: "Menu Manager",
    path: "/super-admin/menus",
    icon: <SettingsOutlinedIcon />,
    menuKey: "SuperAdmin.MenuManager",
  },
  {
    label: "Button Manager",
    path: "/super-admin/buttons",
    icon: <SettingsOutlinedIcon />,
    menuKey: "SuperAdmin.ButtonManager",
  },
  {
    label: "Widget Manager",
    path: "/super-admin/widgets",
    icon: <SettingsOutlinedIcon />,
    menuKey: "SuperAdmin.WidgetManager",
  },
  {
    label: "Feature Flags",
    path: "/super-admin/feature-flags",
    icon: <SettingsOutlinedIcon />,
    menuKey: "SuperAdmin.FeatureFlags",
  },
  {
    label: "Roles",
    path: "/super-admin/roles",
    icon: <AdminPanelSettingsOutlinedIcon />,
    menuKey: "SuperAdmin.Roles",
  },
  {
    label: "Permissions",
    path: "/super-admin/permissions",
    icon: <AdminPanelSettingsOutlinedIcon />,
    menuKey: "SuperAdmin.Permissions",
  },
];

// ============================================
// Printing Admin / Platform Admin Sidebar
//
// Important:
// Printing Admin has broad operational access,
// but cannot modify protected Super Admin controls.
// ============================================

export const printingAdminSidebarItems = [
  {
    label: "Dashboard",
    path: "/printing/dashboard",
    icon: <DashboardOutlinedIcon />,
    menuKey: "Printing.Dashboard",
  },
  {
    label: "Printing Management",
    path: "/printing/dashboard",
    icon: <LocalPrintshopOutlinedIcon />,
    menuKey: "Printing.Management",
  },
  {
    label: "Print Queue",
    path: "/printing/queue",
    icon: <LocalPrintshopOutlinedIcon />,
    menuKey: "Printing.Queue",
  },
  {
    label: "Paper Inventory",
    path: "/printing/paper-stock",
    icon: <Inventory2OutlinedIcon />,
    menuKey: "Printing.Inventory",
  },
  {
    label: "Inventory Logs",
    path: "/printing/inventory-transactions",
    icon: <Inventory2OutlinedIcon />,
    menuKey: "Printing.InventoryLogs",
  },
  {
    label: "Paper Purchases",
    path: "/printing/purchases",
    icon: <Inventory2OutlinedIcon />,
    menuKey: "Printing.Purchases",
  },
  {
    label: "Paper Distribution",
    path: "/printing/distributions",
    icon: <Inventory2OutlinedIcon />,
    menuKey: "Printing.Distributions",
  },
  {
    label: "IT Service Desk",
    path: "/printing/tickets",
    icon: <ConfirmationNumberOutlinedIcon />,
    menuKey: "Tickets.Management",
  },
  {
    label: "IT Asset Management",
    path: "/printing/assets",
    icon: <ComputerOutlinedIcon />,
    menuKey: "Assets.Management",
  },
  {
    label: "Academic Operations",
    path: "/printing/academic",
    icon: <SchoolOutlinedIcon />,
    menuKey: "Academic.Management",
  },
  {
    label: "Teacher Observations",
    path: "/printing/observations",
    icon: <VisibilityOutlinedIcon />,
    menuKey: "Observations.Management",
  },
  {
    label: "Communication Center",
    path: "/printing/communication",
    icon: <CampaignOutlinedIcon />,
    menuKey: "Communication.Management",
  },
  {
    label: "Reports & Analytics",
    path: "/printing/reports",
    icon: <BarChartOutlinedIcon />,
    menuKey: "Reports.Management",
  },
  {
    label: "User Management",
    path: "/printing/user-management",
    icon: <PeopleAltOutlinedIcon />,
    menuKey: "Users.Management",
  },
  {
    label: "Master Data",
    path: "/printing/master-data",
    icon: <SettingsOutlinedIcon />,
    menuKey: "MasterData.Management",
  },
  {
    label: "Access Levels",
    path: "/printing/access-levels",
    icon: <AdminPanelSettingsOutlinedIcon />,
    menuKey: "AccessLevels.Management",
  },
];

// ============================================
// Helper Function
// ============================================

export function getSidebarItemsByRole(role) {
  if (role === "SuperAdmin") return superAdminSidebarItems;
  if (role === "PrintingAdmin") return printingAdminSidebarItems;

  return [];
}
