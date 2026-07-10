import { createElement } from "react";

import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";

const percent = (value, total) =>
  total > 0 ? `${((Number(value || 0) / total) * 100).toFixed(1)}% of assets` : "No assets recorded";

export const buildItAssetDashboardCards = (kpis = {}) => [
  {
    title: "Total Assets",
    value: kpis.totalAssets || 0,
    helperText: "100% of registered assets",
    icon: createElement(DevicesOutlinedIcon),
    color: "primary.main",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Active Assets",
    value: kpis.activeAssets || 0,
    helperText: percent(kpis.activeAssets, kpis.totalAssets),
    icon: createElement(CheckCircleOutlineOutlinedIcon),
    color: "success.main",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Assigned Assets",
    value: kpis.assignedAssets || kpis.assigned || 0,
    helperText: percent(kpis.assignedAssets, kpis.totalAssets),
    icon: createElement(AssignmentIndOutlinedIcon),
    color: "secondary.main",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Unassigned Assets",
    value: kpis.unassignedAssets || 0,
    helperText: percent(kpis.unassignedAssets, kpis.totalAssets),
    icon: createElement(PersonOffOutlinedIcon),
    color: "warning.main",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Under Maintenance",
    value: kpis.underMaintenanceAssets || 0,
    helperText: percent(kpis.underMaintenanceAssets, kpis.totalAssets),
    icon: createElement(BuildOutlinedIcon),
    color: "info.main",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Pending Transfers",
    value: kpis.pendingTransfers || 0,
    helperText: "Waiting for completion",
    icon: createElement(SwapHorizOutlinedIcon),
    color: "info.main",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Pending Disposals",
    value: kpis.pendingDisposals || 0,
    helperText: "Waiting for completion",
    icon: createElement(DeleteOutlineOutlinedIcon),
    color: "error.main",
    md: 3, lg: 3, xl: 1.5,
  },
  {
    title: "Items Needing Purchase",
    value: kpis.itemsNeedingPurchase || 0,
    helperText: "Recorded procurement shortage",
    icon: createElement(ShoppingCartOutlinedIcon),
    color: "error.main",
    md: 3, lg: 3, xl: 1.5,
  },
];
