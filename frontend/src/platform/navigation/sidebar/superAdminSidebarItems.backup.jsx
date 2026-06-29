// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Super Admin Sidebar Menu
// ============================================
//
// Purpose:
// Defines the Super Admin navigation structure.
// This file controls menu content only.
// Sidebar design, layout, theme, and styling are handled
// by PlatformSidebar.jsx.
//
// Notes:
// - backendReady means the backend already exists.
// - comingSoon means visible but not released yet.
// - children are rendered as dropdown items.
// ============================================

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import DeveloperBoardOutlinedIcon from "@mui/icons-material/DeveloperBoardOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";

export const superAdminSidebarSections = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        path: "/super-admin/dashboard",
        icon: <DashboardOutlinedIcon />,
        backendReady: true,
      },
    ],
  },

  {
    title: "Organization",
    items: [
      {
        label: "Organization Profile",
        path: "/super-admin/organization/profile",
        icon: <BusinessOutlinedIcon />,
        backendReady: true,
      },
      {
        label: "Branding & Theme",
        path: "/super-admin/branding",
        icon: <PaletteOutlinedIcon />,
        backendReady: true,
      },
    ],
  },

  {
    title: "Identity & Access",
    items: [
      {
        label: "Users",
        path: "/super-admin/users",
        icon: <PeopleAltOutlinedIcon />,
        backendReady: true,
      },
      {
        label: "Roles",
        path: "/super-admin/roles",
        icon: <ShieldOutlinedIcon />,
        backendReady: true,
      },
      {
        label: "Access Levels",
        path: "/super-admin/access-levels",
        icon: <AdminPanelSettingsOutlinedIcon />,
        backendReady: true,
      },
      {
        label: "Assignment Types",
        path: "/super-admin/assignment-types",
        icon: <AssignmentIndOutlinedIcon />,
        backendReady: true,
      },
      {
        label: "User Assignments",
        path: "/super-admin/user-assignments",
        icon: <HubOutlinedIcon />,
        backendReady: true,
      },
    ],
  },

  {
    title: "Operations",
    items: [
      {
        label: "Printing",
        path: "/super-admin/printing",
        icon: <LocalPrintshopOutlinedIcon />,
        comingSoon: true,
      },

      {
        label: "IT Asset Management",
        path: "/super-admin/it-assets",
        icon: <ComputerOutlinedIcon />,
        children: [
          {
            label: "Dashboard",
            path: "/super-admin/it-assets/dashboard",
            icon: <DashboardOutlinedIcon />,
          },
          {
            label: "Asset Management",
            path: "/super-admin/it-assets/assets",
            icon: <DevicesOutlinedIcon />,
            children: [
              { label: "All Assets", path: "/super-admin/it-assets/assets/all" },
              { label: "Computers", path: "/super-admin/it-assets/assets/computers" },
              { label: "Printers & Copiers", path: "/super-admin/it-assets/assets/printers-copiers" },
              { label: "Projectors", path: "/super-admin/it-assets/assets/projectors" },
              { label: "Network Devices", path: "/super-admin/it-assets/assets/network-devices" },
              { label: "CCTV Cameras", path: "/super-admin/it-assets/assets/cctv-cameras" },
              { label: "IP Phones", path: "/super-admin/it-assets/assets/ip-phones" },
              { label: "LED Screens", path: "/super-admin/it-assets/assets/led-screens" },
              { label: "Tablets", path: "/super-admin/it-assets/assets/tablets" },
              { label: "Classroom Audio", path: "/super-admin/it-assets/assets/classroom-audio" },
            ],
          },
          {
            label: "Asset Assignment",
            path: "/super-admin/it-assets/assignments",
            icon: <AssignmentTurnedInOutlinedIcon />,
            children: [
              { label: "Current Assignments", path: "/super-admin/it-assets/assignments/current" },
              { label: "Transfer Requests", path: "/super-admin/it-assets/assignments/transfers" },
              { label: "Needed Laptops", path: "/super-admin/it-assets/assignments/needed-laptops" },
              { label: "Assignment History", path: "/super-admin/it-assets/assignments/history" },
            ],
          },
          {
            label: "Asset Maintenance",
            path: "/super-admin/it-assets/maintenance",
            icon: <BuildOutlinedIcon />,
            children: [
              { label: "Issues", path: "/super-admin/it-assets/maintenance/issues" },
              { label: "Maintenance Logs", path: "/super-admin/it-assets/maintenance/logs" },
              { label: "Maintenance Schedule", path: "/super-admin/it-assets/maintenance/schedule" },
              { label: "Disposal", path: "/super-admin/it-assets/maintenance/disposal" },
            ],
          },
          {
            label: "Import Assets",
            path: "/super-admin/it-assets/import",
            icon: <UploadFileOutlinedIcon />,
          },
          {
            label: "Asset Groups",
            path: "/super-admin/it-assets/groups",
            icon: <GroupsOutlinedIcon />,
          },
          {
            label: "Master Data",
            path: "/super-admin/it-assets/master-data",
            icon: <CategoryOutlinedIcon />,
            children: [
              { label: "Categories", path: "/super-admin/it-assets/master-data/categories" },
              { label: "Brands", path: "/super-admin/it-assets/master-data/brands" },
              { label: "Models", path: "/super-admin/it-assets/master-data/models" },
              { label: "Statuses", path: "/super-admin/it-assets/master-data/statuses" },
              { label: "Conditions", path: "/super-admin/it-assets/master-data/conditions" },
              { label: "Issue Categories", path: "/super-admin/it-assets/master-data/issue-categories" },
              { label: "Issue Types", path: "/super-admin/it-assets/master-data/issue-types" },
            ],
          },
          {
            label: "Reports",
            path: "/super-admin/it-assets/reports",
            icon: <BarChartOutlinedIcon />,
            children: [
              { label: "Inventory", path: "/super-admin/it-assets/reports/inventory" },
              { label: "Assignment", path: "/super-admin/it-assets/reports/assignment" },
              { label: "Maintenance", path: "/super-admin/it-assets/reports/maintenance" },
              { label: "Issues", path: "/super-admin/it-assets/reports/issues" },
              { label: "Disposal", path: "/super-admin/it-assets/reports/disposal" },
            ],
          },
        ],
      },

      {
        label: "IT Help Desk",
        path: "/super-admin/helpdesk",
        icon: <ConfirmationNumberOutlinedIcon />,
        comingSoon: true,
      },
      {
        label: "Inventory",
        path: "/super-admin/inventory",
        icon: <Inventory2OutlinedIcon />,
        comingSoon: true,
      },
      {
        label: "HR",
        path: "/super-admin/hr",
        icon: <PeopleAltOutlinedIcon />,
        comingSoon: true,
      },
      {
        label: "Academic Operations",
        path: "/super-admin/academic",
        icon: <SchoolOutlinedIcon />,
        comingSoon: true,
      },
      {
        label: "Communication",
        path: "/super-admin/communication",
        icon: <CampaignOutlinedIcon />,
        comingSoon: true,
      },
    ],
  },

  {
    title: "System Configuration",
    items: [
      {
        label: "Departments",
        path: "/super-admin/settings/departments",
        icon: <SettingsOutlinedIcon />,
        backendReady: true,
      },
      {
        label: "Sections",
        path: "/super-admin/settings/sections",
        icon: <SettingsOutlinedIcon />,
        backendReady: true,
      },
      {
        label: "Subjects",
        path: "/super-admin/settings/subjects",
        icon: <SettingsOutlinedIcon />,
        backendReady: true,
      },
      {
        label: "Purposes",
        path: "/super-admin/settings/purposes",
        icon: <SettingsOutlinedIcon />,
        backendReady: true,
      },
    ],
  },

  {
    title: "Security",
    items: [
      {
        label: "Audit Logs",
        path: "/super-admin/security/audit-logs",
        icon: <SecurityOutlinedIcon />,
        comingSoon: true,
      },
    ],
  },

  {
    title: "Reports & Analytics",
    items: [
      {
        label: "Platform Reports",
        path: "/super-admin/reports",
        icon: <BarChartOutlinedIcon />,
        comingSoon: true,
      },
    ],
  },

  {
    title: "Developer / Platform",
    items: [
      {
        label: "Module Manager",
        path: "/super-admin/platform/modules",
        icon: <DeveloperBoardOutlinedIcon />,
        comingSoon: true,
      },
      {
        label: "System Health",
        path: "/super-admin/platform/system-health",
        icon: <ManageSearchOutlinedIcon />,
        comingSoon: true,
      },
    ],
  },
];