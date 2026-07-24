// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// User Management Page
// ============================================

import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import {
  Add,
  ContentCopy,
  Edit,
  Key,
  ToggleOff,
  ToggleOn,
  UploadFile,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { AppFilterBar, AppPageHeader } from "../../../platform/ui";
import { useAuth } from "../../../context/AuthContext";
import { usePermissions } from "../../../context/PermissionContext";

import {
  getUsers,
  createUser,
  updateUser,
  activateUser,
  deactivateUser,
  resetUserPassword,
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

const initialPasswordForm = {
  generatePassword: true,
  password: "",
  confirmPassword: "",
  requirePasswordChange: true,
};

const getUserId = (user) =>
  user?.UserId ||
  user?.userId ||
  user?.id ||
  user?.Id ||
  user?.ID ||
  user?.UserID;

const getRoleValue = (role) =>
  role?.RoleKey ||
  role?.roleKey ||
  role?.RoleName ||
  role?.roleName ||
  role?.Role ||
  role?.role ||
  "";

const getRoleLabel = (role) =>
  role?.DisplayName ||
  role?.displayName ||
  role?.RoleDisplayName ||
  role?.roleDisplayName ||
  role?.RoleName ||
  role?.roleName ||
  role?.RoleKey ||
  role?.roleKey ||
  role?.Role ||
  role?.role ||
  "";

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [passwordResult, setPasswordResult] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [commitResult, setCommitResult] = useState(null);
  const currentRole = String(
    currentUser?.roleKey || currentUser?.role || currentUser?.Role || ""
  )
    .replace(/[\s_-]/g, "")
    .toLowerCase();
  const canResetPassword =
    ["superadmin", "platformadmin"].includes(currentRole) &&
    hasPermission("users.update");

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

      console.log("Load users response:", response, "usersList length:", usersList.length);
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
      const role = getRoleValue(user);

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
      role: getRoleValue(user) || "Teacher",
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
      setRoleFilter("All");
      await loadUsers();
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

  const handleOpenPasswordReset = (user) => {
    setPasswordUser(user);
    setPasswordForm(initialPasswordForm);
    setPasswordResult(null);
    setShowPassword(false);
  };

  const handleClosePasswordReset = () => {
    if (passwordLoading) return;
    setPasswordUser(null);
    setPasswordForm(initialPasswordForm);
    setPasswordResult(null);
    setShowPassword(false);
  };

  const handleResetPassword = async () => {
    const userId = getUserId(passwordUser);

    if (!userId) {
      alert("User ID missing. Please refresh the page and try again.");
      return;
    }

    if (!passwordForm.generatePassword) {
      if (passwordForm.password !== passwordForm.confirmPassword) {
        alert("Password confirmation does not match.");
        return;
      }

      if (passwordForm.password.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
      }
    }

    try {
      setPasswordLoading(true);
      const response = await resetUserPassword(userId, {
        generatePassword: passwordForm.generatePassword,
        password: passwordForm.generatePassword
          ? undefined
          : passwordForm.password,
        requirePasswordChange: passwordForm.requirePasswordChange,
      });

      const result = response?.data || response;
      const displayedPassword =
        result?.temporaryPassword ||
        (!passwordForm.generatePassword ? passwordForm.password : null);
      setPasswordResult({
        ...result,
        displayedPassword,
      });
      setShowPassword(Boolean(displayedPassword));
      setPasswordForm((current) => ({
        ...current,
        password: "",
        confirmPassword: "",
      }));
      await loadUsers();
    } catch (error) {
      console.error("Reset password error:", error);
      alert(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCopyTemporaryPassword = async () => {
    if (!passwordResult?.displayedPassword) return;

    try {
      await navigator.clipboard.writeText(passwordResult.displayedPassword);
    } catch (error) {
      console.error("Copy temporary password error:", error);
      alert("Could not copy the temporary password.");
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

      console.log("Preview import response:", data);
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

      console.log("Commit import response:", data);
      setCommitResult(data);
      setImportFile(null);
      setImportPreview(null);

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
            Required: FullName, EmployeeId, SchoolEmail, Role. Optional: Department, Subject, AssignmentKey, ScopeType, ScopeName.
            Role examples: Teacher, Admin. AssignmentKey examples: HOD, HOS, YEAR_LEADER, HOMEROOM_TEACHER, DEPUTY_HEAD.
            ScopeType examples: Department, Subject, YearGroup. ScopeName should be the actual name (e.g., Primary, English, Grade 1), not an ID.
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
              {importPreview.summary?.duplicateRows || 0}, Updates:{" "}
              {importPreview.summary?.updateRows || 0}, Ignored:{" "}
              {importPreview.summary?.ignoredRows || 0}
              {importPreview.summary?.duplicateRows > 0 && " — duplicates will be skipped before updating the database."}
            </Alert>

            {importPreview.summary?.duplicateRows > 0 && (
              <Alert severity="error" sx={{ mt: 1 }}>
                Duplicate EmployeeId or SchoolEmail detected. Rows with changes will be updated, identical rows will be ignored, and rows with errors will be skipped.
                Please review the preview below.
              </Alert>
            )}
          </>
        )}

        {commitResult && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Import committed. Imported: {commitResult.importedRows || 0}, Updated:{" "}
            {commitResult.updatedRows || 0}, Skipped: {commitResult.skippedRows || 0}
            {commitResult.errors && commitResult.errors.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" display="block">
                  Some rows were skipped:
                </Typography>
                {commitResult.errors.slice(0, 5).map((err, idx) => (
                  <Typography key={idx} variant="caption" display="block">
                    - {err.employeeId}: {err.message}
                  </Typography>
                ))}
                {commitResult.errors.length > 5 && (
                  <Typography variant="caption" display="block">
                    ...and {commitResult.errors.length - 5} more.
                  </Typography>
                )}
              </Box>
            )}
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
                        color={
                          row.validationStatus === "Valid"
                            ? "success"
                            : row.validationStatus === "Update"
                              ? "warning"
                              : row.validationStatus === "Ignored"
                                ? "default"
                                : "error"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {row.validationMessage}
                      {row.changes && row.changes.length > 0 && (
                        <Box sx={{ mt: 0.5 }}>
                          {row.changes.map((change, idx) => (
                            <Typography key={idx} variant="caption" display="block">
                              {change.field}: {change.oldValue} → {change.newValue}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </TableCell>
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
        <AppFilterBar
          contained={false}
          sx={{ mb: 2 }}
          actions={
            <Button size="small" variant="contained" startIcon={<Add />} onClick={handleAdd}>
              Add User
            </Button>
          }
        >
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
          >
            <MenuItem value="All">All Roles</MenuItem>
            {roles.map((role) => (
              <MenuItem
                key={role.RoleId || role.roleId || getRoleValue(role)}
                value={getRoleValue(role)}
              >
                {getRoleLabel(role)}
              </MenuItem>
            ))}
          </TextField>
        </AppFilterBar>

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
                const role = getRoleLabel(user) || "-";
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

                      {canResetPassword && (
                        <Tooltip title="Reset password">
                          <IconButton
                            aria-label={`Reset password for ${fullName}`}
                            onClick={() => handleOpenPasswordReset(user)}
                          >
                            <Key />
                          </IconButton>
                        </Tooltip>
                      )}

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
                  key={role.RoleId || role.roleId || getRoleValue(role)}
                  value={getRoleValue(role)}
                >
                  {getRoleLabel(role)}
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

      <Dialog
        open={Boolean(passwordUser)}
        onClose={handleClosePasswordReset}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reset User Password</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Alert severity="info">
              Existing passwords cannot be displayed. They are stored as
              one-way hashes. Resetting creates a new password.
            </Alert>

            <Box>
              <Typography fontWeight={700}>
                {passwordUser?.FullName || passwordUser?.fullName || "User"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {passwordUser?.EmployeeId || passwordUser?.employeeId || ""}
              </Typography>
            </Box>

            {!passwordResult && (
              <>
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  value={
                    passwordForm.generatePassword ? "generate" : "replace"
                  }
                  onChange={(_event, value) => {
                    if (!value) return;
                    setPasswordForm((current) => ({
                      ...current,
                      generatePassword: value === "generate",
                      password: "",
                      confirmPassword: "",
                    }));
                  }}
                  aria-label="Password reset method"
                >
                  <ToggleButton value="generate">
                    Generate Password
                  </ToggleButton>
                  <ToggleButton value="replace">
                    Set New Password
                  </ToggleButton>
                </ToggleButtonGroup>

                <Typography variant="body2" color="text.secondary">
                  Both options replace the user&apos;s current password.
                </Typography>

                {!passwordForm.generatePassword && (
                  <>
                    <TextField
                      fullWidth
                      label="New password"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.password}
                      helperText="At least 8 characters."
                      onChange={(event) =>
                        setPasswordForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip
                              title={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              <IconButton
                                aria-label={
                                  showPassword
                                    ? "Hide new password"
                                    : "Show new password"
                                }
                                edge="end"
                                onClick={() =>
                                  setShowPassword((current) => !current)
                                }
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Confirm new password"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        setPasswordForm((current) => ({
                          ...current,
                          confirmPassword: event.target.value,
                        }))
                      }
                    />
                  </>
                )}

                <FormControl>
                  <FormLabel>Require password change at next sign-in?</FormLabel>
                  <RadioGroup
                    row
                    value={
                      passwordForm.requirePasswordChange ? "yes" : "no"
                    }
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        requirePasswordChange: event.target.value === "yes",
                      }))
                    }
                  >
                    <FormControlLabel
                      value="yes"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </>
            )}

            {passwordResult && (
              <>
                <Alert severity="success">
                  Password reset successfully. The account lockout state was
                  also cleared.
                </Alert>

                {passwordResult.displayedPassword && (
                  <>
                    <TextField
                      fullWidth
                      label={
                        passwordForm.generatePassword
                          ? "Generated password"
                          : "New password"
                      }
                      type={showPassword ? "text" : "password"}
                      value={passwordResult.displayedPassword}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip
                              title={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              <IconButton
                                aria-label={
                                  showPassword
                                    ? "Hide temporary password"
                                    : "Show temporary password"
                                }
                                onClick={() =>
                                  setShowPassword((current) => !current)
                                }
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Copy password">
                              <IconButton
                                aria-label="Copy temporary password"
                                edge="end"
                                onClick={handleCopyTemporaryPassword}
                              >
                                <ContentCopy />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Typography variant="body2" color="warning.main">
                      This password is shown only now. Share it securely before
                      closing the dialog.
                    </Typography>
                  </>
                )}
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClosePasswordReset} disabled={passwordLoading}>
            {passwordResult ? "Done" : "Cancel"}
          </Button>

          {!passwordResult && (
            <Button
              variant="contained"
              startIcon={<Key />}
              onClick={handleResetPassword}
              disabled={
                passwordLoading ||
                (!passwordForm.generatePassword &&
                  (!passwordForm.password ||
                    !passwordForm.confirmPassword))
              }
            >
              {passwordLoading ? "Resetting..." : "Reset Password"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
