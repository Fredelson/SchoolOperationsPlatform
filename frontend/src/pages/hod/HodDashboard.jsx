// ============================================
// ARAB UNITY SCHOOL
// HOD Dashboard Page
// Connected to Backend API
// ============================================

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import DashboardLayout from "../../layouts/DashboardLayout";

import Sidebar from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";
import DateFilter from "../../components/common/DateFilter";

import { Box, Alert, Typography } from "@mui/material";

import {
  Assignment,
  PendingActions,
  CheckCircle,
  Cancel,
  Send,
  TaskAlt,
} from "@mui/icons-material";

import KPIGrid from "../../components/dashboard/KPIGrid";
import RequestDetailsDialog from "../../components/dashboard/RequestDetailsDialog";
import HodApprovalTrend from "../../components/dashboard/HodApprovalTrend";
import DepartmentDistributionChart from "../../components/dashboard/DepartmentDistributionChart";
import RecentApprovedRequests from "../../components/dashboard/RecentApprovedRequests";
import ApprovalHistory from "../../components/dashboard/ApprovalHistory";
import HodPendingRequestsTable from "../../components/dashboard/HodPendingRequestsTable";
import RecentRejectedRequests from "../../components/dashboard/RecentRejectedRequests";

import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:5000/api";

export default function HodDashboard() {
  const { user, token } = useAuth();

  // ============================================
  // State
  // ============================================

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // Fetch HOD assigned requests
  // GET /api/hod/requests
  // ============================================

  useEffect(() => {
    const fetchHodRequests = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/hod/requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Convert backend field names to the format expected by
        // HodPendingRequestsTable and RequestDetailsDialog.
        const mappedRequests = response.data.map((item) => ({
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
          submittedDate: item.SubmittedAt
            ? new Date(item.SubmittedAt).toLocaleDateString()
            : "-",
        }));

        setRequests(mappedRequests);
      } catch (err) {
        console.error("Fetch HOD Requests Error:", err);

        setError("Unable to load HOD requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchHodRequests();
    }
  }, [token]);

  // ============================================
  // KPI stats calculated from live request data
  // ============================================

  const hodDashboardStats = useMemo(() => {
    const total = requests.length;

    const pending = requests.filter(
      (req) => req.status === "Pending"
    ).length;

    const approved = requests.filter((req) =>
      req.status?.toLowerCase().includes("approved")
    ).length;

    const rejected = requests.filter((req) =>
      req.status?.toLowerCase().includes("rejected")
    ).length;

    const forwarded = requests.filter((req) =>
      req.status?.toLowerCase().includes("forwarded")
    ).length;

    const completed = requests.filter((req) =>
      req.status?.toLowerCase().includes("completed")
    ).length;

    return [
      {
        title: "Total Requests",
        value: total,
        subtitle: "Assigned to you",
      },
      {
        title: "Pending Review",
        value: pending,
        subtitle: "Awaiting HOD action",
      },
      {
        title: "Approved",
        value: approved,
        subtitle: "Approved by HOD",
      },
      {
        title: "Rejected",
        value: rejected,
        subtitle: "Rejected requests",
      },
      {
        title: "Forwarded",
        value: forwarded,
        subtitle: "Forwarded to HOS",
      },
      {
        title: "Completed",
        value: completed,
        subtitle: "Completed requests",
      },
    ];
  }, [requests]);

  // ============================================
  // Open request review dialog
  // ============================================

  const handleReview = (request) => {
    setSelectedRequest(request);
    setComment("");
    setOpenDialog(true);
  };

  // ============================================
  // Close request review dialog
  // ============================================

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
    setComment("");
  };

  // ============================================
  // TEMPORARY FRONTEND-ONLY APPROVE
  // Later this will call:
  // PATCH /api/hod/requests/:id/approve
  // ============================================

  const handleApprove = () => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id
          ? {
              ...req,
              status:
                req.sheets > 500
                  ? "Forwarded to HOS"
                  : "Approved by HOD",
              comment,
            }
          : req
      )
    );

    handleClose();
  };

  // ============================================
  // TEMPORARY FRONTEND-ONLY RETURN
  // Later this will call:
  // PATCH /api/hod/requests/:id/return
  // ============================================

  const handleReturn = () => {
    if (!comment.trim()) {
      alert("Comment is required when returning a request.");
      return;
    }

    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id
          ? {
              ...req,
              status: "Returned for Revision",
              comment,
            }
          : req
      )
    );

    handleClose();
  };

  // ============================================
  // TEMPORARY FRONTEND-ONLY REJECT
  // Later this will call:
  // PATCH /api/hod/requests/:id/reject
  // ============================================

  const handleReject = () => {
    if (!comment.trim()) {
      alert("Comment is required when rejecting a request.");
      return;
    }

    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id
          ? {
              ...req,
              status: "Rejected by HOD",
              comment,
            }
          : req
      )
    );

    handleClose();
  };

  // ============================================
  // KPI icons matched with stats order
  // ============================================

  const icons = [
    <Assignment />,
    <PendingActions />,
    <CheckCircle />,
    <Cancel />,
    <Send />,
    <TaskAlt />,
  ];

  return (
    <DashboardLayout
      sidebar={<Sidebar role="hod" />}
      topbar={
        <Topbar
          userName={user?.fullName || "HOD"}
          role={user?.role || "HOD"}
        />
      }
    >
      <PageHeader
        title="HOD Dashboard"
        subtitle="Review and approve department photocopy requests."
        action={<DateFilter label="May 1 - May 31, 2025" />}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading HOD requests...</Typography>
      ) : (
        <>
          <KPIGrid stats={hodDashboardStats} icons={icons} />

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
            <HodApprovalTrend />
            <DepartmentDistributionChart />
          </Box>

          <Box sx={{ mt: 4 }}>
            <HodPendingRequestsTable
              requests={requests}
              onReview={handleReview}
            />
          </Box>

          <Box sx={{ mt: 4 }}>
            <RecentApprovedRequests />
          </Box>

          <Box sx={{ mt: 4 }}>
            <RecentRejectedRequests />
          </Box>

          <Box sx={{ mt: 4 }}>
            <ApprovalHistory />
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