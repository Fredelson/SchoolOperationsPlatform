// ============================================
// ARAB UNITY SCHOOL
// Printing Admin - Access Levels Master Data
// Manage Roles / Access Levels
// System roles cannot be deleted
// ============================================

import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
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
import DeleteIcon from "@mui/icons-material/Delete";
import SecurityIcon from "@mui/icons-material/Security";

import DashboardLayout from "../../layouts/DashboardLayout";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";

import {
  getAccessLevels,
  createAccessLevel,
  updateAccessLevel,
  deleteAccessLevel,
} from "../../services/accessLevelService";

const AccessLevelsPage = () => {
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

  const [accessLevelName, setAccessLevelName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // ============================================
  // Load Access Levels
  // ============================================
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAccessLevels();

      setRecords(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.error("Fetch Access Levels Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load access levels."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ============================================
  // Search and Status Filter
  // ============================================
  useEffect(() => {
    let data = [...records];

    if (statusFilter !== "ALL") {
      const active = statusFilter === "ACTIVE";
      data = data.filter((item) => Boolean(item.IsActive) === active);
    }

    if (search.trim() !== "") {
      const keyword = search.toLowerCase();

      data = data.filter(
        (item) =>
          item.AccessLevelName?.toLowerCase().includes(keyword) ||
          item.DisplayName?.toLowerCase().includes(keyword) ||
          item.Description?.toLowerCase().includes(keyword)
      );
    }

    setFiltered(data);
  }, [records, search, statusFilter]);

  // ============================================
  // Open Add Dialog
  // ============================================
  const openAddDialog = () => {
    setEditingRecord(null);
    setAccessLevelName("");
    setDisplayName("");
    setDescription("");
    setSortOrder(0);
    setIsActive(true);
    setDialogOpen(true);
  };

  // ============================================
  // Open Edit Dialog
  // ============================================
  const openEditDialog = (record) => {
    setEditingRecord(record);

    setAccessLevelName(record.AccessLevelName || "");
    setDisplayName(record.DisplayName || "");
    setDescription(record.Description || "");
    setSortOrder(record.SortOrder || 0);
    setIsActive(Boolean(record.IsActive));

    setDialogOpen(true);
  };

  // ============================================
  // Close Dialog
  // ============================================
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRecord(null);

    setAccessLevelName("");
    setDisplayName("");
    setDescription("");
    setSortOrder(0);
    setIsActive(true);
  };

  // ============================================
  // Save Access Level
  // ============================================
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!accessLevelName.trim()) {
        setError("Access Level Name is required.");
        return;
      }

      if (!displayName.trim()) {
        setError("Display Name is required.");
        return;
      }

      const payload = {
        AccessLevelName: accessLevelName.trim(),
        DisplayName: displayName.trim(),
        Description: description.trim() || null,
        SortOrder: Number(sortOrder) || 0,
        IsActive: Boolean(isActive),
      };

      if (editingRecord) {
        await updateAccessLevel(editingRecord.AccessLevelId, payload);
        setSuccess("Access level updated successfully.");
      } else {
        await createAccessLevel(payload);
        setSuccess("Access level added successfully.");
      }

      closeDialog();
      await fetchData();
    } catch (err) {
      console.error("Save Access Level Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save access level."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // Activate / Deactivate
  // ============================================
  const handleToggleStatus = async (record) => {
    try {
      setError("");
      setSuccess("");

      const payload = {
        AccessLevelName: record.AccessLevelName,
        DisplayName: record.DisplayName,
        Description: record.Description,
        SortOrder: record.SortOrder || 0,
        IsActive: !Boolean(record.IsActive),
      };

      await updateAccessLevel(record.AccessLevelId, payload);

      setSuccess(
        `${record.DisplayName} ${
          payload.IsActive ? "activated" : "deactivated"
        } successfully.`
      );

      await fetchData();
    } catch (err) {
      console.error("Toggle Access Level Status Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update access level status."
      );
    }
  };

  // ============================================
  // Delete Access Level
  // ============================================
  const handleDelete = async (record) => {
    try {
      setError("");
      setSuccess("");

      if (record.IsSystemRole) {
        setError("System roles cannot be deleted.");
        return;
      }

      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${record.DisplayName}?`
      );

      if (!confirmDelete) return;

      await deleteAccessLevel(record.AccessLevelId);

      setSuccess("Access level deleted successfully.");
      await fetchData();
    } catch (err) {
      console.error("Delete Access Level Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete access level."
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
        title="Access Levels"
        subtitle="Manage role master data and access level records used by the system."
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

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Search Access Levels"
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
              Add Access Level
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f7fb" }}>
                <TableCell>ID</TableCell>
                <TableCell>Access Level</TableCell>
                <TableCell>Display Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Sort Order</TableCell>
                <TableCell>System Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    Loading access levels...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No access levels found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((record) => (
                  <TableRow key={record.AccessLevelId} hover>
                    <TableCell>{record.AccessLevelId}</TableCell>

                    <TableCell>
                      <Typography fontWeight={800}>
                        {record.AccessLevelName}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        {record.DisplayName}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        color="text.secondary"
                        sx={{
                          maxWidth: 280,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {record.Description || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell>{record.SortOrder ?? 0}</TableCell>

                    <TableCell>
                      <Chip
                        icon={record.IsSystemRole ? <SecurityIcon /> : null}
                        label={record.IsSystemRole ? "System" : "Custom"}
                        color={record.IsSystemRole ? "primary" : "default"}
                        size="small"
                      />
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
                        sx={{ mr: 1 }}
                      >
                        {record.IsActive ? "Deactivate" : "Activate"}
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        disabled={Boolean(record.IsSystemRole)}
                        onClick={() => handleDelete(record)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingRecord ? "Edit Access Level" : "Add Access Level"}
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Access Level Name"
            value={accessLevelName}
            onChange={(e) => setAccessLevelName(e.target.value)}
            disabled={Boolean(editingRecord?.IsSystemRole)}
            sx={{ mt: 1 }}
          />

          <TextField
            fullWidth
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            type="number"
            label="Sort Order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            sx={{ mt: 2 }}
          />

          {editingRecord && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                select
                label="Status"
                value={isActive ? "ACTIVE" : "INACTIVE"}
                onChange={(e) =>
                  setIsActive(e.target.value === "ACTIVE")
                }
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </TextField>
            </Box>
          )}
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

export default AccessLevelsPage;