import { useCallback, useEffect, useState } from "react";
import { Stack, Typography } from "@mui/material";
import usePageTitle from "../../../platform/hooks/usePageTitle";
import { AppBreadcrumbs, AppButton, AppCard, AppDataTable, AppPageHeader } from "../../../platform/ui";
import {
  getActiveItAssetAssignmentsService,
  getItAssetAssignmentHistoryService,
} from "../services/itAssetService";

const date = (value) => value ? new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(new Date(value)) : "—";
const activeColumns = [
  { field: "AssetTag", headerName: "Asset Tag" },
  { field: "AssignedToName", headerName: "Assigned To" },
  { field: "DepartmentName", headerName: "Department" },
  { field: "LocationName", headerName: "Location" },
  { field: "AssignedAt", headerName: "Assigned Date", render: (row) => date(row.AssignedAt) },
];
const historyColumns = [
  ...activeColumns,
  { field: "ReturnedAt", headerName: "Returned Date", render: (row) => date(row.ReturnedAt) },
];

export default function Assignments() {
  usePageTitle("IT Asset Assignments");
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const [activeResult, historyResult] = await Promise.all([
        getActiveItAssetAssignmentsService({ page: 1, limit: 100 }),
        getItAssetAssignmentHistoryService({ page: 1, limit: 100 }),
      ]);
      setActive(activeResult.rows); setHistory(historyResult.rows);
    } catch (err) { setError(err?.response?.data?.message || err.message || "Unable to load assignments."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
     
    load();
  }, [load]);
  return <Stack spacing={3}>
    <AppBreadcrumbs items={[{ label: "IT Assets", to: "/it-assets/dashboard" }, { label: "Assignments" }]} />
    <AppPageHeader title="Asset Assignments" subtitle="Current assignments and preserved assignment history."
      actions={<AppButton onClick={load}>Refresh</AppButton>} />
    {error && <AppCard><Typography color="error">{error}</Typography></AppCard>}
    <AppCard><Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Current Assignments</Typography>
      <AppDataTable rows={active} columns={activeColumns} loading={loading} getRowId={(row) => row.AssetAssignmentId} />
    </AppCard>
    <AppCard><Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Assignment History</Typography>
      <AppDataTable rows={history} columns={historyColumns} loading={loading} getRowId={(row) => row.AssetAssignmentId} />
    </AppCard>
  </Stack>;
}
