// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Feature Flag Table Columns
// ============================================

import { Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

import AppActionMenu from "@platform/ui/AppActionMenu";
import AppChip from "@platform/ui/AppChip";

export function getFeatureFlagColumns({ onView, onEdit, onDelete, disabled }) {
  return [
    {
      field: "FeatureName",
      headerName: "Feature Flag",
      render: (row) => (
        <Stack spacing={0.3}>
          <Typography fontWeight={800}>
            {row.FeatureName || row.featureName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.FeatureKey || row.featureKey}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "ModuleName",
      headerName: "Module",
      render: (row) => row.ModuleName || row.moduleName || "-",
    },
    {
      field: "VisibilityStatusName",
      headerName: "Visibility",
      render: (row) => (
        <AppChip
          label={
            row.VisibilityStatusName ||
            row.visibilityStatusName ||
            "N/A"
          }
        />
      ),
    },
    {
      field: "IsEnabled",
      headerName: "Status",
      render: (row) => (
        <AppChip
          label={row.IsEnabled || row.isEnabled ? "Enabled" : "Disabled"}
          color={row.IsEnabled || row.isEnabled ? "success" : "default"}
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
              label: "View",
              icon: <VisibilityIcon fontSize="small" />,
              onClick: () => onView(row),
              disabled,
            },
            {
              label: "Edit",
              icon: <EditIcon fontSize="small" />,
              onClick: () => onEdit(row),
              disabled,
            },
            {
              label: "Delete",
              icon: <DeleteIcon fontSize="small" />,
              onClick: () => onDelete(row),
              disabled,
              color: "error",
            },
          ]}
        />
      ),
    },
  ];
}