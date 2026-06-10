// ============================================
// ARAB UNITY SCHOOL
// Teacher - Request Details Page
// Connected to Backend API
// ============================================

import { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Button,
  Alert,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "../../layouts/DashboardLayout";
import Sidebar from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";
import DashboardCard from "../../components/common/DashboardCard";
import StatusChip from "../../components/common/StatusChip";
import ApprovalTimeline from "../../components/common/ApprovalTimeline";

import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:5000/api";

export default function RequestDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token } = useAuth();

  const [request, setRequest] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // Fetch request details from backend
  // GET /api/requests/:id
  // ============================================

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/requests/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRequest(response.data.request);
        setApprovals(response.data.approvals || []);
        setAttachments(response.data.attachments || []);
      } catch (err) {
        console.error("Fetch Request Details Error:", err);
        setError("Unable to load request details.");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchRequestDetails();
    }
  }, [token, id]);

  // ============================================
  // Convert backend approval records into timeline
  // format expected by ApprovalTimeline component
  // ============================================

  const approvalFlow = approvals.map((approval) => ({
    step: approval.ApprovalRole,
    status: approval.ApprovalStatus,
    remarks: approval.Remarks || "No remarks.",
  }));

  return (
    <DashboardLayout
      sidebar={<Sidebar role="teacher" />}
      topbar={
        <Topbar
          userName={user?.fullName || "Teacher"}
          role={user?.role || "Teacher"}
        />
      }
    >
      <PageHeader
        title="Request Details"
        subtitle="Track your request status and uploaded documents."
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/teacher/my-requests")}
            sx={{ textTransform: "none" }}
          >
            Back
          </Button>
        }
      />

      {loading && (
        <DashboardCard title="Loading">
          <Typography>Loading request details...</Typography>
        </DashboardCard>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && request && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "2fr 1fr",
            },
            gap: 3,
          }}
        >
          <Box>
            <DashboardCard title="Request Information" sx={{ mb: 3 }}>
              <InfoRow label="Request ID" value={request.RequestNumber} />
              <InfoRow label="Teacher" value={request.TeacherName} />
              <InfoRow label="Employee ID" value={request.EmployeeId} />
              <InfoRow label="Department" value={request.DepartmentName} />
              <InfoRow label="Subject" value={request.SubjectName} />
              <InfoRow label="Purpose" value={request.PurposeName} />
              <InfoRow label="Priority" value={request.PriorityLevel} />
              <InfoRow label="Copies" value={request.Copies} />
              <InfoRow label="Total Pages" value={request.TotalPages} />
              <InfoRow label="Total Sheets" value={request.TotalSheets} />
              <InfoRow
                label="Submitted Date"
                value={
                  request.SubmittedAt
                    ? new Date(request.SubmittedAt).toLocaleDateString()
                    : "-"
                }
              />

              <Box mt={2}>
                <StatusChip status={request.Status} />
              </Box>
            </DashboardCard>

            <DashboardCard title="Attachments">
              {attachments.length === 0 ? (
                <Typography color="text.secondary">
                  No attachments uploaded.
                </Typography>
              ) : (
                attachments.map((file) => (
                  <Box
                    key={file.AttachmentId}
                    sx={{
                      p: 2,
                      border: "1px solid #E5E7EB",
                      borderRadius: 3,
                      mb: 2,
                      backgroundColor: "#F8FAFC",
                    }}
                  >
                    <Typography fontWeight={700}>
                      {file.OriginalFileName || file.FileName}
                    </Typography>

                    <Typography color="text.secondary" fontSize={14}>
                      {file.FileType || "File"}
                    </Typography>

                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      sx={{ mt: 1, textTransform: "none" }}
                      disabled
                    >
                      Download
                    </Button>
                  </Box>
                ))
              )}
            </DashboardCard>
          </Box>

          <Box>
            <DashboardCard title="Approval Flow">
              {approvalFlow.length === 0 ? (
                <Typography color="text.secondary">
                  No approval history available.
                </Typography>
              ) : (
                <ApprovalTimeline steps={approvalFlow} />
              )}
            </DashboardCard>
          </Box>
        </Box>
      )}
    </DashboardLayout>
  );
}

// ============================================
// Reusable Info Row
// Displays label and value inside request details
// ============================================

function InfoRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mb: 1.5,
        gap: 2,
      }}
    >
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={700} textAlign="right">
        {value || "-"}
      </Typography>
    </Box>
  );
}