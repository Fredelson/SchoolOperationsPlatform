import { AppChip, AppDataTable } from "@ui";
import { Box } from "@mui/material";
import {
  CheckCircle,
  Pause,
  PlayArrow,
  Refresh,
  StopCircle,
} from "@mui/icons-material";

const statusColor = (status) => {
  const value = String(status || "").toLowerCase();
  if (value.includes("completed") || value.includes("approved")) return "success";
  if (value.includes("rejected") || value.includes("cancelled")) return "error";
  if (value.includes("printing")) return "info";
  if (value.includes("hold")) return "warning";
  return "default";
};

const ActionButtons = ({ request, actionRenderer }) => {
  if (!actionRenderer) return null;
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
      {actionRenderer(request)}
    </Box>
  );
};

export default function PrintingRequestTable({
  requests = [],
  loading = false,
  actionRenderer,
  emptyTitle = "No printing requests found.",
  emptyMessage = "There are no printing requests matching the current filters.",
}) {
  const columns = [
    {
      field: "RequestNumber",
      headerName: "Request",
      render: (row) => (
        <Box>
          <Box sx={{ fontWeight: 800 }}>{row.RequestNumber}</Box>
          <Box sx={{ color: "text.secondary", fontSize: 13 }}>
            {row.SubjectName || "No subject"}
          </Box>
        </Box>
      ),
    },
    {
      field: "TeacherName",
      headerName: "Requester",
      render: (row) => row.TeacherName || "-",
    },
    {
      field: "DepartmentName",
      headerName: "Department",
      render: (row) => row.DepartmentName || "-",
    },
    {
      field: "PaperSize",
      headerName: "Paper",
      render: (row) => row.PaperSize || "A4",
    },
    {
      field: "TotalSheets",
      headerName: "Sheets",
      align: "right",
      render: (row) => row.TotalSheets || 0,
    },
    {
      field: "Status",
      headerName: "Status",
      render: (row) => (
        <AppChip
          label={row.Status || "Unknown"}
          status={statusColor(row.Status)}
        />
      ),
    },
    {
      field: "DueDate",
      headerName: "Due",
      render: (row) => (row.DueDate ? new Date(row.DueDate).toLocaleString() : "-"),
    },
    {
      field: "actions",
      headerName: "Actions",
      align: "right",
      render: (row) => <ActionButtons request={row} actionRenderer={actionRenderer} />,
    },
  ];

  return (
    <AppDataTable
      loading={loading}
      rows={requests}
      columns={columns}
      getRowId={(row) => row.RequestId}
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
    />
  );
}
