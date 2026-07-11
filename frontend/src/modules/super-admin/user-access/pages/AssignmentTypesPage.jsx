import { useEffect, useState } from "react";
import { Alert, Stack } from "@mui/material";
import { AppChip, AppDataTable, AppPageHeader } from "@ui";
import { assignmentApi, unwrap } from "../api/userAccessApi";

export default function AssignmentTypesPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    assignmentApi.lookups().then((response) => setRows(unwrap(response).assignmentTypes || []))
      .catch((err) => setError(err?.response?.data?.message || "Unable to load assignment types."))
      .finally(() => setLoading(false));
  }, []);
  const columns = [
    { field: "AssignmentName", headerName: "Assignment Type" },
    { field: "AssignmentKey", headerName: "Key" },
    { field: "IsActive", headerName: "Status", render: () => <AppChip label="Active" status="success" /> },
  ];
  return <Stack spacing={3}><AppPageHeader title="Assignment Types" subtitle="Registered assignment types used by User Assignments." />{error && <Alert severity="error">{error}</Alert>}<AppDataTable rows={rows} columns={columns} loading={loading} getRowId={(row) => row.AssignmentTypeId} /></Stack>;
}
