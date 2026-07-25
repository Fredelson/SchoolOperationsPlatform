import { createElement } from "react";

import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

import { dashboardColors } from "../../../theme/dashboardColors";

const percent = (value, total) =>
  total > 0 ? `${((Number(value || 0) / total) * 100).toFixed(1)}% of assets` : "No assets recorded";

const maintenanceAssetCount = (kpis = {}) =>
  Number(kpis.underMaintenanceAssets || 0) +
  Number(kpis.underRepairAssets || 0);

export const buildItAssetDashboardCards = (kpis = {}) => [
  {
    title: "Total Assets",
    value: kpis.totalAssets || 0,
    helperText: "100% of registered assets",
    icon: createElement(DevicesOutlinedIcon),
    color: "primary.main",
    path: "/it-assets/assets",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Active Assets",
    value: kpis.activeAssets || 0,
    helperText: percent(kpis.activeAssets, kpis.totalAssets),
    icon: createElement(CheckCircleOutlineOutlinedIcon),
    color: "success.main",
    path: "/it-assets/assets",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Assigned Assets",
    value: kpis.assignedAssets || kpis.assigned || 0,
    helperText: percent(kpis.assignedAssets, kpis.totalAssets),
    icon: createElement(AssignmentIndOutlinedIcon),
    color: "secondary.main",
    path: "/it-assets/assets",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Available / Unassigned",
    value: kpis.availableAssets || 0,
    helperText: percent(kpis.availableAssets, kpis.totalAssets),
    icon: createElement(PersonOffOutlinedIcon),
    color: "warning.main",
    path: "/it-assets/assets",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Under Maintenance",
    value: kpis.underMaintenanceAssets || 0,
    helperText: percent(kpis.underMaintenanceAssets, kpis.totalAssets),
    icon: createElement(BuildOutlinedIcon),
    color: "info.main",
    path: "/it-assets/assets",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Disposed Items",
    value: kpis.disposedAssets || 0,
    helperText: percent(kpis.disposedAssets, kpis.totalAssets),
    icon: createElement(DeleteOutlineOutlinedIcon),
    color: "error.main",
    path: "/it-assets/disposals",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Pending Disposals",
    value: kpis.pendingDisposals || 0,
    helperText: "Waiting for completion",
    icon: createElement(DeleteOutlineOutlinedIcon),
    color: "error.main",
    path: "/it-assets/disposals",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Under Repair",
    value: kpis.underRepairAssets || 0,
    helperText: percent(kpis.underRepairAssets, kpis.totalAssets),
    icon: createElement(BuildOutlinedIcon),
    color: "warning.main",
    path: "/it-assets/assets",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Parts To Order",
    value: kpis.partsToOrder || 0,
    helperText: "Replacement units required",
    icon: createElement(ShoppingCartOutlinedIcon),
    color: "error.main",
    path: "/it-assets/assets",
    md: 3, lg: 3, xl: 1.5,
  },
];

export const buildItAssetDashboardStats = (kpis = {}) => [
  {
    title: "Total Assets",
    value: Number(kpis.totalAssets || 0).toLocaleString(),
    subtitle: "registered assets",
    icon: DevicesOutlinedIcon,
    color: dashboardColors.assets,
    path: "/it-assets/assets",
  },
  {
    title: "Assigned",
    value: Number(kpis.assignedAssets || kpis.assigned || 0).toLocaleString(),
    subtitle: percent(kpis.assignedAssets, kpis.totalAssets),
    icon: AssignmentIndOutlinedIcon,
    color: dashboardColors.info,
    path: "/it-assets/assignments",
  },
  {
    title: "Available",
    value: Number(kpis.availableAssets || 0).toLocaleString(),
    subtitle: "ready for assignment",
    icon: CheckCircleOutlineOutlinedIcon,
    color: dashboardColors.success,
    path: "/it-assets/assets",
  },
  {
    title: "Maintenance",
    value: maintenanceAssetCount(kpis).toLocaleString(),
    subtitle: "under maintenance / repair",
    icon: BuildOutlinedIcon,
    color: dashboardColors.warning,
    path: "/it-assets/maintenance",
  },
  {
    title: "Open Issues",
    value: Number(kpis.openIssues || kpis.itemsRequiringAttention || 0).toLocaleString(),
    subtitle: "requiring attention",
    icon: WarningAmberOutlinedIcon,
    color: dashboardColors.danger,
    path: "/it-assets/issues",
  },
  {
    title: "Disposed Items",
    value: Number(kpis.disposedAssets || 0).toLocaleString(),
    subtitle: percent(kpis.disposedAssets, kpis.totalAssets),
    icon: DeleteOutlineOutlinedIcon,
    color: dashboardColors.danger,
    path: "/it-assets/disposals",
  },
];
