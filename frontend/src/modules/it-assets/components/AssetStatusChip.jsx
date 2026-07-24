// ============================================
// Asset Status Chip
// ============================================

import { AppChip } from "../../../platform/ui";

const getStatusColor = (status = "") => {
  const normalized = status.toLowerCase();

  if (normalized.includes("available")) return "success";
  if (normalized.includes("assigned")) return "info";
  if (normalized.includes("borrowed")) return "warning";
  if (normalized.includes("disposed") || normalized.includes("beyond repair")) return "default";
  if (normalized.includes("lost")) return "error";
  if (normalized.includes("damaged")) return "warning";

  return "default";
};

const AssetStatusChip = ({ status }) => {
  return (
    <AppChip
      label={status || "Unknown"}
      color={getStatusColor(status)}
      size="small"
    />
  );
};

export default AssetStatusChip;