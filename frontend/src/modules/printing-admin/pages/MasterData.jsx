// ============================================
// ARAB UNITY SCHOOL
// Printing Admin - Master Data Management
// Manage Subjects, Sections, and Purposes
// No hard delete: activate / deactivate only
// ============================================

import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
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

import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

import DashboardLayout from "../../../components/layout/DashboardLayout";
import Sidebar from "../../../components/sidebar/Sidebar";
import Topbar from "../../../components/common/Topbar";
import PageHeader from "../../../components/common/PageHeader";

import {
  getMasterData,
  createMasterData,
  updateMasterData,
  updateMasterStatus,
} from "../../../services/masterService";

const tabs = [
  { label: "Subjects", type: "subjects" },
  { label: "Departments", type: "departments" },
  { label: "Purposes", type: "purposes" },
];

const MasterData = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [name, setName] = useState("");

  const currentType = tabs[activeTab].type;
  const currentLabel = tabs[activeTab].label;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMasterData(currentType);

      setRecords(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.error("Fetch Master Data Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load master data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentType]);

  useEffect(() => {
    let data = [...records];

    if (statusFilter !== "ALL") {
      const isActive = statusFilter === "ACTIVE";
      data = data.filter((item) => Boolean(item.IsActive) === isActive);
    }

    if (search.trim() !== "") {
      const keyword = search.toLowerCase();
      data = data.filter((item) =>
        item.Name?.toLowerCase().includes(keyword)
      );
    }

    setFiltered(data);
  }, [records, search, statusFilter]);

  const openAddDialog = () => {
    setEditingRecord(null);
    setName("");
    setDialogOpen(true);
  };

  const openEditDialog = (record) => {
    setEditingRecord(record);
    setName(record.Name || "");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRecord(null);
    setName("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!name.trim()) {
        setError("Name is required.");
        return;
      }

      if (editingRecord) {
        await updateMasterData(currentType, editingRecord.Id, {
          name: name.trim(),
        });

        setSuccess(`${currentLabel} updated successfully.`);
      } else {
        await createMasterData(currentType, {
          name: name.trim(),
        });

        setSuccess(`${currentLabel} added successfully.`);
      }

      closeDialog();
      await fetchData();
    } catch (err) {
      console.error("Save Master Data Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save master data."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (record) => {
    try {
      setError("");
      setSuccess("");

      const newStatus = !record.IsActive;

      await updateMasterStatus(currentType, record.Id, newStatus);

      setSuccess(
        `${record.Name} ${newStatus ? "activated" : "deactivated"} successfully.`
      );

      await fetchData();
    } catch (err) {
      console.error("Toggle Status Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update status."
      );
    }
  };

  return (
    <DashboardLayout
      sidebar={<Sidebar role="printing" />}
      topbar={(handleMenuClick) => (
        <Topbar onMenuClick={handleMenuClick} />
      )}
    >
      <PageHeader
        title="Master Data"
        subtitle="Manage subjects, sections, and purposes used in photocopy requests."
      />

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 3, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => {
            setActiveTab(newValue);
            setSearch("");
            setStatusFilter("ALL");
            setSuccess("");
            setError("");
          }}
          sx={{ px: 2 }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.type}
              label={tab.label}
              icon={<SettingsIcon />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label={`Search ${currentLabel}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAddDialog}
              sx={{
                height: 56,
                fontWeight: 800,
                bgcolor: "#2E8B3C",
                "&:hover": {
                  bgcolor: "#256f31",
                },
              }}
            >
              Add {currentLabel.slice(0, -1)}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f7fb" }}>
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
                    Loading {currentLabel.toLowerCase()}...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((record) => (
                  <TableRow key={record.Id} hover>
                    <TableCell>{record.Id}</TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        {record.Name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={record.IsActive ? "Active" : "Inactive"}
                        color={record.IsActive ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => openEditDialog(record)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color={record.IsActive ? "error" : "success"}
                        onClick={() => handleToggleStatus(record)}
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

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingRecord
            ? `Edit ${currentLabel.slice(0, -1)}`
            : `Add ${currentLabel.slice(0, -1)}`}
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              bgcolor: "#2E8B3C",
              fontWeight: 800,
              "&:hover": {
                bgcolor: "#256f31",
              },
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default MasterData;
