import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  Download,
  Pause,
  PlayArrow,
  Refresh,
  StopCircle,
} from "@mui/icons-material";

import { AppButton, AppPageHeader } from "@ui";
import PrintingRequestTable from "../components/PrintingRequestTable";
import {
  cancelPrintingRequest,
  claimPrintingRequest,
  completePrintingRequest,
  getManagedPrintingRequests,
  getPrintingQueue,
  getPrintingReport,
  getPrintingSettings,
  holdPrintingRequest,
  resumePrintingRequest,
  startPrintingRequest,
  updatePrintingSettings,
} from "../../../services/printingService";

const formatDate = (value) =>
  value ? new Date(value).toLocaleString() : "-";

const statusColor = (status) => {
  const value = String(status || "").toLowerCase();
  if (value.includes("completed") || value.includes("approved")) {
    return "success";
  }
  if (value.includes("rejected") || value.includes("cancelled")) {
    return "error";
  }
  if (value.includes("printing")) return "info";
  if (value.includes("hold")) return "warning";
  return "default";
};

function LoadingBlock() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
      <CircularProgress size={30} />
    </Box>
  );
}

function RequestTable({ requests, actions }) {
  return (
    <PrintingRequestTable
      requests={requests}
      actionRenderer={actions}
      emptyTitle="No printing requests found."
      emptyMessage="There are no printing requests matching the current filters."
    />
  );
}

export function PrintingQueuePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setRequests((await getPrintingQueue()) || []);
    } catch (loadError) {
      setError(
        loadError.response?.data?.message || "Unable to load the printing queue."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (requestId, action) => {
    try {
      setBusyId(requestId);
      setError("");
      await action();
      await load();
    } catch (actionError) {
      setError(
        actionError.response?.data?.message || "Unable to update the print job."
      );
    } finally {
      setBusyId(null);
    }
  };

  const actions = (request) => {
    const disabled = busyId === request.RequestId;
    const status = request.Status;
    const buttons = [];

    if (
      ["Queued for Printing", "Forwarded to Printing"].includes(status) &&
      !request.ClaimedByUserId
    ) {
      buttons.push(
        <Button
          key="claim"
          size="small"
          disabled={disabled}
          onClick={() =>
            run(request.RequestId, () => claimPrintingRequest(request.RequestId))
          }
        >
          Claim
        </Button>
      );
    }
    if (
      [
        "Queued for Printing",
        "Forwarded to Printing",
        "Approved by HOD",
        "Approved by HOS",
      ].includes(status)
    ) {
      buttons.push(
        <Button
          key="start"
          size="small"
          startIcon={<PlayArrow />}
          disabled={disabled}
          onClick={() =>
            run(request.RequestId, () => startPrintingRequest(request.RequestId))
          }
        >
          Start
        </Button>
      );
    }
    if (status === "Printing") {
      buttons.push(
        <Button
          key="hold"
          size="small"
          startIcon={<Pause />}
          disabled={disabled}
          onClick={() => {
            const remarks = window.prompt("Reason for placing this job on hold:");
            if (remarks) {
              run(request.RequestId, () =>
                holdPrintingRequest(request.RequestId, remarks)
              );
            }
          }}
        >
          Hold
        </Button>,
        <Button
          key="complete"
          size="small"
          color="success"
          startIcon={<CheckCircle />}
          disabled={disabled}
          onClick={() =>
            run(request.RequestId, () =>
              completePrintingRequest(request.RequestId)
            )
          }
        >
          Complete
        </Button>
      );
    }
    if (status === "On Hold") {
      buttons.push(
        <Button
          key="resume"
          size="small"
          startIcon={<PlayArrow />}
          disabled={disabled}
          onClick={() =>
            run(request.RequestId, () =>
              resumePrintingRequest(request.RequestId)
            )
          }
        >
          Resume
        </Button>
      );
    }
    if (!["Completed", "Cancelled"].includes(status)) {
      buttons.push(
        <Button
          key="cancel"
          size="small"
          color="error"
          startIcon={<StopCircle />}
          disabled={disabled}
          onClick={() => {
            const remarks = window.prompt("Reason for cancelling this job:");
            if (remarks) {
              run(request.RequestId, () =>
                cancelPrintingRequest(request.RequestId, remarks)
              );
            }
          }}
        >
          Cancel
        </Button>
      );
    }

    return (
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
        {buttons}
      </Box>
    );
  };

  return (
    <Box>
      <AppPageHeader
        title="Print Queue"
        subtitle="Claim and process approved printing jobs."
        actions={
          <AppButton startIcon={<Refresh />} onClick={load}>
            Refresh
          </AppButton>
        }
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <LoadingBlock /> : <RequestTable requests={requests} actions={actions} />}
    </Box>
  );
}

export function PrintingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    getManagedPrintingRequests()
      .then((data) => setRequests(data || []))
      .catch((loadError) =>
        setError(
          loadError.response?.data?.message || "Unable to load printing requests."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  const statuses = useMemo(
    () => [...new Set(requests.map((request) => request.Status).filter(Boolean))],
    [requests]
  );
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus = status === "ALL" || request.Status === status;
      const matchesSearch =
        !term ||
        [request.RequestNumber, request.TeacherName, request.DepartmentName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [requests, search, status]);

  return (
    <Box>
      <AppPageHeader
        title="Request Management"
        subtitle="Review every printing request and its current workflow state."
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <TextField
          size="small"
          select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="ALL">All statuses</MenuItem>
          {statuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
      </Box>
      {loading ? <LoadingBlock /> : <RequestTable requests={filtered} />}
    </Box>
  );
}

export function PrintingApprovalsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getManagedPrintingRequests()
      .then((data) =>
        setRequests(
          (data || []).filter((request) =>
            ["Pending HOD Approval", "Pending HOS Approval"].includes(
              request.Status
            )
          )
        )
      )
      .catch((loadError) =>
        setError(
          loadError.response?.data?.message || "Unable to load approval workflow."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <AppPageHeader
        title="Approval Workflow"
        subtitle="Monitor requests currently waiting for HOD or HOS action."
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <LoadingBlock /> : <RequestTable requests={requests} />}
    </Box>
  );
}

export function PrintingReportsPage() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPrintingReport().then(setReport).catch((loadError) =>
      setError(loadError.response?.data?.message || "Unable to load report.")
    );
  }, []);

  const download = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `printing-report-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Box>
      <AppPageHeader
        title="Printing Reports"
        subtitle="Operational totals, stock indicators, and completed jobs."
        actions={
          <AppButton startIcon={<Download />} onClick={download} disabled={!report}>
            Export
          </AppButton>
        }
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!report ? (
        <LoadingBlock />
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 2,
              mb: 3,
            }}
          >
            {report.stats.map((stat) => (
              <Paper key={stat.title} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
                <Typography variant="h5" fontWeight={800}>{stat.value}</Typography>
              </Paper>
            ))}
          </Box>
          <RequestTable requests={report.recentCompletions || []} />
        </>
      )}
    </Box>
  );
}

export function PrintingSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getPrintingSettings().then(setSettings).catch((loadError) =>
      setError(loadError.response?.data?.message || "Unable to load settings.")
    );
  }, []);

  const change = (name, value) =>
    setSettings((current) => ({ ...current, [name]: value }));

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      setSettings(await updatePrintingSettings(settings));
      setMessage("Printing settings saved.");
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <Box>
        <PageHeader title="Printing Settings" subtitle="Configure workflow and stock rules." />
        {error ? <Alert severity="error">{error}</Alert> : <LoadingBlock />}
      </Box>
    );
  }

  return (
    <Box>
      <AppPageHeader
        title="Printing Settings"
        subtitle="Configure approval, queue, inventory, and upload rules."
        actions={
          <AppButton variant="contained" onClick={save} disabled={saving}>
            Save
          </AppButton>
        }
      />
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 2,
          }}
        >
          <TextField
            label="HOS threshold (sheets)"
            type="number"
            value={settings.approvalThresholdSheets}
            onChange={(event) =>
              change("approvalThresholdSheets", Number(event.target.value))
            }
          />
          <TextField
            select
            label="Queue assignment"
            value={settings.queueAssignmentMode}
            onChange={(event) => change("queueAssignmentMode", event.target.value)}
          >
            <MenuItem value="shared">Shared queue</MenuItem>
            <MenuItem value="direct">Direct assignment</MenuItem>
          </TextField>
          <TextField
            label="Sheets per bundle"
            type="number"
            value={settings.bundleSheets}
            onChange={(event) => change("bundleSheets", Number(event.target.value))}
          />
          <TextField
            label="Bundles per box"
            type="number"
            value={settings.bundlesPerBox}
            onChange={(event) => change("bundlesPerBox", Number(event.target.value))}
          />
          <TextField
            label="A4 low stock threshold"
            type="number"
            value={settings.lowStockA4}
            onChange={(event) => change("lowStockA4", Number(event.target.value))}
          />
          <TextField
            label="A3 low stock threshold"
            type="number"
            value={settings.lowStockA3}
            onChange={(event) => change("lowStockA3", Number(event.target.value))}
          />
          <TextField
            label="Upload limit (MB)"
            type="number"
            value={settings.uploadMaxMb}
            onChange={(event) => change("uploadMaxMb", Number(event.target.value))}
          />
          <TextField
            label="Allowed extensions"
            value={(settings.allowedExtensions || []).join(", ")}
            onChange={(event) => change("allowedExtensions", event.target.value)}
          />
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.requireHodApproval}
                onChange={(event) => change("requireHodApproval", event.target.checked)}
              />
            }
            label="Require HOD approval"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.hodSelfApproval}
                onChange={(event) => change("hodSelfApproval", event.target.checked)}
              />
            }
            label="Require HOD self-approval"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.allowReturn}
                onChange={(event) => change("allowReturn", event.target.checked)}
              />
            }
            label="Allow return for correction"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.allowCancelBeforePrinting}
                onChange={(event) =>
                  change("allowCancelBeforePrinting", event.target.checked)
                }
              />
            }
            label="Allow requester cancellation"
          />
        </Box>
      </Paper>
    </Box>
  );
}
