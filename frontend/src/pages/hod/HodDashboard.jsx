// ============================================
// ARAB UNITY SCHOOL
// HOD Dashboard Page
// Connected to Backend Live Data
// Compact layout with Top 5 recent sections
// ============================================

import { useEffect, useMemo, useState } from "react";

import { Box, Alert, Typography } from "@mui/material";

import {
  Assignment,
  PendingActions,
  CheckCircle,
  Cancel,
  Send,
  TaskAlt,
} from "@mui/icons-material";

import PageHeader from "../../components/common/PageHeader";
import DateFilter from "../../components/common/DateFilter";
import Topbar from "../../components/common/Topbar";

import KPIGrid from "../../components/dashboard/KPIGrid";

import HodApprovalTrend from "../../components/charts/HodApprovalTrend";
import DepartmentDistributionChart from "../../components/charts/DepartmentDistributionChart";

import HodPendingRequestsTable from "../../components/tables/HodPendingRequestsTable";
import RecentApprovedRequests from "../../components/tables/RecentApprovedRequests";
import RecentRejectedRequests from "../../components/tables/RecentRejectedRequests";
import ApprovalHistory from "../../components/tables/ApprovalHistory";

import RequestDetailsDialog from "../../components/dialogs/RequestDetailsDialog";

import { useAuth } from "../../context/AuthContext";

import {
  getHodDashboard,
  getHodRequests,
  getHodApprovalHistory,
  approveHodRequest,
  rejectHodRequest,
} from "../../services/hodService";

export default function HodDashboard() {
  const { user } = useAuth();

  // ============================================
  // Dashboard KPI State
  // Includes Subject Quota KPI
  // ============================================

  const [dashboard, setDashboard] = useState({
    TotalRequests: 0,
    PendingReview: 0,
    Approved: 0,
    Rejected: 0,
    Forwarded: 0,
    Completed: 0,

    SubjectSheetLimit: 0,
    SubjectUsedSheets: 0,
    SubjectRemainingSheets: 0,
  });

  const [requests, setRequests] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // Convert backend request data to frontend format
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
    rawSubmittedAt: item.SubmittedAt,
    submittedDate: item.SubmittedAt
      ? new Date(item.SubmittedAt).toLocaleDateString()
      : "-",
    approvalRemarks: item.ApprovalRemarks,
    approvalStatus: item.ApprovalStatus,
    actionDate: item.ActionDate
      ? new Date(item.ActionDate).toLocaleDateString()
      : "-",
  });

  // ============================================
  // Convert backend approval history to frontend format
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
    approverName: item.ApproverName,
    approverEmployeeId: item.ApproverEmployeeId,
    displayApproverRole: item.DisplayApproverRole,
    approvalStatus: item.ApprovalStatus,
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
  // Fetch HOD dashboard data
  // ============================================
  const fetchHodData = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardData, requestsData, historyData] = await Promise.all([
        getHodDashboard(),
        getHodRequests(),
        getHodApprovalHistory(),
      ]);

      // ============================================
      // Dashboard + Subject Quota KPIs
      // ============================================

      setDashboard({
        TotalRequests: dashboardData.TotalRequests || 0,
        PendingReview: dashboardData.PendingReview || 0,
        Approved: dashboardData.Approved || 0,
        Rejected: dashboardData.Rejected || 0,
        Forwarded: dashboardData.Forwarded || 0,
        Completed: dashboardData.Completed || 0,

        SubjectSheetLimit: dashboardData.SubjectSheetLimit || 0,
        SubjectUsedSheets: dashboardData.SubjectUsedSheets || 0,
        SubjectRemainingSheets:
          dashboardData.SubjectRemainingSheets || 0,
      });

      setRequests(requestsData.map(mapRequest));
      setApprovalHistory(historyData.map(mapApprovalHistory));
    } catch (err) {
      console.error("Fetch HOD Data Error:", err.response?.data || err);

      setError(
        err.response?.data?.message || "Unable to load HOD dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHodData();
  }, []);

  
  // ============================================
  // Dashboard KPI cards
  // ============================================
  // ============================================
  // HOD Dashboard KPI Cards
  // Includes Subject Quota KPIs
  // ============================================

  const hodDashboardStats = [
    {
      title: "Total Requests",
      value: dashboard.TotalRequests,
      subtitle: "All HOD Requests",
    },

    {
      title: "Pending Review",
      value: dashboard.PendingReview,
      subtitle: "Awaiting HOD Action",
    },

    {
      title: "Approved",
      value: dashboard.Approved,
      subtitle: "Approved by HOD",
    },

    {
      title: "Rejected",
      value: dashboard.Rejected,
      subtitle: "Rejected by HOD",
    },

    {
      title: "Forwarded",
      value: dashboard.Forwarded,
      subtitle: "Forwarded to HOS",
    },

    {
      title: "Completed",
      value: dashboard.Completed,
      subtitle: "Completed Requests",
    },

    // ============================================
    // Subject Quota KPIs
    // ============================================

    {
      title: "Subject Limit",
      value: dashboard.SubjectSheetLimit,
      subtitle: "Monthly Allocated Sheets",
    },

    {
      title: "Used Sheets",
      value: dashboard.SubjectUsedSheets,
      subtitle: "Current Month Usage",
    },

    {
      title: "Remaining Quota",
      value: dashboard.SubjectRemainingSheets,
      subtitle: "Available Sheets",
    },
  ];

  const icons = [
    <Assignment />,
    <PendingActions />,
    <CheckCircle />,
    <Cancel />,
    <Send />,
    <TaskAlt />,

    <Assignment />,
    <CheckCircle />,
    <TaskAlt />,
  ];

  // ============================================
  // Dashboard table data
  // Only show recent/top 5 items on dashboard
  // Full lists are available on sidebar pages
  // ============================================
  const pendingRequests = useMemo(() => {
    return requests
      .filter((request) => request.status === "Pending")
      .slice(0, 5);
  }, [requests]);

  const recentApprovedRequests = useMemo(() => {
    return requests
      .filter(
        (request) =>
          request.status === "Approved by HOD" ||
          request.status === "Forwarded to HOS"
      )
      .slice(0, 5);
  }, [requests]);

  const recentRejectedRequests = useMemo(() => {
    return requests
      .filter((request) => request.status === "Rejected by HOD")
      .slice(0, 5);
  }, [requests]);

  const recentApprovalHistory = useMemo(() => {
    return [...approvalHistory]
      .sort(
        (a, b) =>
          new Date(b.rawActionDate || 0) - new Date(a.rawActionDate || 0)
      )
      .slice(0, 5);
  }, [approvalHistory]);

  // ============================================
  // Dialog handlers
  // ============================================
  const handleReview = (request) => {
    if (actionLoading) return;

    setSelectedRequest(request);
    setComment("");
    setOpenDialog(true);
  };

  const handleClose = () => {
    if (actionLoading) return;

    setOpenDialog(false);
    setSelectedRequest(null);
    setComment("");
  };

  // ============================================
  // Approve request
  // ============================================
  const handleApprove = async () => {
    if (actionLoading) return;

    if (!selectedRequest) {
      alert("No request selected.");
      return;
    }

    setActionLoading(true);

    try {
      await approveHodRequest(selectedRequest.id, comment || "Approved by HOD");

      alert("Request approved successfully.");

      setOpenDialog(false);
      setSelectedRequest(null);
      setComment("");

      await fetchHodData();
    } catch (err) {
      console.error("Approve Request Error:", err.response?.data || err);

      alert(err.response?.data?.message || "Unable to approve request.");
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // Reject request
  // ============================================
  const handleReject = async () => {
    if (actionLoading) return;

    if (!selectedRequest) {
      alert("No request selected.");
      return;
    }

    if (!comment.trim()) {
      alert("Comment is required when rejecting a request.");
      return;
    }

    setActionLoading(true);

    try {
      await rejectHodRequest(selectedRequest.id, comment);

      alert("Request rejected successfully.");

      setOpenDialog(false);
      setSelectedRequest(null);
      setComment("");

      await fetchHodData();
    } catch (err) {
      console.error("Reject Request Error:", err.response?.data || err);

      alert(err.response?.data?.message || "Unable to reject request.");
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================
  // Return request
  // Temporarily disabled until returned workflow is built
  // ============================================
  const handleReturn = () => {
    if (actionLoading) return;

    alert("Return request workflow will be added later.");
  };

  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      topbar={
        <Topbar
          userName={user?.fullName || user?.FullName || "HOD"}
          role={user?.displayRole || user?.role || user?.Role || "HOD"}
        />
      }
    >
      <PageHeader
        title={`${user?.departmentName || user?.DepartmentName || ""} ${
          user?.subject || user?.Subject || ""
        } HOD Dashboard`}
        subtitle={`Welcome back, ${
          user?.fullName || user?.FullName || "HOD"
        }. Review ${
          user?.departmentName || user?.DepartmentName || ""
        } ${user?.subject || user?.Subject || ""} photocopy requests.`}
        action={<DateFilter label="May 1 - May 31, 2025" />}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading HOD dashboard data...</Typography>
      ) : (
        <>
          {/* KPI Cards */}
          <KPIGrid stats={hodDashboardStats} icons={icons} />

          {/* Charts Grid */}
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

          {/* Pending Requests - Top 5 */}
          <Box sx={{ mt: 4 }}>
            <HodPendingRequestsTable
              requests={pendingRequests}
              onReview={handleReview}
            />
          </Box>

          {/* Recent Approved, Rejected, and Approval History - Same Grid */}
          <Box
            sx={{
              mt: 4,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "1fr 1fr",
                xl: "1fr 1fr 1fr",
              },
              gap: 3,
              alignItems: "stretch",
            }}
          >
            <RecentApprovedRequests requests={recentApprovedRequests} />

            <RecentRejectedRequests requests={recentRejectedRequests} />

            <ApprovalHistory history={recentApprovalHistory} />
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
        actionLoading={actionLoading}
      />
    </DashboardLayout>
  );
}