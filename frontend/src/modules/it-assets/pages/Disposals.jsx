import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Stack, Tab, Tabs } from "@mui/material";

import usePageTitle from "../../../platform/hooks/usePageTitle";
import {
  AppBreadcrumbs,
  AppButton,
  AppChip,
  AppConfirmDialog,
  AppDataTable,
  AppEmptyState,
  AppLoadingState,
  AppPageHeader,
  AppStatCards,
} from "../../../platform/ui";

import {
  approveItAssetDisposalService,
  completeItAssetDisposalService,
  getItAssetDisposalsService,
  rejectItAssetDisposalService,
} from "../services/itAssetService";

const STATUS_TABS = ["ALL", "PENDING", "APPROVED", "DISPOSED", "REJECTED"];

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(value)
      )
    : "—";

const Disposals = () => {
  usePageTitle("IT Asset Disposals");

  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [confirmRecord, setConfirmRecord] = useState(null);

  const loadDisposals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setRecords(await getItAssetDisposalsService());
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load asset disposals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial server synchronization for this route.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDisposals();
  }, [loadDisposals]);

  const counts = useMemo(
    () =>
      records.reduce(
        (result, record) => {
          const key = String(record.DisposalStatus || "").toUpperCase();
          result[key] = (result[key] || 0) + 1;
          return result;
        },
        { PENDING: 0, APPROVED: 0, DISPOSED: 0, REJECTED: 0 }
      ),
    [records]
  );

  const filteredRecords = useMemo(
    () =>
      status === "ALL"
        ? records
        : records.filter(
            (record) => String(record.DisposalStatus || "").toUpperCase() === status
          ),
    [records, status]
  );

  const runAction = async (record, action) => {
    try {
      setSavingId(record.DisposalId);
      setError("");
      await action(record.DisposalId);
      await loadDisposals();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update disposal request.");
    } finally {
      setSavingId(null);
    }
  };

  const handleConfirmDisposal = async () => {
    if (!confirmRecord) return;
    const record = confirmRecord;
    await runAction(record, completeItAssetDisposalService);
    setConfirmRecord(null);
  };

  const columns = [
    { field: "AssetTag", headerName: "Asset Tag" },
    {
      field: "AssetName",
      headerName: "Asset",
      render: (row) =>
        [row.CategoryName, row.ModelName || row.ModelDescription].filter(Boolean).join(" · ") ||
        "Asset details not recorded",
    },
    { field: "LocationName", headerName: "Location", render: (row) => row.LocationName || "—" },
    { field: "Reason", headerName: "Disposal Reason", render: (row) => row.Reason || "—" },
    {
      field: "DisposalStatus",
      headerName: "Status",
      render: (row) => <AppChip label={row.DisposalStatus} status={row.DisposalStatus} />,
    },
    { field: "RequestedByName", headerName: "Requested By", render: (row) => row.RequestedByName || "—" },
    { field: "RequestedAt", headerName: "Requested", render: (row) => formatDate(row.RequestedAt) },
    {
      field: "actions",
      headerName: "Actions",
      render: (row) => {
        const rowStatus = String(row.DisposalStatus || "").toUpperCase();
        const saving = savingId === row.DisposalId;

        if (rowStatus === "PENDING") {
          return (
            <Stack direction="row" spacing={1}>
              <AppButton
                size="small"
                disabled={saving}
                onClick={() => runAction(row, approveItAssetDisposalService)}
              >
                Approve
              </AppButton>
              <AppButton
                size="small"
                variant="outlined"
                color="error"
                disabled={saving}
                onClick={() => runAction(row, rejectItAssetDisposalService)}
              >
                Reject
              </AppButton>
            </Stack>
          );
        }

        if (rowStatus === "APPROVED") {
          return (
            <AppButton
              size="small"
              color="error"
              disabled={saving}
              onClick={() => setConfirmRecord(row)}
            >
              Dispose Asset
            </AppButton>
          );
        }

        return "—";
      },
    },
  ];

  if (loading && !records.length) {
    return <AppLoadingState title="Loading asset disposals..." />;
  }

  return (
    <Box>
      <AppBreadcrumbs
        items={[
          { label: "IT Assets", to: "/it-assets/dashboard" },
          { label: "Disposals" },
        ]}
      />

      <AppPageHeader
        title="Asset Disposals"
        subtitle="Review pending disposal requests, confirm approved disposals, and retain completed disposal history."
        actions={<AppButton onClick={loadDisposals}>Refresh</AppButton>}
      />

      <Stack spacing={2.5}>
        <AppStatCards
          spacing={1.5}
          items={[
            { title: "Pending Review", value: counts.PENDING, md: 3 },
            { title: "Approved", value: counts.APPROVED, md: 3 },
            { title: "Disposed", value: counts.DISPOSED, md: 3 },
            { title: "Rejected", value: counts.REJECTED, md: 3 },
          ]}
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Tabs
          value={status}
          onChange={(_, value) => setStatus(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {STATUS_TABS.map((item) => (
            <Tab key={item} value={item} label={item === "ALL" ? `All (${records.length})` : `${item} (${counts[item] || 0})`} />
          ))}
        </Tabs>

        {!filteredRecords.length ? (
          <AppEmptyState
            title={`No ${status === "ALL" ? "disposal" : status.toLowerCase()} records`}
            message="There are no disposal records in this view."
          />
        ) : (
          <AppDataTable
            rows={filteredRecords}
            columns={columns}
            getRowId={(row) => row.DisposalId}
          />
        )}
      </Stack>

      <AppConfirmDialog
        open={Boolean(confirmRecord)}
        title="Confirm Final Disposal"
        message={
          confirmRecord
            ? `Dispose asset ${confirmRecord.AssetTag}? This will mark the asset as disposed and remove it from active Asset Management.`
            : ""
        }
        confirmText="Confirm Disposal"
        loading={Boolean(confirmRecord && savingId === confirmRecord.DisposalId)}
        onConfirm={handleConfirmDisposal}
        onCancel={() => setConfirmRecord(null)}
      />
    </Box>
  );
};

export default Disposals;
