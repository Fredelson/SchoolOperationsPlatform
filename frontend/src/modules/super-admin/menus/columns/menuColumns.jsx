// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Menu Manager Columns
// ============================================
//
// Purpose:
// Defines the AppDataTable columns for the
// Super Admin Menu Manager.
// ============================================

import AppChip from "@platform/ui/AppChip";
import AppActionMenu from "@platform/ui/AppActionMenu";

function getValue(row, camelKey, sqlKey, fallback = "—") {
  return row?.[camelKey] ?? row?.[sqlKey] ?? fallback;
}

function isVisible(row) {
  const statusKey = String(
    row?.visibilityStatusKey ?? row?.VisibilityStatusKey ?? ""
  ).toLowerCase();

  const statusId = Number(row?.visibilityStatusId ?? row?.VisibilityStatusId);

  if (statusKey === "enabled") return true;
  if (statusKey === "hidden") return false;

  return statusId === 1;
}

export function getMenuColumns({
  onEdit,
  onShow,
  onHide,
  onDelete,
  disabled = false,
} = {}) {
  return [
    {
      field: "menuName",
      headerName: "Menu",
      flex: 1.4,
      minWidth: 220,
      renderCell: (params) => getValue(params.row, "menuName", "MenuName"),
    },
    {
      field: "menuKey",
      headerName: "Key",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => getValue(params.row, "menuKey", "MenuKey"),
    },
    {
      field: "moduleName",
      headerName: "Module",
      flex: 1,
      minWidth: 170,
      renderCell: (params) => getValue(params.row, "moduleName", "ModuleName"),
    },
    {
      field: "route",
      headerName: "Route",
      flex: 1.2,
      minWidth: 220,
      renderCell: (params) => getValue(params.row, "route", "Route"),
    },
    {
      field: "parentMenuName",
      headerName: "Parent",
      flex: 1,
      minWidth: 160,
      renderCell: (params) =>
        getValue(params.row, "parentMenuName", "ParentMenuName"),
    },
    {
      field: "visibility",
      headerName: "Visibility",
      width: 130,
      renderCell: (params) =>
        isVisible(params.row) ? (
          <AppChip label="Visible" color="success" size="small" />
        ) : (
          <AppChip label="Hidden" color="default" size="small" />
        ),
    },
    {
      field: "sortOrder",
      headerName: "Sort",
      width: 90,
      renderCell: (params) => getValue(params.row, "sortOrder", "SortOrder", 0),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const visible = isVisible(params.row);

        return (
          <AppActionMenu
            disabled={disabled}
            actions={[
              {
                label: "Edit",
                onClick: () => onEdit?.(params.row),
              },
              visible
                ? {
                    label: "Hide",
                    onClick: () => onHide?.(params.row),
                  }
                : {
                    label: "Show",
                    onClick: () => onShow?.(params.row),
                  },
              {
                label: "Delete",
                color: "error",
                onClick: () => onDelete?.(params.row),
              },
            ]}
          />
        );
      },
    },
  ];
}