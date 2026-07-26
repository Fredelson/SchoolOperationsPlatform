import { useCallback, useEffect, useMemo, useState } from "react";
import { Stack, Typography } from "@mui/material";
import usePageTitle from "../../../platform/hooks/usePageTitle";
import { AppBreadcrumbs, AppButton, AppCard, AppChip, AppDataTable, AppFilterBar, AppFormField, AppPageHeader } from "../../../platform/ui";
import { getItAssetIssuesService } from "../services/itAssetService";

const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(new Date(value))
    : "—";

const columns = [
  { field: "AssetTag", headerName: "Asset Tag" },
  { field: "ModelDescription", headerName: "Asset" },
  {
    field: "SourceType",
    headerName: "Source",
    render: (row) => (
      <AppChip
        label={row.SourceType === "MAINTENANCE" ? "Maintenance" : "Issue"}
        status={row.SourceType === "MAINTENANCE" ? "progress" : "active"}
      />
    ),
  },
  { field: "IssueTypeName", headerName: "Required Action / Issue" },
  { field: "IssueStatus", headerName: "Status", render: (row) => <AppChip label={row.IssueStatus} status={row.IssueStatus} /> },
  { field: "ReportedByName", headerName: "Reported By" },
  { field: "AssignedToName", headerName: "Assigned To" },
  { field: "ReportedAt", headerName: "Recorded", render: (row) => date(row.ReportedAt) },
  { field: "Description", headerName: "Description" },
];
export default function Issues() {
  usePageTitle("IT Asset Issues");
  const [rows, setRows] = useState([]); const [status, setStatus] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setLoading(true); setError(""); setRows(await getItAssetIssuesService()); }
    catch (err) { setError(err?.response?.data?.message || err.message || "Unable to load issues."); } finally { setLoading(false); } }, []);
  useEffect(() => {
     
    load();
  }, [load]);
  const visible = useMemo(() => status ? rows.filter((row) => String(row.IssueStatus).toUpperCase() === status) : rows, [rows, status]);
  return <Stack spacing={3}><AppBreadcrumbs items={[{ label: "IT Assets", to: "/it-assets/dashboard" }, { label: "Issues" }]} />
    <AppPageHeader title="Asset Issues and Maintenance" subtitle="Issues, required actions, and maintenance work recorded against IT assets." actions={<AppButton onClick={load}>Refresh</AppButton>} />
    <AppFilterBar columns={1}>
      <AppFormField type="select" size="small" label="Status" value={status} onChange={setStatus} options={[
        { id: "", name: "All statuses" }, { id: "OPEN", name: "Open" }, { id: "ASSIGNED", name: "Assigned" },
        { id: "IN_PROGRESS", name: "In progress" }, { id: "RESOLVED", name: "Resolved" }, { id: "CLOSED", name: "Closed" },
      ]} />
    </AppFilterBar>
    {error && <AppCard><Typography color="error">{error}</Typography></AppCard>}
    <AppDataTable rows={visible} columns={columns} loading={loading} getRowId={(row) => row.IssueRowId || row.IssueLogId} />
  </Stack>;
}
