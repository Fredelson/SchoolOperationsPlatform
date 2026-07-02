// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget Table Columns
// ============================================

import { Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

import AppActionMenu from "@platform/ui/AppActionMenu";
import WidgetStatusChip from "../components/WidgetStatusChip";

export function getWidgetColumns({ onView, onEdit, onDelete, disabled }) {
  return [
    {
      field: "widgetName",
      headerName: "Widget",
      render: (row) => (
        <Stack spacing={0.3}>
          <Typography fontWeight={800}>{row.widgetName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.widgetKey}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "moduleName",
      headerName: "Module",
      render: (row) => row.moduleName || "-",
    },
    {
      field: "widgetType",
      headerName: "Type",
      render: (row) => row.widgetType || "-",
    },
    {
      field: "dataSourceKey",
      headerName: "Data Source",
      render: (row) => row.dataSourceKey || "-",
    },
    {
      field: "visibilityStatusName",
      headerName: "Visibility",
      render: (row) => (
        <WidgetStatusChip status={row.visibilityStatusName} />
      ),
    },
    {
      field: "defaultSize",
      headerName: "Default Size",
      render: (row) => `${row.defaultWidth || 0} x ${row.defaultHeight || 0}`,
    },
    {
      field: "sortOrder",
      headerName: "Sort",
      align: "center",
      render: (row) => row.sortOrder ?? 0,
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