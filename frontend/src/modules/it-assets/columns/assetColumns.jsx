// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// IT Asset Table Columns
// ============================================

import { AppChip } from "../../../platform/ui";
import AssetActionMenu from "../components/AssetActionMenu";

/**
 * Resolve status chip color from status name.
 */
const getStatusColor = (status = "") => {
  const value = String(status).toLowerCase();

  if (value.includes("available")) return "success";
  if (value.includes("assigned")) return "info";
  if (value.includes("borrowed")) return "warning";
  if (value.includes("maintenance") || value.includes("repair")) return "warning";
  if (value.includes("disposed")) return "default";
  if (value.includes("lost")) return "error";
  if (value.includes("damaged")) return "warning";

  return "default";
};

/**
 * Safe display helper.
 */
const safeText = (value) => value || "—";

export const buildAssetColumns = (handlers = {}) => [
  {
    field: "AssetTag",
    headerName: "Asset Code",
    width: 140,
    render: (row) => safeText(row.AssetTag),
  },
  {
    field: "ModelDescription",
    headerName: "Asset Name",
    width: 220,
    render: (row) => safeText(row.ModelDescription || row.ModelName),
  },
  {
    field: "CategoryName",
    headerName: "Category",
    width: 150,
    render: (row) => safeText(row.CategoryName),
  },
  {
    field: "BrandName",
    headerName: "Brand",
    width: 130,
    render: (row) => safeText(row.BrandName),
  },
  {
    field: "ModelName",
    headerName: "Model",
    width: 150,
    render: (row) => safeText(row.ModelName),
  },
  {
    field: "LocationName",
    headerName: "Location",
    width: 170,
    render: (row) => safeText(row.LocationName),
  },
  {
    field: "RoomName",
    headerName: "Room",
    width: 120,
    render: (row) => safeText(row.RoomName),
  },
  {
    field: "CurrentAssignedUserName",
    headerName: "Assigned To",
    width: 180,
    render: (row) =>
      safeText(row.CurrentAssignedUserName || row.CurrentAssignedName || row.RoomName),
  },
  {
    field: "StatusName",
    headerName: "Status",
    width: 150,
    render: (row) => (
      <AppChip
        label={row.StatusName || "Unknown"}
        color={getStatusColor(row.StatusName)}
        size="small"
      />
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 90,
    align: "center",
    render: (row) => (
      <AssetActionMenu
        asset={row}
        onView={handlers.onView}
        onEdit={handlers.onEdit}
        onAssign={handlers.onAssign}
        onBorrow={handlers.onBorrow}
        onTransfer={handlers.onTransfer}
        onMaintenance={handlers.onMaintenance}
        onDispose={handlers.onDispose}
      />
    ),
  },
];
