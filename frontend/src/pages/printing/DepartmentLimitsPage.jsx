// ============================================
// ARAB UNITY SCHOOL
// Printing Admin - Department Limits Page
// Allows Printing Admin to assign monthly sheet limits
// Includes DashboardLayout, Sidebar, and Topbar
// ============================================

import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";

import { AccountBalance, Save, Refresh } from "@mui/icons-material";

// ============================================
// Layout Components
// ============================================
import DashboardLayout from "../../layouts/DashboardLayout";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";

// ============================================
// Auth Context
// ============================================
import { useAuth } from "../../context/AuthContext";

// ============================================
// API Services
// ============================================
import {
  getDepartmentLimits,
  updateDepartmentLimit,
} from "../../services/limitService";

// ============================================
// Theme Colors
// ============================================
const GREEN = "#2E8B3C";
const NAVY = "#071B4D";

export default function DepartmentLimitsPage() {
  // ============================================
  // Logged-in User
  // ============================================
  const { user } = useAuth();

  // ============================================
  // Current Month and Year
  // ============================================
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // ============================================
  // Page State
  // ============================================
  const [limits, setLimits] = useState([]);
  const [editingValues, setEditingValues] = useState({});

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ============================================
  // Load Department Limits From Backend
  // ============================================
  const loadDepartmentLimits = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await getDepartmentLimits(month, year);

      setLimits(data || []);

      // Prepare editable input values per department
      const values = {};

      (data || []).forEach((item) => {
        values[item.DepartmentId] = item.SheetLimit || 0;
      });

      setEditingValues(values);
    } catch (err) {
      console.error("Load department limits error:", err);

      setError(
        err?.response?.data?.message || "Failed to load department limits."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Reload Data When Month or Year Changes
  // ============================================
  useEffect(() => {
    loadDepartmentLimits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  // ============================================
  // Summary KPI Calculations
  // ============================================
  const summary = useMemo(() => {
    const totalLimit = limits.reduce(
      (sum, item) => sum + Number(item.SheetLimit || 0),
      0
    );

    const totalUsed = limits.reduce(
      (sum, item) => sum + Number(item.UsedSheets || 0),
      0
    );

    const totalRemaining = totalLimit - totalUsed;

    return {
      totalLimit,
      totalUsed,
      totalRemaining,
      departmentCount: limits.length,
    };
  }, [limits]);

  // ============================================
  // Update Local Input Value
  // ============================================
  const handleLimitChange = (departmentId, value) => {
    setEditingValues((prev) => ({
      ...prev,
      [departmentId]: value,
    }));
  };

  // ============================================
  // Save Department Limit
  // ============================================
  const handleSave = async (departmentId) => {
    try {
      setSavingId(departmentId);
      setError("");
      setSuccess("");

      const sheetLimit = Number(editingValues[departmentId] || 0);

      if (sheetLimit < 0) {
        setError("Sheet limit cannot be negative.");
        return;
      }

      await updateDepartmentLimit(departmentId, sheetLimit, month, year);

      setSuccess("Department limit saved successfully.");

      // Reload after save so used and remaining values stay updated
      await loadDepartmentLimits();
    } catch (err) {
      console.error("Save department limit error:", err);

      setError(
        err?.response?.data?.message || "Failed to save department limit."
      );
    } finally {
      setSavingId(null);
    }
  };

  // ============================================
  // Remaining Chip Color
  // ============================================
  const getRemainingColor = (remaining) => {
    if (remaining <= 0) return "error";
    if (remaining < 1000) return "warning";
    return "success";
  };

  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      topbar={
        <Topbar
          userName={
            user?.fullName || user?.FullName || "Printing Admin"
          }
          role={
            user?.displayRole ||
            user?.role ||
            user?.Role ||
            "Printing Admin"
          }
        />
      }
    >
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <PageHeader
          title="Department Print Limits"
          subtitle="Assign monthly sheet limits for each department"
          icon={<AccountBalance />}
        />

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Month and Year Filters */}
        <Card
          sx={{
            borderRadius: 4,
            mb: 3,
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  label="Month"
                  type="number"
                  fullWidth
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  inputProps={{ min: 1, max: 12 }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="Year"
                  type="number"
                  fullWidth
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadDepartmentLimits}
                  sx={{
                    height: 56,
                    borderColor: GREEN,
                    color: GREEN,
                    fontWeight: 800,
                  }}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* KPI Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography color="text.secondary" fontWeight={700}>
                  Departments
                </Typography>
                <Typography variant="h4" fontWeight={900} color={NAVY}>
                  {summary.departmentCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography color="text.secondary" fontWeight={700}>
                  Total Limit
                </Typography>
                <Typography variant="h4" fontWeight={900} color={NAVY}>
                  {summary.totalLimit.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography color="text.secondary" fontWeight={700}>
                  Used Sheets
                </Typography>
                <Typography variant="h4" fontWeight={900} color={NAVY}>
                  {summary.totalUsed.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography color="text.secondary" fontWeight={700}>
                  Remaining
                </Typography>
                <Typography variant="h4" fontWeight={900} color={GREEN}>
                  {summary.totalRemaining.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Department Limits Table */}
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={900} mb={2}>
              Monthly Department Limits
            </Typography>

            {loading ? (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <b>Department</b>
                      </TableCell>

                      <TableCell>
                        <b>Limit</b>
                      </TableCell>

                      <TableCell>
                        <b>Used</b>
                      </TableCell>

                      <TableCell>
                        <b>Remaining</b>
                      </TableCell>

                      <TableCell align="right">
                        <b>Action</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {limits.map((item) => {
                      const currentLimit = Number(
                        editingValues[item.DepartmentId] || 0
                      );

                      const usedSheets = Number(item.UsedSheets || 0);

                      const remaining = currentLimit - usedSheets;

                      return (
                        <TableRow key={item.DepartmentId} hover>
                          <TableCell>
                            <Typography fontWeight={800}>
                              {item.DepartmentName}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ width: 220 }}>
                            <TextField
                              type="number"
                              size="small"
                              fullWidth
                              value={
                                editingValues[item.DepartmentId] ?? 0
                              }
                              onChange={(e) =>
                                handleLimitChange(
                                  item.DepartmentId,
                                  e.target.value
                                )
                              }
                              inputProps={{ min: 0 }}
                            />
                          </TableCell>

                          <TableCell>
                            {usedSheets.toLocaleString()}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={remaining.toLocaleString()}
                              color={getRemainingColor(remaining)}
                              size="small"
                              sx={{ fontWeight: 800 }}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Button
                              variant="contained"
                              startIcon={<Save />}
                              disabled={savingId === item.DepartmentId}
                              onClick={() =>
                                handleSave(item.DepartmentId)
                              }
                              sx={{
                                bgcolor: GREEN,
                                fontWeight: 800,
                                "&:hover": {
                                  bgcolor: "#256f31",
                                },
                              }}
                            >
                              {savingId === item.DepartmentId
                                ? "Saving..."
                                : "Save"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {limits.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No departments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}