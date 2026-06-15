// ============================================
// ARAB UNITY SCHOOL
// Printing Admin Dashboard
// Connected to Backend Live Data
// Includes Printing KPIs, Limit KPIs,
// Print Queue, and Recent Printing History
// ============================================

import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";
import DateFilter from "../../components/common/DateFilter";

import {
  Alert,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  Assignment,
  Print,
  PendingActions,
  CheckCircle,
} from "@mui/icons-material";

import KPIGrid from "../../components/dashboard/KPIGrid";
import DashboardCard from "../../components/dashboard/DashboardCard";



import { useAuth } from "../../context/AuthContext";

import {
  getPrintingDashboard,
  getPrintingRequests,
  getPrintingHistory,
  startPrintingRequest,
  completePrintingRequest,
} from "../../services/printingService";

import { getDepartmentLimits } from "../../services/limitService";

export default function PrintingDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState({
    TotalAssigned: 0,
    PendingPrintQueue: 0,
    InProgress: 0,
    Completed: 0,
    CompletedToday: 0,
  });

  const [limitSummary, setLimitSummary] = useState({
    monthlyLimit: 0,
    usedSheets: 0,
    remainingSheets: 0,
  });

  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mapRequest = (item) => ({
    id: item.RequestId,
    requestNumber: item.RequestNumber,
    teacher: item.TeacherName,
    employeeId: item.EmployeeId,
    department: item.DepartmentName,
    subject: item.SubjectName,
    purpose: item.PurposeName,
    copies: item.Copies,
    pages: item.TotalPages,
    sheets: item.TotalSheets,
    priority: item.PriorityLevel,
    status: item.Status,
    paperSize: item.PaperSize,
    printType: item.PrintType,
    printSide: item.PrintSide,
    isExam: item.IsExam,
    requestRemarks: item.RequestRemarks,
    submittedDate: item.SubmittedAt
      ? new Date(item.SubmittedAt).toLocaleDateString()
      : "-",
    approvedDate: item.ApprovedAt
      ? new Date(item.ApprovedAt).toLocaleDateString()
      : "-",
    printedDate: item.PrintedAt
      ? new Date(item.PrintedAt).toLocaleDateString()
      : "-",
    completedDate: item.CompletedAt
      ? new Date(item.CompletedAt).toLocaleDateString()
      : "-",
  });

  const mapHistory = (item) => ({
    id: item.PrintingLogId,
    requestId: item.RequestId,
    requestNumber: item.RequestNumber,
    teacher: item.TeacherName,
    employeeId: item.EmployeeId,
    department: item.DepartmentName,
    subject: item.SubjectName,
    purpose: item.PurposeName,
    printedBy: item.PrintedByName,
    printedPages: item.PrintedPages,
    printedSheets: item.PrintedSheets,
    remarks: item.Remarks,
    status: item.Status,
    printedDate: item.PrintedAt
      ? new Date(item.PrintedAt).toLocaleDateString()
      : "-",
  });

  const fetchPrintingData = async () => {
    try {
      setLoading(true);
      setError("");

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [
        dashboardData,
        requestsData,
        historyData,
        departmentLimitsData,
      ] = await Promise.all([
        getPrintingDashboard(),
        getPrintingRequests(),
        getPrintingHistory(),
        getDepartmentLimits(currentMonth, currentYear),
      ]);

      setDashboard({
        TotalAssigned: dashboardData.TotalAssigned || 0,
        PendingPrintQueue: dashboardData.PendingPrintQueue || 0,
        InProgress: dashboardData.InProgress || 0,
        Completed: dashboardData.Completed || 0,
        CompletedToday: dashboardData.CompletedToday || 0,
      });

      setRequests((requestsData || []).map(mapRequest));
      setHistory((historyData || []).map(mapHistory));

      const monthlyLimit = (departmentLimitsData || []).reduce(
        (sum, item) => sum + Number(item.SheetLimit || 0),
        0
      );

      const usedSheets = (departmentLimitsData || []).reduce(
        (sum, item) => sum + Number(item.UsedSheets || 0),
        0
      );

      const remainingSheets = (departmentLimitsData || []).reduce(
        (sum, item) => sum + Number(item.RemainingSheets || 0),
        0
      );

      setLimitSummary({
        monthlyLimit,
        usedSheets,
        remainingSheets,
      });
    } catch (err) {
      console.error(
        "Fetch Printing Data Error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load printing dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrintingData();
  }, []);

  const handleStartPrinting = async (requestId) => {
    try {
      await startPrintingRequest(requestId);
      alert("Printing started successfully.");
      await fetchPrintingData();
    } catch (err) {
      console.error(
        "Start Printing Error:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.message ||
          "Unable to start printing."
      );
    }
  };

  const handleCompletePrinting = async (requestId) => {
    try {
      await completePrintingRequest(
        requestId,
        "Printing completed"
      );

      alert("Printing completed successfully.");
      await fetchPrintingData();
    } catch (err) {
      console.error(
        "Complete Printing Error:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.message ||
          "Unable to complete printing."
      );
    }
  };

  const printingStats = [
    {
      title: "Print Queue",
      value: dashboard.PendingPrintQueue,
      subtitle: "Waiting to Print",
    },
    {
      title: "In Progress",
      value: dashboard.InProgress,
      subtitle: "Currently Printing",
    },
    {
      title: "Completed Today",
      value: dashboard.CompletedToday,
      subtitle: "Finished Today",
    },
    {
      title: "Total Completed",
      value: dashboard.Completed,
      subtitle: "All Completed Jobs",
    },
    {
      title: "Monthly Limit",
      value: limitSummary.monthlyLimit.toLocaleString(),
      subtitle: "All Departments",
    },
    {
      title: "Used Sheets",
      value: limitSummary.usedSheets.toLocaleString(),
      subtitle: "This Month",
    },
    {
      title: "Remaining",
      value: limitSummary.remainingSheets.toLocaleString(),
      subtitle: "Available Sheets",
    },
  ];

  const icons = [
    <Assignment />,
    <PendingActions />,
    <Print />,
    <CheckCircle />,
    <Assignment />,
    <Print />,
    <CheckCircle />,
  ];

  return (
    <DashboardLayout
      sidebar={<Sidebar role="printing" />}
      topbar={(handleMenuClick) => (
        <Topbar onMenuClick={handleMenuClick} />
      )}
    >
      <PageHeader
        title="Printing Dashboard"
        subtitle={`Welcome back, ${
          user?.fullName || "Printing Admin"
        }. Manage approved photocopy requests and printing completion.`}
        action={<DateFilter label="May 1 - May 31, 2025" />}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading printing dashboard data...</Typography>
      ) : (
        <>
          <KPIGrid stats={printingStats} icons={icons} />

          <Box sx={{ mt: 4 }}>
            <DashboardCard title="Print Queue">
              <Box sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Request ID</TableCell>
                      <TableCell>Teacher</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Sheets</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {requests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography color="text.secondary">
                            No requests in print queue.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}

                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {request.requestNumber}
                        </TableCell>

                        <TableCell>{request.teacher}</TableCell>

                        <TableCell>
                          {request.department}
                        </TableCell>

                        <TableCell>{request.subject}</TableCell>

                        <TableCell>{request.sheets}</TableCell>

                        <TableCell>
                          <Chip
                            label={request.priority || "Normal"}
                            size="small"
                            color={
                              request.priority === "Urgent"
                                ? "error"
                                : request.priority === "High"
                                ? "warning"
                                : "default"
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={request.status}
                            size="small"
                            color={
                              request.status === "Printing"
                                ? "info"
                                : "warning"
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          {request.status !== "Printing" && (
                            <Button
                              variant="contained"
                              size="small"
                              sx={{ mr: 1 }}
                              onClick={() =>
                                handleStartPrinting(request.id)
                              }
                            >
                              Start
                            </Button>
                          )}

                          {request.status === "Printing" && (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() =>
                                handleCompletePrinting(request.id)
                              }
                            >
                              Complete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </DashboardCard>
          </Box>

          <Box sx={{ mt: 4 }}>
            <DashboardCard title="Recent Printing History">
              <Box sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Request ID</TableCell>
                      <TableCell>Teacher</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Sheets</TableCell>
                      <TableCell>Printed By</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {history.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary">
                            No printing history available.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}

                    {history.slice(0, 5).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.requestNumber}
                        </TableCell>

                        <TableCell>{item.teacher}</TableCell>

                        <TableCell>
                          {item.department}
                        </TableCell>

                        <TableCell>{item.subject}</TableCell>

                        <TableCell>
                          {item.printedSheets}
                        </TableCell>

                        <TableCell>{item.printedBy}</TableCell>

                        <TableCell>
                          {item.printedDate}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </DashboardCard>
          </Box>
        </>
      )}
    </DashboardLayout>
  );
}