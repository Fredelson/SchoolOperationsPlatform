// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Super Admin Sidebar Sections
// Central navigation data for Super Admin
//
// Notes:
// - Hardcoded for now
// - Later this can come from backend permissions
// - Super Admin manages all platform + business modules
// ============================================

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import SmartButtonOutlinedIcon from "@mui/icons-material/SmartButtonOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BackupOutlinedIcon from "@mui/icons-material/BackupOutlined";
import IntegrationInstructionsOutlinedIcon from "@mui/icons-material/IntegrationInstructionsOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";

// ============================================
// Sidebar Sections
// ============================================

export const superAdminSidebarSections = [
  {
    title: "Super Admin",
    items: [
      {
        label: "Dashboard",
        path: "/super-admin/dashboard",
        icon: <DashboardOutlinedIcon />,
      },
    ],
  },

  {
    title: "Platform Administration",
    items: [
      {
        label: "Module Manager",
        path: "/super-admin/modules",
        icon: <AppsOutlinedIcon />,
      },
      {
        label: "Menu Manager",
        path: "/super-admin/menus",
        icon: <MenuOpenOutlinedIcon />,
      },
      {
        label: "Button Manager",
        path: "/super-admin/buttons",
        icon: <SmartButtonOutlinedIcon />,
      },
      {
        label: "Widget Manager",
        path: "/super-admin/widgets",
        icon: <WidgetsOutlinedIcon />,
      },
      {
        label: "Feature Flags",
        path: "/super-admin/feature-flags",
        icon: <FlagOutlinedIcon />,
      },
    ],
  },

  {
    title: "Security & Access",
    items: [
      {
        label: "User Management",
        path: "/super-admin/users",
        icon: <PeopleAltOutlinedIcon />,
      },
      {
        label: "Roles Manager",
        path: "/super-admin/roles",
        icon: <GroupsOutlinedIcon />,
      },
      {
        label: "Access Levels",
        path: "/super-admin/access-levels",
        icon: <AdminPanelSettingsOutlinedIcon />,
      },
      {
        label: "Permissions Matrix",
        path: "/super-admin/permissions",
        icon: <SecurityOutlinedIcon />,
      },
    ],
  },

  {
    title: "Operations Modules",
    items: [
      {
        label: "Printing Management",
        path: "/super-admin/printing",
        icon: <PrintOutlinedIcon />,
      },
      {
        label: "Inventory Management",
        path: "/super-admin/inventory",
        icon: <Inventory2OutlinedIcon />,
      },
      {
        label: "IT Service Desk",
        path: "/super-admin/it-tickets",
        icon: <ConfirmationNumberOutlinedIcon />,
      },
      {
        label: "IT Asset Management",
        path: "/super-admin/assets",
        icon: <DevicesOutlinedIcon />,
      },
      {
        label: "Academic Operations",
        path: "/super-admin/academic",
        icon: <SchoolOutlinedIcon />,
      },
      {
        label: "Teacher Observations",
        path: "/super-admin/observations",
        icon: <VisibilityOutlinedIcon />,
      },
      {
        label: "Communication Center",
        path: "/super-admin/communication",
        icon: <CampaignOutlinedIcon />,
      },
      {
        label: "Reports & Analytics",
        path: "/super-admin/reports",
        icon: <AnalyticsOutlinedIcon />,
      },
      {
        label: "HR Management",
        path: "/super-admin/hr",
        icon: <BadgeOutlinedIcon />,
      },
    ],
  },

  {
    title: "Monitoring",
    items: [
      {
        label: "Audit Logs",
        path: "/super-admin/audit-logs",
        icon: <HistoryOutlinedIcon />,
      },
      {
        label: "Activity Logs",
        path: "/super-admin/activity-logs",
        icon: <TimelineOutlinedIcon />,
      },
    ],
  },

  {
    title: "System Control",
    items: [
      {
        label: "System Settings",
        path: "/super-admin/settings",
        icon: <SettingsOutlinedIcon />,
      },
      {
        label: "Backup & Restore",
        path: "/super-admin/backups",
        icon: <BackupOutlinedIcon />,
      },
      {
        label: "Integrations",
        path: "/super-admin/integrations",
        icon: <IntegrationInstructionsOutlinedIcon />,
      },
      {
        label: "Database Tools",
        path: "/super-admin/database-tools",
        icon: <StorageOutlinedIcon />,
      },
    ],
  },
];
