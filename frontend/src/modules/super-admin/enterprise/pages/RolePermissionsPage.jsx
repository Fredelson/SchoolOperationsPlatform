import { useCallback, useEffect, useState } from "react";
import { Alert, Dialog, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { AppButton, AppChip, AppDataTable, AppDialog, AppPageHeader, AppToolbar } from "@ui";
import api from "@services/api";

export default function RolePermissionsPage() {
  const [rows, setRows] = useState([]);
  const [lookups, setLookups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/role-permissions", { params: { page: 1, limit: 100, search } });
      const payload = response?.data;
      const body = payload?.data ?? payload;
      setRows(body?.data ?? body?.items ?? body?.rows ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load role permissions.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api
      .get("/role-permissions/lookups")
      .then((r) => setLookups(r?.data?.data ?? r?.data ?? {}))
      .catch((err) => setError(err?.response?.data?.message || "Unable to load lookups."));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ roleId: "", permissionId: "", isAllowed: true });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      roleId: row.RoleId || row.roleId || "",
      permissionId: row.PermissionId || row.permissionId || "",
      isAllowed: row.IsAllowed ?? row.isAllowed ?? true,
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm({});
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      const payload = {
        roleId: Number(form.roleId),
        permissionId: Number(form.permissionId),
        isAllowed: Boolean(form.isAllowed),
      };
      const id = editing?.RolePermissionId || editing?.rolePermissionId;
      if (id) {
        await api.put(`/role-permissions/${id}`, payload);
      } else {
        await api.post("/role-permissions", payload);
      }
      close();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save role permission.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm("Delete this role permission?")) return;
    try {
      setError("");
      const id = row.RolePermissionId || row.rolePermissionId;
      await api.delete(`/role-permissions/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete role permission.");
    }
  };

  const columns = [
    { field: "DisplayName", headerName: "Role" },
    { field: "PermissionName", headerName: "Permission" },
    { field: "PermissionKey", headerName: "Key" },
    { field: "ModuleName", headerName: "Module" },
    {
      field: "IsAllowed",
      headerName: "Allowed",
      render: (r) => (
        <AppChip
          label={r.IsAllowed ? "Yes" : "No"}
          status={r.IsAllowed ? "success" : "danger"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      render: (r) => (
        <Stack direction="row" spacing={1}>
          <AppButton size="small" variant="outlined" onClick={() => openEdit(r)}>
            Edit
          </AppButton>
          <AppButton size="small" variant="outlined" color="error" onClick={() => remove(r)}>
            Delete
          </AppButton>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <AppPageHeader
        title="Role Permissions"
        subtitle="Permissions are auto-granted when modules are assigned to a workspace. Use this page to review or fine-tune individual grants."
        actions={<AppButton onClick={openAdd}>Add Permission</AppButton>}
      />
      <AppToolbar
        searchValue={search}
        onSearchChange={(e) => setSearch(e.target.value)}
      />
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <AppDataTable
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(r) => r.RolePermissionId || r.rolePermissionId}
      />
      <AppDialog
        open={open}
        title={editing ? "Edit Role Permission" : "Add Role Permission"}
        onClose={close}
        onPrimary={save}
        disablePrimary={!form.roleId || !form.permissionId}
      >
        <Stack spacing={2}>
          <TextField
            select
            label="Role"
            value={form.roleId}
            onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            size="small"
            fullWidth
          >
            {(lookups.roles || []).map((x) => (
              <MenuItem key={x.RoleId} value={x.RoleId}>
                {x.DisplayName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Permission"
            value={form.permissionId}
            onChange={(e) => setForm({ ...form, permissionId: e.target.value })}
            size="small"
            fullWidth
          >
            {(lookups.permissions || []).map((p) => (
              <MenuItem key={p.PermissionId} value={p.PermissionId}>
                {p.PermissionName} ({p.PermissionKey})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Allowed"
            value={form.isAllowed ? "yes" : "no"}
            onChange={(e) => setForm({ ...form, isAllowed: e.target.value === "yes" })}
            size="small"
            fullWidth
          >
            <MenuItem value="yes">Grant</MenuItem>
            <MenuItem value="no">Revoke</MenuItem>
          </TextField>
        </Stack>
      </AppDialog>
    </Stack>
  );
}
