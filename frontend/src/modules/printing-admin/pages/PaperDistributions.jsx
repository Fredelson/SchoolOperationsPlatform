// ============================================
// ARAB UNITY SCHOOL
// Printing Admin - Paper Distributions Page
// Auto-search employee while typing
// Auto-fill Department and Issued To
// Deduct inventory when distribution is saved
// ============================================

import { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";



import {
  getDistributions,
  addDistribution,
  searchDistributionUsers,
} from "../../../services/distributionService";

export default function PaperDistributions() {

  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Search box state
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state
  // issuedTo = Department
  // receivedByName = Person issued to
  const [form, setForm] = useState({
    paperType: "A4",
    bundlesIssued: "",
    issuedTo: "",
    receivedByName: "",
    requestedByUserId: null,
    departmentId: null,
    issuedDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadDistributions();
  }, []);

  // Auto search while typing
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      try {
        if (selectedUser) return;

        if (userSearch.trim().length < 2) {
          setUserResults([]);
          return;
        }

        const data = await searchDistributionUsers(userSearch);
        setUserResults(data || []);
      } catch (err) {
        console.error("Auto search error:", err);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [userSearch, selectedUser]);

  const loadDistributions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDistributions();
      setDistributions(data || []);
    } catch (err) {
      console.error("Load distributions error:", err);
      setError("Failed to load distributions.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectUser = (userItem) => {
    setSelectedUser(userItem);

    setForm((prev) => ({
      ...prev,
      issuedTo: userItem.DepartmentName || "",
      receivedByName: userItem.FullName || "",
      requestedByUserId: userItem.UserId,
      departmentId: userItem.DepartmentId,
    }));

    setUserSearch(`${userItem.EmployeeId} - ${userItem.FullName}`);
    setUserResults([]);
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
    setUserSearch("");
    setUserResults([]);

    setForm((prev) => ({
      ...prev,
      issuedTo: "",
      receivedByName: "",
      requestedByUserId: null,
      departmentId: null,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccess("");
      setError("");

      if (!selectedUser) {
        setError("Please select an employee first.");
        return;
      }

      if (!form.bundlesIssued || Number(form.bundlesIssued) <= 0) {
        setError("Bundles issued must be greater than 0.");
        return;
      }

      await addDistribution({
        paperType: form.paperType,
        bundlesIssued: Number(form.bundlesIssued),
        issuedTo: form.issuedTo,
        receivedByName: form.receivedByName,
        requestedByUserId: form.requestedByUserId,
        departmentId: form.departmentId,
        issuedDate: form.issuedDate,
      });

      setSuccess("Distribution saved and inventory deducted.");

      setUserSearch("");
      setUserResults([]);
      setSelectedUser(null);

      setForm({
        paperType: "A4",
        bundlesIssued: "",
        issuedTo: "",
        receivedByName: "",
        requestedByUserId: null,
        departmentId: null,
        issuedDate: new Date().toISOString().split("T")[0],
      });

      await loadDistributions();
    } catch (err) {
      console.error("Save distribution error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to save distribution."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Paper Distributions
        </Typography>

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

        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Add Distribution
            </Typography>

            <Grid container spacing={2}>
              {/* Search employee */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Search Employee ID / Name"
                  placeholder="Type Employee ID or Name..."
                  fullWidth
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setSelectedUser(null);

                    setForm((prev) => ({
                      ...prev,
                      issuedTo: "",
                      receivedByName: "",
                      requestedByUserId: null,
                      departmentId: null,
                    }));
                  }}
                />
              </Grid>

              {/* Clear selected user */}
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={clearSelectedUser}
                  sx={{
                    height: 56,
                    fontWeight: 800,
                  }}
                >
                  Clear
                </Button>
              </Grid>

              {/* Auto suggestions */}
              {userResults.length > 0 && (
                <Grid item xs={12}>
                  <Paper variant="outlined">
                    <List dense>
                      {userResults.map((item, index) => (
                        <Box key={item.UserId}>
                          <ListItemButton
                            onClick={() => handleSelectUser(item)}
                          >
                            <ListItemText
                              primary={`${item.EmployeeId} - ${item.FullName}`}
                              secondary={`Department: ${
                                item.DepartmentName || "No Department"
                              } | Role: ${item.Role}`}
                            />
                          </ListItemButton>

                          {index < userResults.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              )}

              {/* Selected user summary */}
              {selectedUser && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <strong>Issued To:</strong> {form.receivedByName}
                    <br />
                    <strong>Department:</strong> {form.issuedTo || "No Department"}
                    <br />
                    <strong>Employee ID:</strong> {selectedUser.EmployeeId}
                  </Alert>
                </Grid>
              )}

              {/* Paper type */}
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Paper Type"
                  fullWidth
                  value={form.paperType}
                  onChange={(e) =>
                    handleChange("paperType", e.target.value)
                  }
                >
                  <MenuItem value="A4">A4</MenuItem>
                  <MenuItem value="A3">A3</MenuItem>
                </TextField>
              </Grid>

              {/* Bundles issued */}
              <Grid item xs={12} md={3}>
                <TextField
                  label="Bundles Issued"
                  type="number"
                  fullWidth
                  value={form.bundlesIssued}
                  onChange={(e) =>
                    handleChange("bundlesIssued", e.target.value)
                  }
                />
              </Grid>

              {/* Issued date */}
              <Grid item xs={12} md={3}>
                <TextField
                  label="Issued Date"
                  type="date"
                  fullWidth
                  value={form.issuedDate}
                  onChange={(e) =>
                    handleChange("issuedDate", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Save */}
              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={saving}
                  onClick={handleSave}
                  sx={{
                    height: 56,
                    bgcolor: "#2E8B3C",
                    fontWeight: 800,
                    "&:hover": {
                      bgcolor: "#256f31",
                    },
                  }}
                >
                  {saving ? "Saving..." : "Save Distribution"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Paper Type</TableCell>
                  <TableCell>Bundles Issued</TableCell>
                  <TableCell>Total Sheets</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Issued To</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {distributions.map((item) => (
                  <TableRow key={item.DistributionId}>
                    <TableCell>
                      {new Date(item.IssuedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{item.PaperType}</TableCell>
                    <TableCell>{item.BundlesIssued}</TableCell>
                    <TableCell>
                      {Number(item.TotalSheets).toLocaleString()}
                    </TableCell>
                    <TableCell>{item.IssuedTo}</TableCell>
                    <TableCell>{item.ReceivedByName || "-"}</TableCell>
                  </TableRow>
                ))}

                {distributions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No distributions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  );
}
