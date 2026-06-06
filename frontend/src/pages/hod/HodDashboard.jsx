// ============================================
// ARAB UNITY SCHOOL
// HOD Dashboard Page
// ============================================

// React state for dialog and approval actions
import { useState } from "react";

// Main dashboard layout
import DashboardLayout from "../../layouts/DashboardLayout";

// Common layout components
import Sidebar from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";
import DateFilter from "../../components/common/DateFilter";

// MUI components
import { Box, Alert } from "@mui/material";

// MUI icons
import {
  Assignment,
  PendingActions,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";

// Reusable dashboard components
import KPIGrid from "../../components/dashboard/KPIGrid";
import DashboardCard from "../../components/dashboard/DashboardCard";
import ApprovalQueue from "../../components/dashboard/ApprovalQueue";
import RequestDetailsDialog from "../../components/dashboard/RequestDetailsDialog";

// Temporary HOD request data
const sampleRequests = [
  {
    id: 1,
    requestNumber: "REQ-2026-001",
    teacher: "Ms. Aisha",
    department: "Primary",
    purpose: "Worksheet",
    pages: 20,
    copies: 15,
    sheets: 300,
    status: "Pending HOD",
    attachments: ["worksheet-grade1.pdf"],
  },
  {
    id: 2,
    requestNumber: "REQ-2026-002",
    teacher: "Mr. John",
    department: "Secondary",
    purpose: "Exam Paper",
    pages: 30,
    copies: 20,
    sheets: 600,
    status: "Pending HOD",
    attachments: ["math-exam.pdf"],
  },
];

export default function HodDashboard() {
  // Store all HOD requests
  const [requests, setRequests] = useState(sampleRequests);

  // Store selected request for the review dialog
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Control review dialog open/close
  const [openDialog, setOpenDialog] = useState(false);

  // Store HOD comment
  const [comment, setComment] = useState("");

  // Open review dialog
  const handleReview = (request) => {
    setSelectedRequest(request);
    setComment("");
    setOpenDialog(true);
  };

  // Close review dialog
  const handleClose = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
    setComment("");
  };

  // Approve request
  const handleApprove = () => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id
          ? {
              ...req,

              // If sheets are more than 500, send to HOS approval
              // If sheets are 500 or below, send to Admin Printing
              status:
                req.sheets > 500
                  ? "Forwarded to HOS"
                  : "Approved by HOD",

              // Save HOD comment
              comment,
            }
          : req
      )
    );

    handleClose();
  };

  // Return request for revision
  const handleReturn = () => {
    // Comment is required when returning
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

  // Reject request
  const handleReject = () => {
    // Comment is required when rejecting
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

  // KPI data for HOD dashboard
  const hodStats = [
    {
      title: "Total Requests",
      value: requests.length,
      color: "#1976d2",
    },
    {
      title: "Pending HOD",
      value: requests.filter((r) => r.status === "Pending HOD").length,
      color: "#ed6c02",
    },
    {
      title: "Approved",
      value: requests.filter((r) => r.status === "Approved by HOD").length,
      color: "#2e7d32",
    },
    {
      title: "Rejected",
      value: requests.filter((r) => r.status === "Rejected by HOD").length,
      color: "#d32f2f",
    },
  ];

  // Icons matched with hodStats order
  const icons = [
    <Assignment />,
    <PendingActions />,
    <CheckCircle />,
    <Cancel />,
  ];

  return (
    <DashboardLayout
      sidebar={<Sidebar role="hod" />}
      topbar={<Topbar userName="Primary HOD" role="HOD" />}
    >
      {/* Page Header */}
      <PageHeader
        title="HOD Dashboard"
        subtitle="Review and approve department photocopy requests."
        action={<DateFilter label="May 1 - May 31, 2025" />}
      />

      {/* HOD KPI Cards */}
      <KPIGrid stats={hodStats} icons={icons} />

      {/* Approval Queue Section */}
      <Box sx={{ mt: 4 }}>
        <DashboardCard title="Pending Approval Queue">
          {requests.length > 0 ? (
            <ApprovalQueue requests={requests} onReview={handleReview} />
          ) : (
            <Alert severity="info">No requests found.</Alert>
          )}
        </DashboardCard>
      </Box>

      {/* Request Details Dialog */}
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