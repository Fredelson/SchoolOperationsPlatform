// ============================================
// ARAB UNITY SCHOOL
// Super Admin Dashboard Data
//
// Purpose:
// Temporary dashboard data until backend APIs
// are connected.
//
// Future Backend:
// - GET /api/superadmin/dashboard/kpis
// - GET /api/superadmin/dashboard/activity
// - GET /api/superadmin/dashboard/system-health
// - GET /api/superadmin/dashboard/recent-activities
// - GET /api/superadmin/dashboard/pending-approvals
// - GET /api/superadmin/modules
// ============================================

import { dashboardColors } from "../../../theme/dashboardColors";

// KPI Icons
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";

// Module Icons
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";

// ============================================
// KPI CARDS
// ============================================

export const dashboardStats = [
  {
    title: "Total Users",
    value: "152",
    change: "+12",
    changeLabel: "vs last 30 days",
    icon: PeopleAltOutlinedIcon,
    color: dashboardColors.users,
  },
  {
    title: "Active Modules",
    value: "24",
    change: "100%",
    changeLabel: "Enabled",
    icon: AppsOutlinedIcon,
    color: dashboardColors.modules,
  },
  {
    title: "Open Tickets",
    value: "18",
    change: "-4",
    changeLabel: "vs last 7 days",
    icon: ConfirmationNumberOutlinedIcon,
    color: dashboardColors.tickets,
  },
  {
    title: "Print Requests",
    value: "27",
    change: "+5",
    changeLabel: "vs last 7 days",
    icon: PrintOutlinedIcon,
    color: dashboardColors.printing,
  },
  {
    title: "Total Assets",
    value: "248",
    change: "+9",
    changeLabel: "vs last 30 days",
    icon: ComputerOutlinedIcon,
    color: dashboardColors.assets,
  },
  {
    title: "Unread Messages",
    value: "17",
    change: "",
    changeLabel: "This week",
    icon: MailOutlineOutlinedIcon,
    color: dashboardColors.messages,
  },
];

// ============================================
// PLATFORM ACTIVITY CHART
// ============================================

export const platformActivityData = [
  { month: "May 1", printRequests: 55, tickets: 20 },
  { month: "May 5", printRequests: 82, tickets: 38 },
  { month: "May 9", printRequests: 63, tickets: 28 },
  { month: "May 13", printRequests: 75, tickets: 40 },
  { month: "May 17", printRequests: 72, tickets: 30 },
  { month: "May 21", printRequests: 78, tickets: 42 },
  { month: "May 25", printRequests: 95, tickets: 45 },
  { month: "May 29", printRequests: 103, tickets: 52 },
];

// ============================================
// MODULE STATUS
// ============================================

export const moduleStatus = [
  { key: "active", label: "Active", value: 16 },
  { key: "inProgress", label: "In Progress", value: 5 },
  { key: "comingSoon", label: "Coming Soon", value: 3 },
  { key: "disabled", label: "Disabled", value: 0 },
];

// ============================================
// SYSTEM HEALTH
// ============================================

export const systemHealth = [
  { label: "Database", status: "Healthy", value: 98 },
  { label: "Server", status: "Healthy", value: 97 },
  { label: "Storage", status: "63%", value: 63 },
  { label: "Email Service", status: "Connected", value: 100 },
  { label: "Notification Service", status: "Active", value: 95 },
  { label: "Backup", status: "Up to date", value: 100 },
];

// ============================================
// RECENT ACTIVITIES
// ============================================

export const recentActivities = [
  {
    title: "User role permissions updated",
    description: "Super Admin",
    time: "10:45 AM",
  },
  {
    title: "New print request submitted",
    description: "Teacher Mary",
    time: "10:30 AM",
  },
  {
    title: "IT Ticket #ITK-2025-00018 assigned",
    description: "IT Admin",
    time: "10:15 AM",
  },
  {
    title: "Asset LAP-045 status updated",
    description: "IT Admin",
    time: "09:50 AM",
  },
  {
    title: "New user account created",
    description: "Super Admin",
    time: "09:30 AM",
  },
];

// ============================================
// PENDING APPROVALS
// ============================================

export const pendingApprovals = [
  {
    title: "5 Print Requests",
    requester: "Awaiting HOD Approval",
    status: "Pending",
  },
  {
    title: "3 IT Tickets",
    requester: "Awaiting Assignment",
    status: "Pending",
  },
  {
    title: "2 Observation Forms",
    requester: "Awaiting HOS Approval",
    status: "Pending",
  },
  {
    title: "1 End-of-Term Campaign",
    requester: "Awaiting Approval",
    status: "Pending",
  },
];

// ============================================
// MODULE OVERVIEW
// ============================================

export const modulesOverview = [
  {
    title: "Printing Management",
    description: "27 Active Requests",
    icon: PrintOutlinedIcon,
    enabled: true,
    color: dashboardColors.printing,
    lightColor: dashboardColors.printingLight,
  },
  {
    title: "Inventory Management",
    description: "248 Total Items",
    icon: Inventory2OutlinedIcon,
    enabled: true,
    color: dashboardColors.inventory,
    lightColor: dashboardColors.inventoryLight,
  },
  {
    title: "IT Service Desk",
    description: "18 Open Tickets",
    icon: ConfirmationNumberOutlinedIcon,
    enabled: true,
    color: dashboardColors.tickets,
    lightColor: dashboardColors.ticketsLight,
  },
  {
    title: "IT Asset Management",
    description: "248 Total Assets",
    icon: ComputerOutlinedIcon,
    enabled: true,
    color: dashboardColors.assets,
    lightColor: dashboardColors.assetsLight,
  },
  {
    title: "Academic Operations",
    description: "1,245 Students",
    icon: SchoolOutlinedIcon,
    enabled: true,
    color: dashboardColors.academics,
    lightColor: dashboardColors.academicsLight,
  },
  {
    title: "Teacher Observations",
    description: "34 Observations",
    icon: VisibilityOutlinedIcon,
    enabled: true,
    color: dashboardColors.observations,
    lightColor: dashboardColors.observationsLight,
  },
  {
    title: "End-of-Term Campaigns",
    description: "5 Active Campaigns",
    icon: CampaignOutlinedIcon,
    enabled: true,
    color: dashboardColors.campaigns,
    lightColor: dashboardColors.campaignsLight,
  },
  {
    title: "Communication Center",
    description: "17 Unread Messages",
    icon: MailOutlineOutlinedIcon,
    enabled: true,
    color: dashboardColors.communication,
    lightColor: dashboardColors.communicationLight,
  },
  {
    title: "Reports & Analytics",
    description: "54 Reports",
    icon: BarChartOutlinedIcon,
    enabled: true,
    color: dashboardColors.reports,
    lightColor: dashboardColors.reportsLight,
  },
  {
    title: "HR Management",
    description: "86 Staff Members",
    icon: GroupsOutlinedIcon,
    enabled: true,
    color: dashboardColors.hr,
    lightColor: dashboardColors.hrLight,
  },
];

// ============================================
// SYSTEM ALERTS
// ============================================

export const systemAlerts = [
  {
    title: "Backup completed successfully",
    severity: "success",
    time: "Today • 02:00 AM",
  },
  {
    title: "3 users awaiting activation",
    severity: "warning",
    time: "Today • 09:15 AM",
  },
  {
    title: "Email queue delay detected",
    severity: "danger",
    time: "Today • 10:05 AM",
  },
  {
    title: "Workflow engine running normally",
    severity: "info",
    time: "Today • 10:30 AM",
  },
];

// ============================================
// TOP PRINT REQUESTS
// ============================================

export const topPrintRequests = [
  {
    label: "Student Worksheets",
    value: 45,
    color: dashboardColors.success,
  },
  {
    label: "Exams",
    value: 38,
    color: dashboardColors.modules,
  },
  {
    label: "Presentations",
    value: 27,
    color: dashboardColors.assets,
  },
  {
    label: "Assignments",
    value: 19,
    color: dashboardColors.info,
  },
  {
    label: "Others",
    value: 12,
    color: dashboardColors.navy,
  },
];

// ============================================
// TICKETS BY STATUS
// ============================================

export const ticketStatus = [
  { key: "active", label: "Open", value: 8 },
  { key: "inProgress", label: "In Progress", value: 6 },
  { key: "comingSoon", label: "Pending", value: 3 },
  { key: "disabled", label: "Closed", value: 1 },
];

// ============================================
// ASSET SUMMARY
// ============================================

export const assetSummary = [
  { key: "active", label: "In Use", value: 156 },
  { key: "inProgress", label: "Available", value: 52 },
  { key: "comingSoon", label: "Maintenance", value: 28 },
  { key: "disabled", label: "Retired", value: 12 },
];

// ============================================
// QUICK ACTIONS
// ============================================

export const quickActions = [
  "Create User",
  "Create Role",
  "Create Module",
  "Add Permission",
  "View Audit Logs",
  "Backup System",
];
