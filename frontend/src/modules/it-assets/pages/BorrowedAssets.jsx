import { useCallback, useEffect, useMemo, useState } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import usePageTitle from "../../../platform/hooks/usePageTitle";
import useAppNotification from "../../../platform/ui/feedback/useAppNotification";
import {
  AppBreadcrumbs, AppButton, AppCard, AppChip, AppDataTable, AppPageHeader, AppStatCard,
} from "../../../platform/ui";
import BorrowAssetDialog from "../dialogs/BorrowAssetDialog";
import ReturnAssetDialog from "../dialogs/ReturnAssetDialog";
import {
  borrowItAssetService, getActiveItAssetBorrowsService, getItAssetBorrowHistoryService,
  getItAssetLookupsService, getItAssetsService, getOverdueItAssetBorrowsService,
  returnBorrowedItAssetService,
} from "../services/itAssetService";

const formatDate = (value) => value
  ? new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  : "—";

export default function BorrowedAssets() {
  usePageTitle("Borrow & Return Assets");
  const notification = useAppNotification();
  const [active, setActive] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [history, setHistory] = useState([]);
  const [assets, setAssets] = useState([]);
  const [lookups, setLookups] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [returningBorrow, setReturningBorrow] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const [activeRows, overdueRows, historyRows, assetResult, lookupResult] = await Promise.all([
        getActiveItAssetBorrowsService(), getOverdueItAssetBorrowsService(),
        getItAssetBorrowHistoryService({ page: 1, limit: 100 }),
        getItAssetsService({ page: 1, limit: 10000 }), getItAssetLookupsService(),
      ]);
      setActive(activeRows); setOverdue(overdueRows); setHistory(historyRows);
      setAssets(assetResult.assets || []); setLookups(lookupResult || {});
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to load borrow records.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const availableAssets = useMemo(() => assets.filter((asset) =>
    String(asset.StatusKey || asset.statusKey || "").toUpperCase() === "AVAILABLE" &&
    !asset.CurrentAssignedUserId && !asset.CurrentAssignedName
  ).map((asset) => ({
    ...asset,
    AssetDisplayName: `${asset.AssetTag} · ${asset.CategoryName || "Asset"} · ${asset.ModelName || asset.ModelDescription || "Model not recorded"}`,
  })), [assets]);

  const handleBorrow = async (payload) => {
    try {
      setSaving(true); setDialogError("");
      await borrowItAssetService(payload);
      setBorrowOpen(false); notification.showSuccess("Asset borrowed successfully."); await load();
    } catch (err) { setDialogError(err?.response?.data?.message || err.message || "Unable to borrow asset."); }
    finally { setSaving(false); }
  };

  const handleReturn = async (payload) => {
    try {
      setSaving(true); setDialogError("");
      await returnBorrowedItAssetService({ assetId: returningBorrow.AssetId, ...payload });
      setReturningBorrow(null); notification.showSuccess("Borrowed asset returned for maintenance review."); await load();
    } catch (err) { setDialogError(err?.response?.data?.message || err.message || "Unable to return asset."); }
    finally { setSaving(false); }
  };

  const columns = [
    { field: "AssetTag", headerName: "Asset Tag" },
    { field: "ModelDescription", headerName: "Asset" },
    { field: "BorrowedByName", headerName: "Borrower" },
    { field: "BorrowedAt", headerName: "Borrowed", render: (row) => formatDate(row.BorrowedAt) },
    { field: "ExpectedReturnAt", headerName: "Expected Return", render: (row) => formatDate(row.ExpectedReturnAt) },
    { field: "status", headerName: "Status", render: (row) => {
      const isOverdue = !row.ReturnedAt && row.ExpectedReturnAt && new Date(row.ExpectedReturnAt) < new Date();
      return <AppChip label={row.ReturnedAt ? "Returned" : isOverdue ? "Overdue" : "Borrowed"}
        status={row.ReturnedAt ? "Completed" : isOverdue ? "Overdue" : "Active"} />;
    } },
    { field: "actions", headerName: "Actions", render: (row) =>
      !row.ReturnedAt && <AppButton size="small" variant="outlined" onClick={() => { setDialogError(""); setReturningBorrow(row); }}>Return</AppButton>
    },
  ];

  return <Stack spacing={3}>
    <AppBreadcrumbs items={[{ label: "IT Assets", to: "/it-assets/dashboard" }, { label: "Borrow & Return" }]} />
    <AppPageHeader title="Borrow & Return" subtitle="Manage temporary asset custody, due dates, returns, and complete history."
      actions={<AppButton onClick={() => { setDialogError(""); setBorrowOpen(true); }}>Borrow Asset</AppButton>} />
    {error && <AppCard><Typography color="error">{error}</Typography></AppCard>}
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 4 }}><AppStatCard title="Currently Borrowed" value={active.length} /></Grid>
      <Grid size={{ xs: 12, sm: 4 }}><AppStatCard title="Overdue" value={overdue.length} color="error.main" /></Grid>
      <Grid size={{ xs: 12, sm: 4 }}><AppStatCard title="History Records" value={history.length} /></Grid>
    </Grid>
    <AppCard><Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Active and Overdue Borrows</Typography>
      <AppDataTable rows={active} columns={columns} loading={loading} getRowId={(row) => row.AssetBorrowId} />
    </AppCard>
    <AppCard><Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Borrow History</Typography>
      <AppDataTable rows={history} columns={columns} loading={loading} getRowId={(row) => row.AssetBorrowId} />
    </AppCard>
    <BorrowAssetDialog open={borrowOpen} assets={availableAssets} users={lookups.users || []} saving={saving}
      error={dialogError} onClose={() => setBorrowOpen(false)} onSubmit={handleBorrow} />
    <ReturnAssetDialog open={Boolean(returningBorrow)} asset={returningBorrow} lookups={lookups} saving={saving}
      error={dialogError} onClose={() => setReturningBorrow(null)} onSubmit={handleReturn} />
  </Stack>;
}
