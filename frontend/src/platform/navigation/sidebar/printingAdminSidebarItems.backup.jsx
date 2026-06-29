// ============================================
// ARAB UNITY SCHOOL
// Printing Admin Sidebar Sections
// ============================================

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

export const printingAdminSidebarSections = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/printing/dashboard",
        icon: <DashboardOutlinedIcon />,
        menuKey: "Printing.Dashboard",
      },
    ],
  },
  {
    title: "Printing Management",
    items: [
      {
        label: "Print Queue",
        path: "/printing/queue",
        icon: <LocalPrintshopOutlinedIcon />,
        menuKey: "Printing.Queue",
      },
      {
        label: "Completed Jobs",
        path: "/printing/completed",
        icon: <ReceiptLongOutlinedIcon />,
        menuKey: "Printing.CompletedJobs",
      },
    ],
  },
  {
    title: "Paper Inventory",
    items: [
      {
        label: "Paper Stock",
        path: "/printing/paper-stock",
        icon: <Inventory2OutlinedIcon />,
        menuKey: "Printing.PaperInventory",
      },
      {
        label: "Inventory Logs",
        path: "/printing/inventory-transactions",
        icon: <ReceiptLongOutlinedIcon />,
        menuKey: "Printing.InventoryLogs",
      },
      {
        label: "Paper Purchases",
        path: "/printing/purchases",
        icon: <Inventory2OutlinedIcon />,
        menuKey: "Printing.PaperPurchases",
      },
      {
        label: "Paper Distribution",
        path: "/printing/distributions",
        icon: <LocalShippingOutlinedIcon />,
        menuKey: "Printing.PaperDistribution",
      },
    ],
  },
  {
    title: "Operations Modules",
    items: [
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
    ],
  },
  {
    title: "Administration",
    items: [
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
    ],
  },
];