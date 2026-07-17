// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// User Management Page
// ============================================

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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

import {
  Add,
  Edit,
  ToggleOff,
  ToggleOn,
  UploadFile,
  AssignmentInd,
} from "@mui/icons-material";

import { AppPageHeader } from "../../../platform/ui";

import {
  getUsers,
  createUser,
  updateUser,
  activateUser,
  deactivateUser,
  previewUserImport,
  commitUserImport,
  downloadCSVUserTemplate,
  downloadExcelUserTemplate,
  exportUsers,
} from "../../../services/userService";

import { getRoles } from "../../../services/lookupService";

const initialForm = {
  fullName: "",
  employeeId: "",
  schoolEmail: "",
  role: "Teacher",
};

const getUserId = (user) =>
  user?.UserId ||
  user?.userId ||
  user?.id ||
  user?.Id ||
  user?.ID ||
  user?.UserID;

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);

  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [commitResult, setCommitResult] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await getUsers();

      const usersList =
        response?.data?.users ||
        response?.data?.items ||
        response?.data ||
        response?.users ||
        response?.items ||
        [];

      setUsers(Array.isArray(usersList) ? usersList : []);
    } catch (error) {
      console.error("Load users error:", error);
      alert(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const roleData = await getRoles();
      setRoles(roleData.roles || roleData.data || roleData || []);
    } catch (error) {
      console.error("Load lookup error:", error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadLookups();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = search.toLowerCase();

      const fullName = user.FullName || user.fullName || "";
      const employeeId = user.EmployeeId || user.employeeId || "";
      const schoolEmail = user.SchoolEmail || user.schoolEmail || "";
      const role = user.Role || user.role || user.RoleName || "";

      const matchesSearch =
        fullName.toLowerCase().includes(keyword) ||
        employeeId.toLowerCase().includes(keyword) ||
        schoolEmail.toLowerCase().includes(keyword);

      const matchesRole = roleFilter === "All" || role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleAdd = () => {
    setEditingUser(null);
    setForm(initialForm);
    setOpen(true);
  };

  const handleEdit = (user) => {
    console.log("EDIT CLICKED USER:", user);
    console.log("EDIT CLICKED USER ID:", getUserId(user));

    setEditingUser(user);

    setForm({
      fullName: user.FullName || user.fullName || "",
      employeeId: user.EmployeeId || user.employeeId || "",
      schoolEmail: user.SchoolEmail || user.schoolEmail || "",
      role: user.Role || user.role || user.RoleName || "Teacher",
    });

    setOpen(true);
  };

  const handleRoleChange = (role) => {
    setForm({
      ...form,
      role,
    });
  };

  const handleSave = async () => {
    try {
      if (!form.fullName || !form.employeeId || !form.schoolEmail || !form.role) {
        alert("Please complete all required fields");
        return;
      }

      const payload = {
        fullName: form.fullName,
        employeeId: form.employeeId,
        schoolEmail: form.schoolEmail,
        role: form.role,
      };

      if (editingUser) {
        const editingUserId = getUserId(editingUser);

        console.log("EDITING USER:", editingUser);
        console.log("EDITING USER ID:", editingUserId);
        console.log("EDIT PAYLOAD:", payload);

        if (!editingUserId) {
          alert("User ID missing. Please refresh the page and try again.");
          return;
        }

        await updateUser(editingUserId, payload);
        alert("User updated successfully");
      } else {
        await createUser(payload);
        alert(`User created successfully. Default password: ${form.employeeId}`);
      }

      setOpen(false);
      loadUsers();
    } catch (error) {
      console.error("Save user error:", error);
      alert(error.response?.data?.message || "Failed to save user");
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const userId = getUserId(user);
      const isActive = user.IsActive ?? user.isActive;

      console.log("TOGGLE USER:", user);
      console.log("TOGGLE USER ID:", userId);

      if (!userId) {
        alert("User ID missing. Please refresh the page and try again.");
        return;
      }

      if (isActive) {
        await deactivateUser(userId);
      } else {
        await activateUser(userId);
      }

      loadUsers();
    } catch (error) {
      console.error("Toggle user error:", error);
      alert(error.response?.data?.message || "Failed to update user status");
    }
  };

  const handlePreviewImport = async () => {
    if (!importFile) {
      alert("Please select a CSV or Excel file first.");
      return;
    }

    try {
      setImportLoading(true);
      setImportPreview(null);
      setCommitResult(null);

      const response = await previewUserImport(importFile);
      const data = response?.data || response;

      setImportPreview(data);
    } catch (error) {
      console.error("Preview user import error:", error);
      alert(error.response?.data?.message || "Failed to preview user import.");
    } finally {
      setImportLoading(false);
    }
  };

  const handleCommitImport = async () => {
    if (!importPreview?.batchId) {
      alert("No import batch found.");
      return;
    }

    try {
      setImportLoading(true);

      const response = await commitUserImport(importPreview.batchId);
      const data = response?.data || response;

      setCommitResult(data);
      setImportFile(null);

      await loadUsers();
    } catch (error) {
      console.error("Commit user import error:", error);
      alert(error.response?.data?.message || "Failed to commit user import.");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <Box>
      <AppPageHeader
        title="User Management"
        subtitle="Manage platform users and their main access roles"
      />

      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="h6" fontWeight={800} gutterBottom>
          Import Users
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Required columns: FullName, EmployeeId, SchoolEmail, Role. Optional: AssignmentKey, ScopeType, ScopeName
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            mb: 2,
          }}
        >
          <Button variant="outlined" onClick={downloadCSVUserTemplate}>
            Download CSV Template
          </Button>

          <Button variant="outlined" onClick={downloadExcelUserTemplate}>
            Download Excel Template
          </Button>

          <Button variant="outlined" onClick={exportUsers}>
            Export Users
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>
            Select File
            <input
              type="file"
              hidden
              accept=".csv,.xlsx,.xls"
              onChange={(e) => {
                setImportFile(e.target.files?.[0] || null);
                setImportPreview(null);
                setCommitResult(null);
              }}
            />
          </Button>

          <Typography variant="body2">
            {importFile ? importFile.name : "No file selected"}
          </Typography>

          <Button
            variant="contained"
            disabled={!importFile || importLoading}
            onClick={handlePreviewImport}
          >
            {importLoading ? "Processing..." : "Preview Import"}
          </Button>

          <Button
            variant="contained"
            color="success"
            disabled={!importPreview?.batchId || importLoading}
            onClick={handleCommitImport}
          >
            Commit Import
          </Button>
        </Box>

        {importPreview && (
          <>
            <Alert severity={importPreview.summary?.duplicateRows > 0 ? "warning" : "info"} sx={{ mt: 2 }}>
              Preview ready. Total: {importPreview.summary?.totalRows || 0}, Valid:{" "}
              {importPreview.summary?.validRows || 0}, Invalid:{" "}
              {importPreview.summary?.invalidRows || 0}, Duplicates:{" "}
              {importPreview.summary?.duplicateRows || 0}
              {importPreview.summary?.duplicateRows > 0 && " — duplicates will be skipped before updating the database."}
            </Alert>

            {importPreview.summary?.duplicateRows > 0 && (
              <Alert severity="error" sx={{ mt: 1 }}>
                Duplicate EmployeeId or SchoolEmail detected. These rows will NOT be imported.
                Please review the preview below.
              </Alert>
            )}
          </>
        )}

        {commitResult && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Import committed. Imported: {commitResult.importedRows || 0}, Skipped:{" "}
            {commitResult.skippedRows || 0}
          </Alert>
        )}

        {importPreview?.preview?.length > 0 && (
          <Box sx={{ mt: 2, maxHeight: 260, overflow: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Assignment</TableCell>
                  <TableCell>Scope</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {importPreview.preview.slice(0, 20).map((row) => (
                  <TableRow key={row.stagingId}>
                    <TableCell>{row.employeeId}</TableCell>
                    <TableCell>{row.fullName}</TableCell>
                    <TableCell>{row.schoolEmail}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>{row.assignmentKey || "-"}</TableCell>
                    <TableCell>{row.scopeType && row.scopeName ? `${row.scopeType}: ${row.scopeName}` : "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.validationStatus}
                        size="small"
                        color={row.validationStatus === "Valid" ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell>{row.validationMessage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              size="small"
              label="Search user"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <TextField
              select
              size="small"
              label="Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="All">All Roles</MenuItem>
              {roles.map((role) => (
                <MenuItem
                  key={role.RoleId || role.roleId}
                  value={role.RoleName || role.RoleKey || role.roleName}
                >
                  {role.DisplayName || role.RoleName || role.RoleKey}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
            Add User
          </Button>
        </Box>

        <Typography fontWeight={700} mb={2}>
          Total Users: {filteredUsers.length}
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Employee ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Main Role</TableCell>
                <TableCell>Assignment Summary</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredUsers.map((user) => {
                const userId = getUserId(user);
                const fullName = user.FullName || user.fullName || "-";
                const employeeId = user.EmployeeId || user.employeeId || "-";
                const schoolEmail = user.SchoolEmail || user.schoolEmail || "-";
                const role = user.Role || user.role || user.RoleName || "-";
                const assignmentSummary = user.AssignmentSummary || user.assignmentSummary || "None";
                const isActive = user.IsActive ?? user.isActive;

                return (
                  <TableRow key={userId || employeeId} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{fullName}</Typography>
                    </TableCell>

                    <TableCell>{employeeId}</TableCell>
                    <TableCell>{schoolEmail}</TableCell>

                    <TableCell>
                      <Chip label={role} size="small" />
                    </TableCell>

                    <TableCell>{assignmentSummary}</TableCell>

                    <TableCell>
                      <Chip
                        label={isActive ? "Active" : "Inactive"}
                        size="small"
                        color={isActive ? "success" : "default"}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton onClick={() => handleEdit(user)}>
                        <Edit />
                      </IconButton>

                      <IconButton title="Manage Assignments" onClick={() => navigate(`/super-admin/user-assignments?userId=${userId}`)}>
                        <AssignmentInd />
                      </IconButton>

                      <IconButton onClick={() => handleToggleStatus(user)}>
                        {isActive ? <ToggleOn /> : <ToggleOff />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!loading && filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              )}

              {loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading users...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 3,
              mt: 2,
            }}
          >
            <TextField
              fullWidth
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />

            <TextField
              fullWidth
              label="Employee ID"
              value={form.employeeId}
              disabled={!!editingUser}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            />

            <TextField
              fullWidth
              label="School Email"
              value={form.schoolEmail}
              onChange={(e) =>
                setForm({ ...form, schoolEmail: e.target.value })
              }
            />

            <TextField
              select
              fullWidth
              label="Role"
              value={form.role}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              {roles.map((role) => (
                <MenuItem
                  key={role.RoleId || role.roleId}
                  value={role.RoleName || role.RoleKey || role.roleName}
                >
                  {role.DisplayName || role.RoleName || role.RoleKey}
                </MenuItem>
              ))}
            </TextField>

          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>

          <Button variant="contained" onClick={handleSave}>
            Save User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
