// ============================================
// ARAB UNITY SCHOOL
// HOS - Subject Allocation Page
// HOS distributes department print limit to subjects
// HOD is auto-detected from backend by Department + Subject
// ============================================

import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

import { AccountBalance, Save } from "@mui/icons-material";

import {
  getSubjectLimits,
  updateSubjectLimit,
} from "../../services/limitService";

import { useAuth } from "../../context/AuthContext";

export default function SubjectAllocationPage() {
  const { user } = useAuth();

  const now = new Date();

  // HOS department ID from logged-in user
  const departmentId =
    user?.departmentId ||
    user?.DepartmentId ||
    user?.departmentID;

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [subjects, setSubjects] = useState([]);
  const [editingValues, setEditingValues] = useState({});

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================
  // Load subject limits for logged-in HOS department
  // Backend returns the auto-detected HOD per subject
  // ============================================
  const loadSubjectLimits = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!departmentId) {
        setError("Department ID not found for logged-in HOS.");
        return;
      }

      const data = await getSubjectLimits(departmentId, month, year);

      setSubjects(data || []);

      const values = {};
      (data || []).forEach((item) => {
        values[item.SubjectId] = item.SheetLimit || 0;
      });

      setEditingValues(values);
    } catch (err) {
      console.error("Load subject limits error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load subject allocation."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjectLimits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, departmentId]);

  // ============================================
  // Calculate summary
  // ============================================
  const summary = useMemo(() => {
    const departmentLimit =
      subjects.length > 0
        ? Number(subjects[0].DepartmentSheetLimit || 0)
        : 0;

    const distributed = Object.values(editingValues).reduce(
      (sum, value) => sum + Number(value || 0),
      0
    );

    const usedSheets = subjects.reduce(
      (sum, item) => sum + Number(item.UsedSheets || 0),
      0
    );

    return {
      departmentLimit,
      distributed,
      usedSheets,
      remainingToDistribute: departmentLimit - distributed,
    };
  }, [subjects, editingValues]);

  // ============================================
  // Update local input value
  // ============================================
  const handleLimitChange = (subjectId, value) => {
    setEditingValues((prev) => ({
      ...prev,
      [subjectId]: value,
    }));
  };

  // ============================================
  // Save subject allocation
  // HOD user ID comes automatically from backend data
  // ============================================
  const handleSave = async (subject) => {
    try {
      setSavingId(subject.SubjectId);
      setError("");
      setSuccess("");

      const sheetLimit = Number(editingValues[subject.SubjectId] || 0);
      const hodUserId = subject.HodUserId || null;

      if (sheetLimit < 0) {
        setError("Sheet limit cannot be negative.");
        return;
      }

      if (!hodUserId) {
        setError(
          `No HOD assigned for ${subject.SubjectName}. Please check Users table subject assignment.`
        );
        return;
      }

      await updateSubjectLimit(
        subject.SubjectId,
        departmentId,
        sheetLimit,
        month,
        year,
        hodUserId
      );

      setSuccess("Subject allocation saved successfully.");
      await loadSubjectLimits();
    } catch (err) {
      console.error("Save subject allocation error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to save subject allocation."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <DashboardLayout
      sidebar={<Sidebar role="hos" />}
      topbar={(handleMenuClick) => (
        <Topbar onMenuClick={handleMenuClick} />
      )}
    >
      <PageHeader
        title="Subject Allocation"
        subtitle="Distribute your department monthly print limit to subjects"
        icon={<AccountBalance />}
      />

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Month / Year Filter */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
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
          </Grid>
        </CardContent>
      </Card>

      {/* KPI Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ["Department Limit", summary.departmentLimit],
          ["Distributed", summary.distributed],
          ["Remaining to Allocate", summary.remainingToDistribute],
          ["Used Sheets", summary.usedSheets],
        ].map(([label, value]) => (
          <Grid item xs={12} md={3} key={label}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography color="text.secondary">{label}</Typography>
                <Typography variant="h5" fontWeight={900}>
                  {Number(value || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Subject Allocation Table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={900} mb={2}>
            Subject Limits
          </Typography>

          {loading ? (
            <Typography>Loading subject allocation...</Typography>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Limit</TableCell>
                    <TableCell>Used</TableCell>
                    <TableCell>Remaining</TableCell>
                    <TableCell>Assigned HOD</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {subjects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No subjects found.
                      </TableCell>
                    </TableRow>
                  )}

                  {subjects.map((item) => {
                    const limit = Number(editingValues[item.SubjectId] || 0);
                    const used = Number(item.UsedSheets || 0);
                    const remaining = limit - used;

                    return (
                      <TableRow key={item.SubjectId}>
                        <TableCell>
                          <Typography fontWeight={800}>
                            {item.SubjectName}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ width: 180 }}>
                          <TextField
                            type="number"
                            size="small"
                            fullWidth
                            value={editingValues[item.SubjectId] ?? 0}
                            onChange={(e) =>
                              handleLimitChange(
                                item.SubjectId,
                                e.target.value
                              )
                            }
                            inputProps={{ min: 0 }}
                          />
                        </TableCell>

                        <TableCell>{used.toLocaleString()}</TableCell>

                        <TableCell>
                          <Chip
                            label={remaining.toLocaleString()}
                            size="small"
                            color={
                              remaining <= 0
                                ? "error"
                                : remaining < 1000
                                ? "warning"
                                : "success"
                            }
                          />
                        </TableCell>

                        <TableCell>
                          {item.HodName ? (
                            <Typography fontWeight={700}>
                              {item.HodName} ({item.HodEmployeeId})
                            </Typography>
                          ) : (
                            <Chip
                              label="No HOD Assigned"
                              color="warning"
                              size="small"
                            />
                          )}
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Save />}
                            disabled={savingId === item.SubjectId}
                            onClick={() => handleSave(item)}
                          >
                            {savingId === item.SubjectId
                              ? "Saving..."
                              : "Save"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}