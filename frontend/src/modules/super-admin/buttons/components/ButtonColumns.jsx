// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Manager Columns
// ============================================

import AppChip from "@platform/ui/AppChip";
import AppActionMenu from "@platform/ui/AppActionMenu";

function getValue(row, camelKey, sqlKey, fallback = "-") {
  return row?.[camelKey] ?? row?.[sqlKey] ?? fallback;
}

function getVisibilityColor(row) {
  const id = Number(getValue(row, "visibilityStatusId", "VisibilityStatusId", 0));
  if (id === 1) return "success";
  if (id === 2) return "warning";
  return "default";
}

export function getButtonColumns({ onEdit, onDelete, disabled = false } = {}) {
  return [
    {
      field: "buttonName",
      headerName: "Button Name",
      render: (row) => getValue(row, "buttonName", "ButtonName"),
    },
    {
      field: "buttonKey",
      headerName: "Button Key",
      render: (row) => getValue(row, "buttonKey", "ButtonKey"),
    },
    {
      field: "moduleName",
      headerName: "Module",
      render: (row) => getValue(row, "moduleName", "ModuleName"),
    },
    {
      field: "permissionKey",
      headerName: "Permission",
      render: (row) => getValue(row, "permissionKey", "PermissionKey"),
    },
    {
      field: "featureFlagKey",
      headerName: "Feature Flag",
      render: (row) => getValue(row, "featureFlagKey", "FeatureFlagKey"),
    },
    {
      field: "visibility",
      headerName: "Visibility",
      render: (row) => (
        <AppChip
          label={getValue(row, "visibilityStatusName", "VisibilityStatusName")}
          color={getVisibilityColor(row)}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      align: "right",
      render: (row) => (
        <AppActionMenu
          items={[
            {
              label: "Edit",
              disabled,
              onClick: () => onEdit?.(row),
            },
            {
              label: "Delete",
              color: "error",
              disabled,
              onClick: () => onDelete?.(row),
            },
          ]}
        />
      ),
    },
  ];
}

export default getButtonColumns;