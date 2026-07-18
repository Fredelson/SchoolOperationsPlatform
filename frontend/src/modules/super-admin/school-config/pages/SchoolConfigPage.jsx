import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../../../components/common/PageHeader";
import {
  createMasterData,
  getMasterData,
  updateMasterData,
  updateMasterStatus,
} from "../../../../services/masterService";
import AccessLevelsPage from "../../user-access/pages/AccessLevelsPage";

const sections = [
  { label: "Subjects", value: "subjects" },
  { label: "Departments", value: "departments" },
  { label: "Sections", value: "sections" },
  { label: "Access Levels", value: "access-levels" },
];

export default function SchoolConfigPage({ section = "subjects" }) {
  const navigate = useNavigate();
  const current = sections.find((item) => item.value === section) || sections[0];

  return (
    <Stack spacing={2.5}>
      <Paper variant="outlined" sx={{ overflowX: "auto" }}>
        <Tabs
          value={current.value}
          onChange={(_, value) =>
            navigate(`/super-admin/school-configuration/${value}`)
          }
          variant="scrollable"
          scrollButtons="auto"
          aria-label="School configuration sections"
        >
          {sections.map((item) => (
            <Tab
              key={item.value}
              value={item.value}
              label={item.label}
              icon={<SettingsOutlinedIcon />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {current.value === "access-levels" ? (
        <AccessLevelsPage />
      ) : (
        <SchoolMasterData type={current.value} label={current.label} />
      )}
    </Stack>
  );
}

function SchoolMasterData({ type, label }) {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [name, setName] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setRecords((await getMasterData(type)) || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || `Unable to load ${label.toLowerCase()}.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearch("");
    setStatusFilter("ALL");
    setSuccess("");
    setError("");
    load();
    // Reload when the selected school configuration type changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        Boolean(record.IsActive) === (statusFilter === "ACTIVE");
      const matchesSearch =
        !keyword || String(record.Name || "").toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [records, search, statusFilter]);

  const openDialog = (record = null) => {
    setEditingRecord(record);
    setName(record?.Name || "");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRecord(null);
    setName("");
  };

  const save = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingRecord) {
        await updateMasterData(type, editingRecord.Id, { name: trimmedName });
        setSuccess(`${label.slice(0, -1)} updated successfully.`);
      } else {
        await createMasterData(type, { name: trimmedName });
        setSuccess(`${label.slice(0, -1)} added successfully.`);
      }

      closeDialog();
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save the record.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (record) => {
    try {
      setError("");
      setSuccess("");
      await updateMasterStatus(type, record.Id, !record.IsActive);
      setSuccess(
        `${record.Name} ${record.IsActive ? "deactivated" : "activated"} successfully.`
      );
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update the record status."
      );
    }
  };

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={`School Configuration: ${label}`}
        subtitle={`Manage the ${label.toLowerCase()} used across the school platform.`}
      />

      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <TextField
          fullWidth
          size="small"
          label={`Search ${label}`}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          sx={{ minWidth: { xs: "100%", md: 180 } }}
        >
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="INACTIVE">Inactive</MenuItem>
        </TextField>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openDialog()}
          sx={{ minWidth: { md: 190 }, whiteSpace: "nowrap" }}
        >
          Add {label.slice(0, -1)}
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    Loading {label.toLowerCase()}...
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No records found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.Id} hover>
                    <TableCell>{record.Id}</TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>{record.Name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={record.IsActive ? "Active" : "Inactive"}
                        color={record.IsActive ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => openDialog(record)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color={record.IsActive ? "error" : "success"}
                        onClick={() => toggleStatus(record)}
                        sx={{ ml: 1 }}
                      >
                        {record.IsActive ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingRecord ? "Edit" : "Add"} {label.slice(0, -1)}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
