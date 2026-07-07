// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// IT Asset Action Menu
// ============================================

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import LaptopChromebookOutlinedIcon from "@mui/icons-material/LaptopChromebookOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { AppActionMenu } from "../../../platform/ui";

export default function AssetActionMenu({
  asset,
  onView,
  onEdit,
  onAssign,
  onBorrow,
  onTransfer,
  onMaintenance,
  onDispose,
}) {
  return (
    <AppActionMenu
      items={[
        {
          label: "View Details",
          icon: <VisibilityOutlinedIcon fontSize="small" />,
          onClick: () => onView?.(asset),
        },
        {
          label: "Edit Asset",
          icon: <EditOutlinedIcon fontSize="small" />,
          onClick: () => onEdit?.(asset),
        },
        {
          label: "Assign",
          icon: <AssignmentIndOutlinedIcon fontSize="small" />,
          onClick: () => onAssign?.(asset),
        },
        {
          label: "Borrow",
          icon: <LaptopChromebookOutlinedIcon fontSize="small" />,
          onClick: () => onBorrow?.(asset),
        },
        {
          label: "Transfer",
          icon: <SwapHorizOutlinedIcon fontSize="small" />,
          onClick: () => onTransfer?.(asset),
        },
        {
          label: "Maintenance",
          icon: <BuildOutlinedIcon fontSize="small" />,
          onClick: () => onMaintenance?.(asset),
        },
        {
          label: "Dispose",
          icon: <DeleteOutlineOutlinedIcon fontSize="small" />,
          color: "error.main",
          onClick: () => onDispose?.(asset),
        },
      ]}
    />
  );
}