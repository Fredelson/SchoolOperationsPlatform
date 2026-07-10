import { useCallback, useEffect, useState } from "react";
import { Stack, Typography } from "@mui/material";
import usePageTitle from "../../../platform/hooks/usePageTitle";
import { AppBreadcrumbs, AppButton, AppCard, AppChip, AppDataTable, AppPageHeader } from "../../../platform/ui";
import { getItAssetTransfersService } from "../services/itAssetService";

const date = (value) => value ? new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
const columns = [
  { field: "TransferRequestNumber", headerName: "Transfer No." },
  { field: "AssetTag", headerName: "Asset Tag" },
  { field: "ModelDescription", headerName: "Asset" },
  { field: "TransferStatus", headerName: "Status", render: (row) => <AppChip label={row.TransferStatus} status={row.TransferStatus} /> },
  { field: "RequestedByName", headerName: "Requested By" },
  { field: "RequestedAt", headerName: "Requested", render: (row) => date(row.RequestedAt) },
  { field: "CompletedAt", headerName: "Completed", render: (row) => date(row.CompletedAt) },
];
export default function Transfers() {
  usePageTitle("IT Asset Transfers");
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setLoading(true); setError(""); setRows(await getItAssetTransfersService()); }
    catch (err) { setError(err?.response?.data?.message || err.message || "Unable to load transfers."); } finally { setLoading(false); } }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);
  return <Stack spacing={3}><AppBreadcrumbs items={[{ label: "IT Assets", to: "/it-assets/dashboard" }, { label: "Transfers" }]} />
    <AppPageHeader title="Asset Transfers" subtitle="Completed and active asset transfer records." actions={<AppButton onClick={load}>Refresh</AppButton>} />
    {error && <AppCard><Typography color="error">{error}</Typography></AppCard>}
    <AppDataTable rows={rows} columns={columns} loading={loading} getRowId={(row) => row.AssetTransferRequestId} />
  </Stack>;
}
