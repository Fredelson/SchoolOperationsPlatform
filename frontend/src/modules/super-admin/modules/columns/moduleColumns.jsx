// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Manager Columns
// ============================================
//
// Purpose:
// Defines reusable table columns for the Super Admin
// Module Manager page.
//
// Used by:
// ModuleManager -> AppDataTable -> moduleColumns
// ============================================

import AppChip from "@platform/ui/AppChip";
import AppActionMenu from "@platform/ui/AppActionMenu";

// ============================================
// Helpers
// ============================================

function getValue(row, camelKey, sqlKey, fallback = "-") {
  return row?.[camelKey] ?? row?.[sqlKey] ?? fallback;
}

function getBooleanValue(row, camelKey, sqlKey) {
  return Boolean(row?.[camelKey] ?? row?.[sqlKey]);
}

function normalizeKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getVisibilityValue(row) {
  const visibilityStatusId = Number(
    row?.visibilityStatusId ?? row?.VisibilityStatusId
  );

  const visibilityStatusKey = normalizeKey(
    row?.visibilityStatusKey ?? row?.VisibilityStatusKey
  );

  if (visibilityStatusId === 1) return true;
  if (visibilityStatusId === 2) return false;

  if (visibilityStatusKey === "enabled") return true;
  if (visibilityStatusKey === "hidden") return false;

  return false;
}

// ============================================
// Columns Factory
// ============================================

export function getModuleColumns({
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  disabled = false,
} = {}) {
  return [
    {
      field: "moduleName",
      headerName: "Module Name",
      render: (row) => getValue(row, "moduleName", "ModuleName"),
    },
    {
      field: "moduleKey",
      headerName: "Module Key",
      render: (row) => getValue(row, "moduleKey", "ModuleKey"),
    },
    {
      field: "baseRoute",
      headerName: "Base Route",
      render: (row) => getValue(row, "baseRoute", "BaseRoute"),
    },
    {
      field: "icon",
      headerName: "Icon",
      render: (row) => getValue(row, "icon", "Icon"),
    },
    {
      field: "status",
      headerName: "Status",
      render: (row) => {
        const isActive = getBooleanValue(row, "isActive", "IsActive");

        return (
          <AppChip
            label={isActive ? "Active" : "Inactive"}
            color={isActive ? "success" : "default"}
            size="small"
          />
        );
      },
    },
    {
      field: "visibility",
      headerName: "Visibility",
      render: (row) => {
        const isVisible = getVisibilityValue(row);

        return (
          <AppChip
            label={isVisible ? "Visible" : "Hidden"}
            color={isVisible ? "success" : "warning"}
            size="small"
          />
        );
      },
    },
    {
      field: "sortOrder",
      headerName: "Sort Order",
      render: (row) => getValue(row, "sortOrder", "SortOrder", 0),
    },
    {
      field: "actions",
      headerName: "Actions",
      align: "right",
      render: (row) => {
        const isActive = getBooleanValue(row, "isActive", "IsActive");

        return (
          <AppActionMenu
            items={[
              {
                label: "View",
                disabled,
                onClick: () => onView?.(row),
              },
              {
                label: "Edit",
                disabled,
                onClick: () => onEdit?.(row),
              },
              {
                label: isActive ? "Deactivate" : "Activate",
                disabled,
                onClick: () =>
                  isActive ? onDeactivate?.(row) : onActivate?.(row),
              },
              {
                label: "Delete",
                color: "error",
                disabled,
                onClick: () => onDelete?.(row),
              },
            ]}
          />
        );
      },
    },
  ];
}

export default getModuleColumns;
