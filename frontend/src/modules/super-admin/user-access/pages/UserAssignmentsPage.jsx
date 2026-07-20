import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { AppButton, AppChip, AppDataTable, AppDialog, AppPageHeader, AppToolbar } from "@ui";
import { assignmentApi, unwrap } from "../api/userAccessApi";

const blank = {
  userId: "",
  assignmentTypeId: "",
  academicYearId: "",
  startDate: "",
  endDate: "",
  isPrimary: false,
  scopes: [],
};

const optionMap = {
  School: ["schools", "SchoolId", "SchoolName"],
  Department: ["departments", "DepartmentId", "DepartmentName"],
  Section: ["sections", "SectionId", "SectionName"],
  YearGroup: ["yearLevels", "YearLevelId", "YearLevelName"],
  Subject: ["subjects", "SubjectId", "SubjectName"],
  Location: ["locations", "LocationId", "LocationName"],
  Class: ["classes", "ClassId", "ClassName"],
  Room: ["rooms", "RoomId", "RoomName"],
};

export default function UserAssignmentsPage() {
  const [rows, setRows] = useState([]);
  const [lookups, setLookups] = useState({});
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
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const body = unwrap(
        await assignmentApi.list({ page: page + 1, pageSize, search, status })
      );
      setRows(body.items || []);
      setTotal(body.totalRows || 0);
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to load assignments.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    assignmentApi
      .lookups()
      .then((r) => setLookups(unwrap(r)))
      .catch((err) => setError(err?.response?.data?.message || "Unable to load assignment lookups."));
  }, []);

  const rules = useMemo(
    () =>
      (lookups.assignmentTypeScopeTypes || []).filter(
        (x) => String(x.AssignmentTypeId) === String(form.assignmentTypeId)
      ),
    [lookups.assignmentTypeScopeTypes, form.assignmentTypeId]
  );

  const edit = (row) => {
    setEditing(row || null);
    setForm(
      row
        ? {
            userId: row.UserId,
            assignmentTypeId: row.AssignmentTypeId,
            academicYearId: row.AcademicYearId || "",
            startDate: row.StartDate?.slice(0, 10) || "",
            endDate: row.EndDate?.slice(0, 10) || "",
            isPrimary: Boolean(row.IsPrimary),
            scopes: (row.Scopes || []).map((s) => ({
              scopeType: s.ScopeType,
              scopeEntityId: s.ScopeEntityId,
            })),
          }
        : blank
    );
    setOpen(true);
  };

  const setScope = (scopeType, ids) =>
    setForm((p) => ({
      ...p,
      scopes: [
        ...p.scopes.filter((s) => s.scopeType !== scopeType),
        ...ids.map((id) => ({ scopeType, scopeEntityId: Number(id) })),
      ],
    }));

  const save = async () => {
    try {
      setError("");
      const payload = { ...form, userId: undefined };
      if (editing) {
        await assignmentApi.update(form.userId, editing.UserAssignmentId, payload);
        setSuccess("Assignment updated successfully.");
      } else {
        await assignmentApi.create(form.userId, payload);
        setSuccess("Assignment created successfully.");
      }
      setOpen(false);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to save assignment.");
    }
  };

  const action = async (r, k) => {
    try {
      setError("");
      if (k === "primary") {
        await assignmentApi.primary(r.UserId, r.UserAssignmentId);
        setSuccess("Primary assignment updated.");
      } else if (r.IsActive) {
        await assignmentApi.deactivate(r.UserId, r.UserAssignmentId);
        setSuccess("Assignment deactivated.");
      } else {
        await assignmentApi.activate(r.UserId, r.UserAssignmentId);
        setSuccess("Assignment activated.");
      }
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to update assignment.");
    }
  };

  const columns = [
    {
      field: "FullName",
      headerName: "User",
      render: (r) => (
        <Box>
          <Typography fontWeight={600}>{r.FullName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {r.EmployeeId}
          </Typography>
        </Box>
      ),
    },
    {
      field: "AssignmentName",
      headerName: "Assignment",
      render: (r) => (
        <Chip
          label={r.AssignmentName}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: "Scopes",
      headerName: "Organizational Scopes",
      render: (r) => (
        <Typography>
          {(r.Scopes || []).map((s) => s.ScopeName).join(", ") || "No scope"}
        </Typography>
      ),
    },
    {
      field: "IsPrimary",
      headerName: "Primary",
      render: (r) => (
        <Chip
          label={r.IsPrimary ? "Primary" : "Secondary"}
          color={r.IsPrimary ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "IsActive",
      headerName: "Status",
      render: (r) => (
        <AppChip
          label={r.IsActive ? "Active" : "Inactive"}
          status={r.IsActive ? "success" : "inactive"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      render: (r) => (
        <Stack direction="row" spacing={1}>
          <AppButton
            buttonKey="USER_ASSIGNMENT_UPDATE"
            size="small"
            variant="outlined"
            onClick={() => edit(r)}
          >
            Edit
          </AppButton>
          {r.IsActive && !r.IsPrimary && (
            <AppButton
              buttonKey="USER_ASSIGNMENT_UPDATE"
              size="small"
              variant="outlined"
              onClick={() => action(r, "primary")}
            >
              Set Primary
            </AppButton>
          )}
          <AppButton
            buttonKey="USER_ASSIGNMENT_DELETE"
            size="small"
            variant="outlined"
            color={r.IsActive ? "error" : "success"}
            onClick={() => action(r, "toggle")}
          >
            {r.IsActive ? "Deactivate" : "Activate"}
          </AppButton>
        </Stack>
      ),
    },
  ];

  const select = (key, label, items, id, name) => (
    <TextField
      select
      label={label}
      value={form[key]}
      onChange={(e) =>
        setForm((p) => ({
          ...p,
          [key]: e.target.value,
          ...(key === "assignmentTypeId" ? { scopes: [] } : {}),
        }))
      }
      size="small"
      fullWidth
    >
      {items.map((x) => (
        <MenuItem key={x[id]} value={x[id]}>
          {x[name]}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Stack spacing={3}>
      <AppPageHeader
        title="User Assignments"
        subtitle="One assignment may cover multiple organizational scopes."
        actions={<AppButton buttonKey="USER_ASSIGNMENT_CREATE" onClick={() => edit(null)}>Add Assignment</AppButton>}
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
          <MenuItem value="">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </AppToolbar>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <AppDataTable
        rows={rows}
        columns={columns}
        loading={loading}
        page={page}
        rowsPerPage={pageSize}
        totalRows={total}
        onPageChange={(_, v) => setPage(v)}
        onRowsPerPageChange={(e) => {
          setPageSize(Number(e.target.value));
          setPage(0);
        }}
        getRowId={(r) => r.UserAssignmentId}
      />
      <AppDialog
        open={open}
        title={editing ? "Edit Assignment" : "Add Assignment"}
        onClose={() => setOpen(false)}
        onPrimary={save}
        disablePrimary={!form.userId || !form.assignmentTypeId || !form.academicYearId}
      >
        <Stack spacing={2}>
          {select("userId", "User", lookups.users || [], "UserId", "FullName")}
          {select(
            "assignmentTypeId",
            "Assignment Type",
            lookups.assignmentTypes || [],
            "AssignmentTypeId",
            "AssignmentName"
          )}
          {select(
            "academicYearId",
            "Academic Year",
            lookups.academicYears || [],
            "AcademicYearId",
            "AcademicYearName"
          )}
          <TextField
            type="date"
            label="Start Date"
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={form.startDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, startDate: e.target.value }))
            }
          />
          <TextField
            type="date"
            label="End Date"
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={form.endDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, endDate: e.target.value }))
            }
          />
          {rules.map((rule) => {
            const map = optionMap[rule.ScopeType];
            const items = lookups[map?.[0]] || [];
            const isSingleSelect =
              (String(form.assignmentTypeId) === "1" ||
                String(form.assignmentTypeId) === "3") &&
              (rule.ScopeType === "Section" || rule.ScopeType === "Class");
            const value = isSingleSelect
              ? form.scopes.find((s) => s.scopeType === rule.ScopeType)
                ?.scopeEntityId || ""
              : form.scopes
                  .filter((s) => s.scopeType === rule.ScopeType)
                  .map((s) => s.scopeEntityId);

            return (
              <TextField
                key={rule.ScopeType}
                select
                label={`${rule.ScopeType}${rule.IsRequired ? " *" : ""}`}
                value={value}
                onChange={(e) =>
                  setScope(rule.ScopeType, e.target.value)
                }
                size="small"
                fullWidth
                disabled={items.length === 0}
                slotProps={{
                  select: { multiple: !isSingleSelect },
                }}
              >
                {items.map((x) => (
                  <MenuItem key={x[map[1]]} value={x[map[1]]}>
                    {x[map[2]]}
                  </MenuItem>
                ))}
              </TextField>
            );
          })}
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isPrimary}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isPrimary: e.target.checked }))
                }
              />
            }
            label="Set as primary assignment"
          />
        </Stack>
      </AppDialog>
    </Stack>
  );
}
