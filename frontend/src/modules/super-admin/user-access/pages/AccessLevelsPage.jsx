import { useCallback, useEffect, useState } from "react";
import { Alert, Checkbox, FormControlLabel, Stack, TextField } from "@mui/material";
import { AppButton, AppChip, AppDataTable, AppDialog, AppPageHeader, AppToolbar } from "@ui";
import { accessLevelApi, unwrap } from "../api/userAccessApi";

const empty = {
  accessLevelKey: "",
  accessLevelName: "",
  displayName: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

export default function AccessLevelsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const body = unwrap(
        await accessLevelApi.list({ page: page + 1, pageSize, search, status })
      );
      setRows(body.items || []);
      setTotal(body.totalRows || 0);
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to load access levels.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...empty });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      accessLevelKey: row.AccessLevelKey,
      accessLevelName: row.AccessLevelName,
      displayName: row.DisplayName,
      description: row.Description || "",
      sortOrder: row.SortOrder,
      isActive: row.IsActive,
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm({ ...empty });
  };

  const save = async () => {
    try {
      setError("");
      if (editing) {
        await accessLevelApi.update(editing.AccessLevelId, form);
        setSuccess("Access level updated successfully.");
      } else {
        await accessLevelApi.create(form);
        setSuccess("Access level created successfully.");
      }
      close();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to save access level.");
    }
  };

  const toggle = async (row) => {
    try {
      setError("");
      if (row.IsActive) {
        await accessLevelApi.deactivate(row.AccessLevelId);
        setSuccess("Access level deactivated.");
      } else {
        await accessLevelApi.activate(row.AccessLevelId);
        setSuccess("Access level activated.");
      }
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to update access level.");
    }
  };

  const remove = async (row) => {
    if (row.IsSystemLevel) {
      setError("System access levels cannot be deleted.");
      return;
    }
    if (!window.confirm("Delete this access level?")) return;
    try {
      setError("");
      await accessLevelApi.remove(row.AccessLevelId);
      setSuccess("Access level deleted.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to delete access level.");
    }
  };

  return (
    <Stack spacing={3}>
      <AppPageHeader
        title="Access Levels"
        subtitle="Manage enterprise access hierarchy."
        actions={<AppButton onClick={openAdd}>Add Access Level</AppButton>}
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
          label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </TextField>
      </AppToolbar>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <AppDataTable
        rows={rows}
        columns={[
          { field: "DisplayName", headerName: "Access Level" },
          { field: "AccessLevelKey", headerName: "Key" },
          { field: "Description", headerName: "Description" },
          {
            field: "IsActive",
            headerName: "Status",
            render: (row) => (
              <AppChip
                label={row.IsActive ? "Active" : "Inactive"}
                status={row.IsActive ? "success" : "inactive"}
              />
            ),
          },
          {
            field: "actions",
            headerName: "Actions",
            render: (row) => (
              <Stack direction="row" spacing={1}>
                <AppButton
                  buttonKey="ACCESS_LEVEL_UPDATE"
                  size="small"
                  variant="outlined"
                  onClick={() => openEdit(row)}
                >
                  View / Edit
                </AppButton>
                <AppButton
                  buttonKey="ACCESS_LEVEL_UPDATE"
                  size="small"
                  variant="outlined"
                  onClick={() => toggle(row)}
                >
                  {row.IsActive ? "Deactivate" : "Activate"}
                </AppButton>
                {!row.IsSystemLevel && (
                  <AppButton
                    buttonKey="ACCESS_LEVEL_DELETE"
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => remove(row)}
                  >
                    Delete
                  </AppButton>
                )}
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
        getRowId={(row) => row.AccessLevelId}
      />
      <AppDialog
        open={open}
        title={editing ? "Edit Access Level" : "Add Access Level"}
        onClose={close}
        onPrimary={save}
        disablePrimary={!form.accessLevelKey || !form.accessLevelName || !form.displayName}
      >
        <Stack spacing={2}>
          <TextField
            label="Key"
            value={form.accessLevelKey}
            disabled={Boolean(editing?.IsSystemLevel)}
            onChange={(e) => setForm({ ...form, accessLevelKey: e.target.value })}
          />
          <TextField
            label="Name"
            value={form.accessLevelName}
            disabled={Boolean(editing?.IsSystemLevel)}
            onChange={(e) => setForm({ ...form, accessLevelName: e.target.value })}
          />
          <TextField
            label="Display Name"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
          <TextField
            label="Description"
            multiline
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <TextField
            label="Sort Order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
            }
            label="Active"
          />
        </Stack>
      </AppDialog>
    </Stack>
  );
}
