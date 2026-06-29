// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Manager Table Columns
// ============================================

import { Stack, Typography } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import AppChip from "@ui/AppChip";
import AppActionMenu from "@ui/AppActionMenu";

// ============================================
// Helpers
// ============================================

const getVisibilityLabel = (visibilityStatusId) => {
  switch (Number(visibilityStatusId)) {
    case 1:
      return "Visible";
    case 2:
      return "Hidden";
    default:
      return "Unknown";
  }
};

const getVisibilityColor = (visibilityStatusId) => {
  switch (Number(visibilityStatusId)) {
    case 1:
      return "success";
    case 2:
      return "default";
    default:
      return "warning";
  }
};

// ============================================
// Columns Factory
// ============================================

export function getModuleColumns({
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  return [
    {
      id: "module",
      label: "Module",
      render: (row) => (
        <Stack spacing={0.4}>
          <Typography variant="body2" fontWeight={700}>
            {row.moduleName}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {row.moduleKey}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "baseRoute",
      label: "Route",
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.baseRoute || "—"}
        </Typography>
      ),
    },
    {
      id: "icon",
      label: "Icon",
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.icon || "—"}
        </Typography>
      ),
    },
    {
      id: "sortOrder",
      label: "Sort",
      align: "center",
      render: (row) => (
        <Typography variant="body2">
          {row.sortOrder ?? 0}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Status",
      align: "center",
      render: (row) => (
        <AppChip
          label={row.isActive ? "Active" : "Inactive"}
          color={row.isActive ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      id: "visibility",
      label: "Visibility",
      align: "center",
      render: (row) => (
        <AppChip
          label={getVisibilityLabel(row.visibilityStatusId)}
          color={getVisibilityColor(row.visibilityStatusId)}
          size="small"
        />
      ),
    },
    {
      id: "protected",
      label: "Protected",
      align: "center",
      render: (row) =>
        row.isProtected ? (
          <AppChip label="Protected" color="warning" size="small" />
        ) : (
          <AppChip label="Editable" color="default" size="small" />
        ),
    },
    {
      id: "actions",
      label: "",
      align: "right",
      render: (row) => (
        <AppActionMenu
          items={[
            {
              label: "Edit",
              icon: <EditIcon fontSize="small" />,
              onClick: () => onEdit(row),
            },
            {
              label: row.isActive ? "Deactivate" : "Activate",
              icon: <PowerSettingsNewIcon fontSize="small" />,
              onClick: () => onToggleStatus(row),
            },
            {
              label: "Delete",
              icon: <DeleteOutlineIcon fontSize="small" />,
              color: "error.main",
              disabled: row.isProtected,
              onClick: () => onDelete(row),
            },
          ]}
        />
      ),
    },
  ];
}