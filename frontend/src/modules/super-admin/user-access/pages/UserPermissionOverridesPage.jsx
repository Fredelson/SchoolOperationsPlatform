import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Dialog, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AppButton, AppChip, AppDataTable, AppDialog, AppPageHeader, AppToolbar } from "@ui";
import { overrideApi, unwrap } from "../api/userAccessApi";

const blank = { userId: "", permissionId: "", isAllowed: true, reason: "" };

export default function UserPermissionOverridesPage() {
  const [rows, setRows] = useState([]);
  const [lookups, setLookups] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [effect, setEffect] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const body = unwrap(
        await overrideApi.list({ page: page + 1, pageSize, search, userId, moduleId, effect })
      );
      setRows(body.items || []);
      setTotal(body.totalRows || 0);
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to load overrides.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, userId, moduleId, effect]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    overrideApi
      .lookups()
      .then((r) => setLookups(unwrap(r)))
      .catch((err) => setError(err?.response?.data?.message || "Unable to load override lookups."));
  }, []);

  const permissions = useMemo(
    () =>
      form.moduleId
        ? (lookups.permissions || []).filter(
            (p) => String(p.ModuleId) === String(form.moduleId)
          )
        : lookups.permissions || [],
    [form.moduleId, lookups.permissions]
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ ...blank });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      userId: row.UserId,
      moduleId: row.ModuleId || "",
      permissionId: row.PermissionId,
      isAllowed: row.IsAllowed,
      reason: row.Reason || "",
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm({ ...blank });
    setPreview(null);
  };

  const save = async () => {
    try {
      setError("");
      const payload = {
        userId: Number(form.userId),
        permissionId: Number(form.permissionId),
        isAllowed: Boolean(form.isAllowed),
        reason: form.reason,
      };
      if (editing) {
        await overrideApi.update(editing.UserPermissionOverrideId, payload);
        setSuccess("Permission override updated successfully.");
      } else {
        await overrideApi.create(payload);
        setSuccess("Permission override created successfully.");
      }
      close();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to save override.");
    }
  };

  const showPreview = async (id) => {
    try {
      setError("");
      const data = unwrap(await overrideApi.effective(id));
      setPreview(data);
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to resolve effective permissions.");
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this permission override?")) return;
    try {
      setError("");
      await overrideApi.remove(row.UserPermissionOverrideId);
      setSuccess("Permission override deleted.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to delete override.");
    }
  };

  return (
    <Stack spacing={3}>
      <AppPageHeader
        title="User Permission Overrides"
        subtitle="Grant or revoke permissions over inherited role access."
        actions={<AppButton onClick={openAdd}>Add Override</AppButton>}
      />
      <AppToolbar
        searchValue={search}
        onSearchChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
      >
        <TextField
          select
          size="small"
          label="User"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setPage(0);
          }}
        >
          <MenuItem value="">All</MenuItem>
          {(lookups.users || []).map((x) => (
            <MenuItem key={x.UserId} value={x.UserId}>
              {x.FullName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Module"
          value={moduleId}
          onChange={(e) => {
            setModuleId(e.target.value);
            setPage(0);
          }}
        >
          <MenuItem value="">All</MenuItem>
          {(lookups.modules || []).map((x) => (
            <MenuItem key={x.ModuleId} value={x.ModuleId}>
              {x.ModuleName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Effect"
          value={effect}
          onChange={(e) => {
            setEffect(e.target.value);
            setPage(0);
          }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="grant">Grant</MenuItem>
          <MenuItem value="revoke">Revoke</MenuItem>
        </TextField>
      </AppToolbar>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <AppDataTable
        rows={rows}
        columns={[
          { field: "FullName", headerName: "User" },
          { field: "EmployeeId", headerName: "Employee ID" },
          { field: "ModuleName", headerName: "Module" },
          { field: "PermissionKey", headerName: "Permission" },
          {
            field: "IsAllowed",
            headerName: "Effect",
            render: (r) => (
              <AppChip
                label={r.IsAllowed ? "Grant" : "Revoke"}
                status={r.IsAllowed ? "success" : "danger"}
              />
            ),
          },
          { field: "Reason", headerName: "Reason" },
          {
            field: "actions",
            headerName: "Actions",
            render: (r) => (
              <Stack direction="row" spacing={1}>
                <AppButton
                  buttonKey="USER_OVERRIDE_UPDATE"
                  size="small"
                  variant="outlined"
                  onClick={() => edit(r)}
                >
                  View / Edit
                </AppButton>
                <AppButton
                  size="small"
                  variant="outlined"
                  onClick={() => showPreview(r.UserId)}
                >
                  Effective
                </AppButton>
                <AppButton
                  buttonKey="USER_OVERRIDE_DELETE"
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => remove(r)}
                >
                  Delete
                </AppButton>
              </Stack>
            ),
          },
        ]}
        loading={loading}
        page={page}
        rowsPerPage={pageSize}
        totalRows={total}
        onPageChange={(_, v) => setPage(v)}
        onRowsPerPageChange={(e) => {
          setPageSize(Number(e.target.value));
          setPage(0);
        }}
        getRowId={(r) => r.UserPermissionOverrideId}
      />
      <AppDialog
        open={open}
        title={editing ? "Edit Permission Override" : "Add Permission Override"}
        onClose={close}
        onPrimary={save}
        disablePrimary={!form.userId || !form.permissionId}
      >
        <Stack spacing={2}>
          <TextField
            select
            label="User"
            value={form.userId}
            onChange={(e) =>
              setForm({ ...form, userId: e.target.value, permissionId: "" })
            }
            size="small"
            fullWidth
          >
            {(lookups.users || []).map((x) => (
              <MenuItem key={x.UserId} value={x.UserId}>
                {x.FullName} ({x.EmployeeId})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Module"
            value={form.moduleId || ""}
            onChange={(e) =>
              setForm({ ...form, moduleId: e.target.value, permissionId: "" })
            }
            size="small"
            fullWidth
          >
            {(lookups.modules || []).map((x) => (
              <MenuItem key={x.ModuleId} value={x.ModuleId}>
                {x.ModuleName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Permission"
            value={form.permissionId}
            onChange={(e) =>
              setForm({ ...form, permissionId: e.target.value })
            }
            size="small"
            fullWidth
            disabled={!form.moduleId}
          >
            {(lookups.permissions || [])
              .filter(
                (p) => !form.moduleId || String(p.ModuleId) === String(form.moduleId)
              )
              .map((p) => (
                <MenuItem key={p.PermissionId} value={p.PermissionId}>
                  {p.PermissionName} ({p.PermissionKey})
                </MenuItem>
              ))}
          </TextField>
          <TextField
            select
            label="Effect"
            value={form.isAllowed ? "grant" : "revoke"}
            onChange={(e) =>
              setForm({ ...form, isAllowed: e.target.value === "grant" })
            }
            size="small"
            fullWidth
          >
            <MenuItem value="grant">Grant</MenuItem>
            <MenuItem value="revoke">Revoke</MenuItem>
          </TextField>
          <TextField
            label="Reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            multiline
            rows={2}
            size="small"
            fullWidth
          />
        </Stack>
      </AppDialog>
      {preview && (
        <Dialog
          open={Boolean(preview)}
          onClose={() => setPreview(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Effective Permissions Preview</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="info">
                This shows the resolved effective permissions for the selected user.
              </Alert>
              <Typography variant="subtitle2">User Info</Typography>
              <Typography>Name: {preview.FullName}</Typography>
              <Typography>Employee ID: {preview.EmployeeId}</Typography>
              <Typography>Role: {preview.RoleName}</Typography>
              <Typography>Workspace: {preview.WorkspaceName}</Typography>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Total Permissions: {preview.effectivePermissions?.length || 0}
              </Typography>
            </Stack>
          </DialogContent>
        </Dialog>
      )}
    </Stack>
  );
}
