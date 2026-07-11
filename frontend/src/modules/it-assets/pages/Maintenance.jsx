import { useCallback, useEffect, useState } from "react";
import { Stack, Typography } from "@mui/material";
import usePageTitle from "../../../platform/hooks/usePageTitle";
import { AppBreadcrumbs, AppButton, AppCard, AppDataTable, AppPageHeader } from "../../../platform/ui";
import { completeItAssetMaintenanceService, getItAssetMaintenanceDueService, getItAssetMaintenanceLogsService } from "../services/itAssetService";

const date = (value) => value ? new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(new Date(value)) : "—";
export default function Maintenance() {
  usePageTitle("IT Asset Maintenance");
  const [logs, setLogs] = useState([]); const [due, setDue] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setLoading(true); setError(""); const [all, dueRows] = await Promise.all([getItAssetMaintenanceLogsService(), getItAssetMaintenanceDueService()]); setLogs(all); setDue(dueRows); }
    catch (err) { setError(err?.response?.data?.message || err.message || "Unable to load maintenance."); } finally { setLoading(false); } }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);
  const finish = async (maintenanceLogId) => {
    try {
      setLoading(true); setError("");
      await completeItAssetMaintenanceService(maintenanceLogId);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to finish maintenance.");
      setLoading(false);
    }
  };
  const columns = [
    { field: "AssetTag", headerName: "Asset Tag" }, { field: "ModelDescription", headerName: "Asset" },
    { field: "MaintenanceType", headerName: "Issue" }, { field: "PerformedByName", headerName: "Performed By" },
    { field: "PerformedAt", headerName: "Started", render: (row) => date(row.PerformedAt) },
    { field: "NextDueAt", headerName: "Next Due", render: (row) => date(row.NextDueAt) },
    { field: "Description", headerName: "Description" },
    { field: "actions", headerName: "Actions", render: (row) => {
      const status = String(row.AssetStatusKey || row.AssetStatusName || "").replace(/[\s_-]/g, "").toUpperCase();
      const unfinished = ["UNDERREPAIR", "UNDERMAINTENANCE", "MAINTENANCE"].includes(status);
      return Number(row.MaintenanceSequence) === 1 && unfinished
        ? <AppButton size="small" onClick={() => finish(row.MaintenanceLogId)}>Mark Finished</AppButton>
        : <Typography variant="caption" color="text.secondary">Done</Typography>;
    } },
  ];
  return <Stack spacing={3}><AppBreadcrumbs items={[{ label: "IT Assets", to: "/it-assets/dashboard" }, { label: "Maintenance" }]} />
    <AppPageHeader title="Asset Maintenance" subtitle="Maintenance history and due work from verified maintenance records." actions={<AppButton onClick={load}>Refresh</AppButton>} />
    {error && <AppCard><Typography color="error">{error}</Typography></AppCard>}
    <AppCard><Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Maintenance Due</Typography><AppDataTable rows={due} columns={columns} loading={loading} getRowId={(row) => row.MaintenanceLogId} /></AppCard>
    <AppCard><Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Maintenance History</Typography><AppDataTable rows={logs} columns={columns} loading={loading} getRowId={(row) => row.MaintenanceLogId} /></AppCard>
  </Stack>;
}
