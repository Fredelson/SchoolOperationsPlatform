// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Menu Manager Columns
// ============================================
//
// Purpose:
// Defines reusable table columns for the
// Super Admin Menu Manager.
//
// Architecture:
// MenuManager
//      ↓
// AppDataTable
//      ↓
// menuColumns
//
// Notes:
// - Supports PascalCase and camelCase fields
// - Uses AppChip for visibility
// - Uses AppActionMenu (same as Module Manager)
// ============================================

import AppChip from "@platform/ui/AppChip";
import AppActionMenu from "@platform/ui/AppActionMenu";

// ============================================
// Helpers
// ============================================

function getValue(row, camelKey, sqlKey, fallback = "-") {
  return row?.[camelKey] ?? row?.[sqlKey] ?? fallback;
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function isVisible(row) {
  const statusId = Number(
    row?.visibilityStatusId ??
      row?.VisibilityStatusId
  );

  const statusKey = normalize(
    row?.visibilityStatusKey ??
      row?.VisibilityStatusKey ??
      row?.visibilityKey ??
      row?.VisibilityKey
  );

  if (statusId === 1) return true;
  if (statusId === 2) return false;

  if (statusKey === "enabled") return true;
  if (statusKey === "visible") return true;

  if (statusKey === "hidden") return false;
  if (statusKey === "disabled") return false;

  return false;
}

// ============================================
// Columns Factory
// ============================================

export function getMenuColumns({
  onEdit,
  onShow,
  onHide,
  onDelete,
  disabled = false,
} = {}) {
  return [
    // ========================================
    // Menu Name
    // ========================================

    {
      field: "menuName",
      headerName: "Menu",
      render: (row) =>
        getValue(row, "menuName", "MenuName"),
    },

    // ========================================
    // Menu Key
    // ========================================

    {
      field: "menuKey",
      headerName: "Key",
      render: (row) =>
        getValue(row, "menuKey", "MenuKey"),
    },

    // ========================================
    // Module
    // ========================================

    {
      field: "moduleName",
      headerName: "Module",
      render: (row) =>
        getValue(row, "moduleName", "ModuleName"),
    },

    // ========================================
    // Route
    // ========================================

    {
      field: "route",
      headerName: "Route",
      render: (row) =>
        getValue(row, "route", "Route"),
    },

    // ========================================
    // Parent
    // ========================================

    {
      field: "parentMenuName",
      headerName: "Parent",
      render: (row) =>
        getValue(
          row,
          "parentMenuName",
          "ParentMenuName",
          "-"
        ),
    },

    // ========================================
    // Visibility
    // ========================================

    {
      field: "visibility",
      headerName: "Visibility",
      render: (row) => {
        const visible = isVisible(row);

        return (
          <AppChip
            label={visible ? "Visible" : "Hidden"}
            color={visible ? "success" : "warning"}
            size="small"
          />
        );
      },
    },

    // ========================================
    // Sort Order
    // ========================================

    {
      field: "sortOrder",
      headerName: "Sort",
      render: (row) =>
        getValue(row, "sortOrder", "SortOrder", 0),
    },

    // ========================================
    // Actions
    // ========================================

    {
      field: "actions",
      headerName: "Actions",
      align: "right",

      render: (row) => {
        const visible = isVisible(row);

        return (
          <AppActionMenu
            items={[
              {
                label: "Edit",
                disabled,
                onClick: () => onEdit?.(row),
              },

              {
                label: visible ? "Hide" : "Show",
                disabled,
                onClick: () =>
                  visible
                    ? onHide?.(row)
                    : onShow?.(row),
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

export default getMenuColumns;