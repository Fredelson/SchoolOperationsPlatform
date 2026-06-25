// ============================================
// ARAB UNITY SCHOOL
// HOD Requests Page
// Reusable page for Pending, Approved, Rejected, Returned
// ============================================

import { useEffect, useMemo, useState } from "react";

import { Alert, Typography } from "@mui/material";

import DashboardLayout from "../../layouts/DashboardLayout";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";

import HodPendingRequestsTable from "../../components/tables/HodPendingRequestsTable";
import RequestDetailsDialog from "../../components/dialogs/RequestDetailsDialog";


import { useAuth } from "../../context/AuthContext";

import {
  getHodRequests,
  approveHodRequest,
  rejectHodRequest,
} from "../../services/hodService";

export default function HodRequestsPage({ type = "pending" }) {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

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

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getHodRequests();
      setRequests(data.map(mapRequest));
    } catch (err) {
      console.error("Load HOD Requests Error:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
          "Unable to load HOD requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const pageConfig = {
    pending: {
      title: "Pending Approvals",
      subtitle: "Review photocopy requests waiting for your approval.",
    },
    approved: {
      title: "Approved Requests",
      subtitle: "Requests you have approved.",
    },
    rejected: {
      title: "Rejected Requests",
      subtitle: "Requests you have rejected.",
    },
    returned: {
      title: "Returned Requests",
      subtitle: "Requests returned to teachers for correction.",
    },
  };

  const filteredRequests = useMemo(() => {
    if (type === "pending") {
      return requests.filter((request) => request.status === "Pending");
    }

    if (type === "approved") {
      return requests.filter(
        (request) =>
          request.status === "Approved by HOD" ||
          request.status === "Forwarded to HOS"
      );
    }

    if (type === "rejected") {
      return requests.filter(
        (request) => request.status === "Rejected by HOD"
      );
    }

    if (type === "returned") {
      return requests.filter(
        (request) => request.status === "Returned by HOD"
      );
    }

    return requests;
  }, [requests, type]);

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

  const handleApprove = async () => {
    if (!selectedRequest || actionLoading) return;

    setActionLoading(true);

    try {
      await approveHodRequest(
        selectedRequest.id,
        comment || "Approved by HOD"
      );

      alert("Request approved successfully.");

      setOpenDialog(false);
      setSelectedRequest(null);
      setComment("");

      await loadRequests();
    } catch (err) {
      console.error("Approve HOD Request Error:", err.response?.data || err);
      alert(err.response?.data?.message || "Unable to approve request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || actionLoading) return;

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

      await loadRequests();
    } catch (err) {
      console.error("Reject HOD Request Error:", err.response?.data || err);
      alert(err.response?.data?.message || "Unable to reject request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = () => {
    alert("Return request API is not created yet.");
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
        title={pageConfig[type]?.title || "HOD Requests"}
        subtitle={pageConfig[type]?.subtitle || "Manage HOD requests."}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading requests...</Typography>
      ) : (
        <HodPendingRequestsTable
          requests={filteredRequests}
          onReview={handleReview}
        />
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