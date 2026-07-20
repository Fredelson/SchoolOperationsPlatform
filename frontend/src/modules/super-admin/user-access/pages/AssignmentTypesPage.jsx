import { useCallback, useEffect, useState } from "react";
import { Alert, Checkbox, FormControlLabel, Stack, TextField } from "@mui/material";
import { AppButton, AppChip, AppDataTable, AppDialog, AppPageHeader, AppToolbar } from "@ui";
import { assignmentApi, unwrap } from "../api/userAccessApi";

const empty = {
  assignmentKey: "",
  assignmentName: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

export default function AssignmentTypesPage() {
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
        await assignmentApi.types({ page: page + 1, pageSize, search, status })
      );
      setRows(body.items || []);
      setTotal(body.totalRows || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load assignment types.");
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
      assignmentKey: row.AssignmentKey,
      assignmentName: row.AssignmentName,
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
        await assignmentApi.updateType(editing.AssignmentTypeId, form);
        setSuccess("Assignment type updated successfully.");
      } else {
        await assignmentApi.createType(form);
        setSuccess("Assignment type created successfully.");
      }
      close();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save assignment type.");
    }
  };

  const toggle = async (row) => {
    try {
      setError("");
      if (row.IsActive) {
        await assignmentApi.deactivateType(row.AssignmentTypeId);
        setSuccess("Assignment type deactivated.");
      } else {
        await assignmentApi.activateType(row.AssignmentTypeId);
        setSuccess("Assignment type activated.");
      }
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update assignment type.");
    }
  };

  const remove = async (row) => {
    if (row.IsSystemAssignment) {
      setError("System assignment types cannot be deleted.");
      return;
    }
    if (!window.confirm("Delete this assignment type?")) return;
    try {
      setError("");
      await assignmentApi.deleteType(row.AssignmentTypeId);
      setSuccess("Assignment type deleted.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete assignment type.");
    }
  };

  return (
    <Stack spacing={3}>
      <AppPageHeader
        title="Assignment Types"
        subtitle="Manage assignment types used by User Assignments."
        actions={<AppButton onClick={openAdd}>Add Assignment Type</AppButton>}
      />
      <AppToolbar
        searchValue={search}
        onSearchChange={(event) => {
          setSearch(event.target.value);
          setPage(0);
        }}
      >
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
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
          { field: "AssignmentName", headerName: "Assignment Type" },
          { field: "AssignmentKey", headerName: "Key" },
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
                  buttonKey="ASSIGNMENT_TYPE_UPDATE"
                  size="small"
                  variant="outlined"
                  onClick={() => openEdit(row)}
                >
                  View / Edit
                </AppButton>
                <AppButton
                  buttonKey="ASSIGNMENT_TYPE_UPDATE"
                  size="small"
                  variant="outlined"
                  onClick={() => toggle(row)}
                >
                  {row.IsActive ? "Deactivate" : "Activate"}
                </AppButton>
                {!row.IsSystemAssignment && (
                  <AppButton
                    buttonKey="ASSIGNMENT_TYPE_DELETE"
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
        onPageChange={(_, value) => setPage(value)}
        onRowsPerPageChange={(event) => {
          setPageSize(Number(event.target.value));
          setPage(0);
        }}
        getRowId={(row) => row.AssignmentTypeId}
      />
      <AppDialog
        open={open}
        title={editing ? "Edit Assignment Type" : "Add Assignment Type"}
        onClose={close}
        onPrimary={save}
        disablePrimary={!form.assignmentKey || !form.assignmentName}
      >
        <Stack spacing={2}>
          <TextField
            label="Key"
            value={form.assignmentKey}
            disabled={Boolean(editing?.IsSystemAssignment)}
            onChange={(e) => setForm({ ...form, assignmentKey: e.target.value })}
          />
          <TextField
            label="Name"
            value={form.assignmentName}
            onChange={(e) => setForm({ ...form, assignmentName: e.target.value })}
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
