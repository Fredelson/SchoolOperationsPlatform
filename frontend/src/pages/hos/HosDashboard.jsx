// ============================================
// ARAB UNITY SCHOOL
// HOS Dashboard Page
// Connected to Backend Live Data
// Recent Approved / Rejected / History in same grid
// Shows latest top 5 records
// ============================================

import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import Sidebar from "../../components/sidebar/Sidebar";

import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";
import DateFilter from "../../components/common/DateFilter";

import { Box, Alert, Typography } from "@mui/material";

import {
  Assignment,
  PendingActions,
  CheckCircle,
  Cancel,
  TaskAlt,
} from "@mui/icons-material";

// Dashboard
import KPIGrid from "../../components/dashboard/KPIGrid";

// Charts
import HodApprovalTrend from "../../components/charts/HodApprovalTrend";
import DepartmentDistributionChart from "../../components/charts/DepartmentDistributionChart";

// Tables
import HosPendingRequestsTable from "../../components/tables/HosPendingRequestsTable";
import RecentApprovedRequests from "../../components/tables/RecentApprovedRequests";
import RecentRejectedRequests from "../../components/tables/RecentRejectedRequests";
import ApprovalHistory from "../../components/tables/ApprovalHistory";

// Dialogs
import RequestDetailsDialog from "../../components/dialogs/RequestDetailsDialog";

import { useAuth } from "../../context/AuthContext";

import {
  getHosDashboard,
  getHosRequests,
  getHosApprovalHistory,
  approveHosRequest,
  rejectHosRequest,
} from "../../services/hosService";
export default function HosDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState({
    TotalRequests: 0,
    PendingReview: 0,
    Approved: 0,
    Rejected: 0,
    Completed: 0,
  });

  const [requests, setRequests] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // Format HOS request records from backend
  // ============================================
  const mapRequest = (item) => ({
    id: item.RequestId,
    requestNumber: item.RequestNumber,

    teacher: item.TeacherName,
    employeeId: item.EmployeeId,

    department: item.DepartmentName,
    subject: item.SubjectName,
    purpose: item.PurposeName,

    pages: item.TotalPages,
    sheets: item.TotalSheets,
    copies: item.Copies,

    priority: item.PriorityLevel,
    status: item.Status,

    paperSize: item.PaperSize,
    printType: item.PrintType,
    printSide: item.PrintSide,
    isExam: item.IsExam,

    requestRemarks: item.RequestRemarks,

    rawSubmittedAt: item.SubmittedAt,
    submittedDate: item.SubmittedAt
      ? new Date(item.SubmittedAt).toLocaleDateString()
      : "-",

    rawApprovedAt: item.ApprovedAt,
    approvedAt: item.ApprovedAt
      ? new Date(item.ApprovedAt).toLocaleDateString()
      : "-",

    approvalRemarks: item.ApprovalRemarks,
    approvalStatus: item.ApprovalStatus,

    rawActionDate: item.ActionDate,
    actionDate: item.ActionDate
      ? new Date(item.ActionDate).toLocaleDateString()
      : "-",

    rawDueDate: item.DueDate,
    dueDate: item.DueDate
      ? new Date(item.DueDate).toLocaleDateString()
      : "-",
  });

  // ============================================
  // Format HOS approval history records
  // ============================================
  const mapApprovalHistory = (item) => ({
    approvalId: item.ApprovalId,
    requestId: item.RequestId,
    requestNumber: item.RequestNumber,

    teacher: item.TeacherName,
    employeeId: item.EmployeeId,

    department: item.DepartmentName,
    subject: item.SubjectName,
    purpose: item.PurposeName,

    approvalRole: item.ApprovalRole,
    approvalStatus: item.ApprovalStatus,

    approverName: item.ApproverName,
    approverEmployeeId: item.ApproverEmployeeId,
    displayApproverRole: item.DisplayApproverRole,

    requestStatus: item.RequestStatus,
    remarks: item.Remarks,

    rawActionDate: item.ActionDate,
    actionDate: item.ActionDate
      ? new Date(item.ActionDate).toLocaleDateString()
      : "-",

    rawSubmittedAt: item.SubmittedAt,
    submittedDate: item.SubmittedAt
      ? new Date(item.SubmittedAt).toLocaleDateString()
      : "-",
  });

  // ============================================
  // Fetch all HOS dashboard data
  // ============================================
  const fetchHosData = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardData, requestsData, historyData] =
        await Promise.all([
          getHosDashboard(),
          getHosRequests(),
          getHosApprovalHistory(),
        ]);

      setDashboard({
        TotalRequests: dashboardData.TotalRequests || 0,
        PendingReview: dashboardData.PendingReview || 0,
        Approved: dashboardData.Approved || 0,
        Rejected: dashboardData.Rejected || 0,
        Completed: dashboardData.Completed || 0,
      });

      setRequests(requestsData.map(mapRequest));
      setApprovalHistory(historyData.map(mapApprovalHistory));
    } catch (err) {
      console.error("Fetch HOS Data Error:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
          "Unable to load HOS dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosData();
  }, []);

  // ============================================
  // KPI Cards
  // ============================================
  const hosDashboardStats = [
    {
      title: "Total Requests",
      value: dashboard.TotalRequests,
      subtitle: "All HOS Requests",
    },
    {
      title: "Pending Review",
      value: dashboard.PendingReview,
      subtitle: "Awaiting HOS Action",
    },
    {
      title: "Approved",
      value: dashboard.Approved,
      subtitle: "Approved by HOS",
    },
    {
      title: "Rejected",
      value: dashboard.Rejected,
      subtitle: "Rejected by HOS",
    },
    {
      title: "Completed",
      value: dashboard.Completed,
      subtitle: "Completed Requests",
    },
  ];

  const icons = [
    <Assignment />,
    <PendingActions />,
    <CheckCircle />,
    <Cancel />,
    <TaskAlt />,
  ];

  // ============================================
  // Top 5 recent records
  // ============================================
  const recentApprovedRequests = requests
    .filter((request) => request.status === "Approved by HOS")
    .sort(
      (a, b) =>
        new Date(b.rawApprovedAt || b.rawActionDate || b.rawSubmittedAt) -
        new Date(a.rawApprovedAt || a.rawActionDate || a.rawSubmittedAt)
    )
    .slice(0, 5);

  const recentRejectedRequests = requests
    .filter((request) => request.status === "Rejected by HOS")
    .sort(
      (a, b) =>
        new Date(b.rawActionDate || b.rawSubmittedAt) -
        new Date(a.rawActionDate || a.rawSubmittedAt)
    )
    .slice(0, 5);

  const recentApprovalHistory = approvalHistory
    .sort(
      (a, b) =>
        new Date(b.rawActionDate || b.rawSubmittedAt) -
        new Date(a.rawActionDate || a.rawSubmittedAt)
    )
    .slice(0, 5);

  // ============================================
  // Dialog Actions
  // ============================================
  const handleReview = (request) => {
    setSelectedRequest(request);
    setComment("");
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
    setComment("");
  };

  const handleApprove = async () => {
    if (!selectedRequest) {
      alert("No request selected.");
      return;
    }

    try {
      await approveHosRequest(
        selectedRequest.id,
        comment || "Approved by HOS"
      );

      alert("Request approved by HOS successfully.");

      handleClose();
      await fetchHosData();
    } catch (err) {
      console.error("Approve HOS Request Error:", err.response?.data || err);

      alert(
        err.response?.data?.message ||
          "Unable to approve HOS request."
      );
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) {
      alert("No request selected.");
      return;
    }

    if (!comment.trim()) {
      alert("Comment is required when rejecting a request.");
      return;
    }

    try {
      await rejectHosRequest(selectedRequest.id, comment);

      alert("Request rejected by HOS successfully.");

      handleClose();
      await fetchHosData();
    } catch (err) {
      console.error("Reject HOS Request Error:", err.response?.data || err);

      alert(
        err.response?.data?.message ||
          "Unable to reject HOS request."
      );
    }
  };

  const handleReturn = () => {
    alert("Return request API is not created yet.");
  };

  return (
    <DashboardLayout
      sidebar={<Sidebar role="hos" />}
      topbar={(handleMenuClick) => (
        <Topbar onMenuClick={handleMenuClick} />
      )}
    >
      <PageHeader
        title={`${user?.displayRole || "HOS"} Dashboard`}
        subtitle={`Welcome back, ${
          user?.fullName || "HOS"
        }. Review large photocopy requests for ${
          user?.departmentName || "your department"
        }.`}
        action={<DateFilter label="May 1 - May 31, 2025" />}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading HOS dashboard data...</Typography>
      ) : (
        <>
          <KPIGrid stats={hosDashboardStats} icons={icons} />

          {/* Charts Section */}
          <Box
            sx={{
              mt: 4,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "2fr 1fr",
              },
              gap: 3,
            }}
          >
            <HodApprovalTrend requests={requests} />
            <DepartmentDistributionChart requests={requests} />
          </Box>

          {/* Pending Large Requests */}
          <Box sx={{ mt: 4 }}>
            <HosPendingRequestsTable
              requests={requests}
              onReview={handleReview}
            />
          </Box>

          {/* Recent Approved, Rejected, and Approval History */}
          <Box
            sx={{
              mt: 4,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr",
                lg: "1fr 1fr 1fr",
              },
              gap: 3,
              alignItems: "stretch",
            }}
          >
            <RecentApprovedRequests
              requests={recentApprovedRequests}
            />

            <RecentRejectedRequests
              requests={recentRejectedRequests}
            />

            <ApprovalHistory
              history={recentApprovalHistory}
            />
          </Box>
        </>
      )}

      <RequestDetailsDialog
        open={openDialog}
        request={selectedRequest}
        comment={comment}
        setComment={setComment}
        onClose={handleClose}
        onApprove={handleApprove}
        onReturn={handleReturn}
        onReject={handleReject}
      />
    </DashboardLayout>
  );
}