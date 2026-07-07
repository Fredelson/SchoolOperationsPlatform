// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// IT Asset Table Columns
// ============================================

import { AppChip } from "../../../platform/ui";
import AssetActionMenu from "../components/AssetActionMenu";

const getStatusColor = (status = "") => {
  const value = String(status).toLowerCase();

  if (value.includes("available")) return "success";
  if (value.includes("assigned")) return "info";
  if (value.includes("borrowed")) return "warning";
  if (value.includes("maintenance")) return "error";
  if (value.includes("disposed")) return "default";
  if (value.includes("lost")) return "error";
  if (value.includes("damaged")) return "warning";

  return "default";
};

const safeText = (value) => value || "—";

export const buildAssetColumns = (handlers = {}) => [
  {
    field: "assetCode",
    headerName: "Asset Code",
    width: 140,
  },
  {
    field: "assetName",
    headerName: "Asset Name",
    width: 220,
  },
  {
    field: "categoryName",
    headerName: "Category",
    width: 150,
    render: (row) => safeText(row.categoryName),
  },
  {
    field: "brandName",
    headerName: "Brand",
    width: 130,
    render: (row) => safeText(row.brandName),
  },
  {
    field: "modelName",
    headerName: "Model",
    width: 150,
    render: (row) => safeText(row.modelName),
  },
  {
    field: "locationName",
    headerName: "Location",
    width: 170,
    render: (row) => safeText(row.locationName),
  },
  {
    field: "assignedToName",
    headerName: "Assigned To",
    width: 180,
    render: (row) => safeText(row.assignedToName),
  },
  {
    field: "statusName",
    headerName: "Status",
    width: 150,
    render: (row) => (
      <AppChip
        label={row.statusName || "Unknown"}
        color={getStatusColor(row.statusName)}
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