import { useCallback, useEffect, useMemo, useState } from "react";
import { Stack, Typography } from "@mui/material";
import usePageTitle from "../../../platform/hooks/usePageTitle";
import { AppBreadcrumbs, AppButton, AppCard, AppChip, AppDataTable, AppFormField, AppPageHeader } from "../../../platform/ui";
import { getItAssetIssuesService } from "../services/itAssetService";

const columns = [
  { field: "AssetTag", headerName: "Asset Tag" },
  { field: "ModelDescription", headerName: "Asset" },
  { field: "IssueTypeName", headerName: "Required Action / Issue" },
  { field: "IssueStatus", headerName: "Status", render: (row) => <AppChip label={row.IssueStatus} status={row.IssueStatus} /> },
  { field: "ReportedByName", headerName: "Reported By" },
  { field: "AssignedToName", headerName: "Assigned To" },
  { field: "Description", headerName: "Description" },
];
export default function Issues() {
  usePageTitle("IT Asset Issues");
  const [rows, setRows] = useState([]); const [status, setStatus] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setLoading(true); setError(""); setRows(await getItAssetIssuesService()); }
    catch (err) { setError(err?.response?.data?.message || err.message || "Unable to load issues."); } finally { setLoading(false); } }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);
  const visible = useMemo(() => status ? rows.filter((row) => String(row.IssueStatus).toUpperCase() === status) : rows, [rows, status]);
  return <Stack spacing={3}><AppBreadcrumbs items={[{ label: "IT Assets", to: "/it-assets/dashboard" }, { label: "Issues" }]} />
    <AppPageHeader title="Return Issues and Required Actions" subtitle="Structured issues recorded through returns and maintenance workflows." actions={<AppButton onClick={load}>Refresh</AppButton>} />
    <AppFormField type="select" label="Status" value={status} onChange={setStatus} options={[
      { id: "", name: "All statuses" }, { id: "OPEN", name: "Open" }, { id: "ASSIGNED", name: "Assigned" },
      { id: "IN_PROGRESS", name: "In progress" }, { id: "RESOLVED", name: "Resolved" }, { id: "CLOSED", name: "Closed" },
    ]} />
    {error && <AppCard><Typography color="error">{error}</Typography></AppCard>}
    <AppDataTable rows={visible} columns={columns} loading={loading} getRowId={(row) => row.IssueLogId} />
  </Stack>;
}
