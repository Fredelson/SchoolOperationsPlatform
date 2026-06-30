import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import BarChartIcon from "@mui/icons-material/BarChart";
import HistoryIcon from "@mui/icons-material/History";
import ApprovalIcon from "@mui/icons-material/Approval";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PrintIcon from "@mui/icons-material/Print";
import InventoryIcon from "@mui/icons-material/Inventory";
import SettingsIcon from "@mui/icons-material/Settings";

export const navigationConfig = {
  teacher: [
    { label: "Dashboard", path: "/teacher", icon: DashboardIcon },
    { label: "My Requests", path: "/teacher/my-requests", icon: DescriptionIcon },
    { label: "Create Request", path: "/teacher/create-request", icon: AddCircleIcon },
    { label: "Attachments", path: "/teacher/attachments", icon: AttachFileIcon },
    { label: "Reports", path: "/teacher/reports", icon: BarChartIcon },
    { label: "History", path: "/teacher/history", icon: HistoryIcon },
    { label: "Settings", path: "/teacher/settings", icon: SettingsIcon },
  ],

  hod: [
    { label: "Dashboard", path: "/hod/dashboard", icon: DashboardIcon },
    { label: "Pending Approvals", path: "/hod/pending-approvals", icon: ApprovalIcon },
    { label: "Department Requests", path: "/hod/department-requests", icon: DescriptionIcon },
    { label: "Approved Requests", path: "/hod/approved-requests", icon: CheckCircleIcon },
    { label: "Rejected Requests", path: "/hod/rejected-requests", icon: CancelIcon },
    { label: "Reports", path: "/hod/reports", icon: BarChartIcon },
    { label: "History", path: "/hod/history", icon: HistoryIcon },
    { label: "Settings", path: "/hod/settings", icon: SettingsIcon },
  ],

  hos: [
    { label: "Dashboard", path: "/hos/dashboard", icon: DashboardIcon },
    { label: "Final Approvals", path: "/hos/final-approvals", icon: ApprovalIcon },
    { label: "Large Requests", path: "/hos/large-requests", icon: DescriptionIcon },
    { label: "Approved Requests", path: "/hos/approved-requests", icon: CheckCircleIcon },
    { label: "Reports", path: "/hos/reports", icon: BarChartIcon },
    { label: "History", path: "/hos/history", icon: HistoryIcon },
    { label: "Settings", path: "/hos/settings", icon: SettingsIcon },
  ],

  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: DashboardIcon },
    { label: "Printing Queue", path: "/admin/printing-queue", icon: PrintIcon },
    { label: "All Requests", path: "/admin/requests", icon: DescriptionIcon },
    { label: "Inventory", path: "/admin/inventory", icon: InventoryIcon },
    { label: "Reports", path: "/admin/reports", icon: BarChartIcon },
    { label: "History", path: "/admin/history", icon: HistoryIcon },
    { label: "Settings", path: "/admin/settings", icon: SettingsIcon },
  ],
};
