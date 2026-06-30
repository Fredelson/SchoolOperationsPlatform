// ============================================
// ARAB UNITY SCHOOL
// Teacher - My Requests Page
// Modern Card + Dynamic Workflow Timeline UI
// Connected to Backend API
//
// IMPORTANT WORKFLOW RULE:
//
// If TotalSheets <= 500:
// Teacher → HOD Review → Printing
//
// If TotalSheets > 500:
// Teacher → HOD Review → HOS Approval → Printing
//
// This means HOS Approval is hidden automatically
// for requests that do not need HOS approval.
// ============================================

import { useEffect, useMemo, useState } from "react";

import {
  Box,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Pagination,
} from "@mui/material";

// ============================================
// Material UI Icons
// ============================================

import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CancelIcon from "@mui/icons-material/Cancel";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "../../../components/layout/DashboardLayout";
import Sidebar from "../../../components/sidebar/Sidebar";
import Topbar from "../../../components/common/Topbar";
import PageHeader from "../../../components/common/PageHeader";
import usePageTitle from "@platform/hooks/usePageTitle";

import { useAuth } from "../../../context/AuthContext";

const API_URL = "http://localhost:5000/api";

export default function MyRequests() {
  usePageTitle("MyRequests");
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const requestsPerPage = 5;

  // ============================================
  // Fetch active teacher requests
  // Backend route: GET /api/requests/my-requests
  // ============================================

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/requests/my-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(response.data || []);
    } catch (err) {
      console.error("Fetch My Requests Error:", err);
      setError("Unable to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Cancel request
  // Backend keeps the request and attachments.
  // Frontend removes it from My Requests immediately.
  // ============================================

  const handleCancelRequest = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this request?"
    );

    if (!confirmed) return;

    try {
      await axios.put(
        `${API_URL}/requests/${requestId}/cancel`,
        {
          remarks: "Cancelled by teacher",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((prev) =>
        prev.filter((request) => request.RequestId !== requestId)
      );

      alert("Request cancelled successfully.");
    } catch (err) {
      console.error("Cancel Request Error:", err);
      alert(err.response?.data?.message || "Unable to cancel request.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
    }
  }, [token]);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchText, statusFilter]);

  // ============================================
  // Filter requests
  // Cancelled requests are hidden from My Requests.
  // ============================================

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (request.Status === "Cancelled by Teacher") {
        return false;
      }

      const requestNumber = request.RequestNumber || "";
      const purpose = request.PurposeName || "";
      const subject = request.SubjectName || "";
      const status = request.Status || "";

      const matchesSearch =
        requestNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        purpose.toLowerCase().includes(searchText.toLowerCase()) ||
        subject.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchText, statusFilter]);

  // Latest requests first
  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      return new Date(b.SubmittedAt || 0) - new Date(a.SubmittedAt || 0);
    });
  }, [filteredRequests]);

  // Pagination
  const totalPages = Math.ceil(sortedRequests.length / requestsPerPage);

  const paginatedRequests = sortedRequests.slice(
    (page - 1) * requestsPerPage,
    page * requestsPerPage
  );

  // ============================================
  // Summary counts
  // ============================================

  const activeRequests = requests.filter((request) => {
    const status = request.Status?.toLowerCase() || "";

    return (
      !status.includes("completed") &&
      !status.includes("rejected") &&
      !status.includes("cancelled")
    );
  }).length;

  const completedRequests = requests.filter(
    (request) => request.Status === "Completed"
  ).length;

  const pendingRequests = requests.filter(
    (request) => request.Status === "Pending"
  ).length;

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
      {/* ============================================ */}
      {/* Page Header */}
      {/* ============================================ */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <PageHeader
          title="My Requests"
          subtitle="Track and manage your active photocopy requests."
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/teacher/create-request")}
          sx={{
            bgcolor: "#2E8B3C",
            borderRadius: 3,
            px: 3,
            py: 1.2,
            textTransform: "none",
            fontWeight: 700,
            "&:hover": {
              bgcolor: "#256F31",
            },
          }}
        >
          Create New Request
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* ============================================ */}
      {/* Summary Cards */}
      {/* ============================================ */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
          mb: 3,
        }}
      >
        <SummaryCard
          title="Active Requests"
          value={activeRequests}
          subtitle="Currently in progress"
          icon={<PendingActionsIcon />}
          color="#2E8B3C"
          bg="#EAF7EE"
        />

        <SummaryCard
          title="Completed Requests"
          value={completedRequests}
          subtitle="Already completed"
          icon={<CheckCircleIcon />}
          color="#2563EB"
          bg="#EAF1FF"
        />

        <SummaryCard
          title="Pending Requests"
          value={pendingRequests}
          subtitle="Waiting for review"
          icon={<Inventory2Icon />}
          color="#F59E0B"
          bg="#FFF4DE"
        />
      </Box>

      {/* ============================================ */}
      {/* Search and Filter */}
      {/* ============================================ */}

      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
          mb: 2,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 220px",
              },
              gap: 2,
            }}
          >
            <TextField
              size="small"
              placeholder="Search request ID, purpose or subject..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved by HOD">Approved by HOD</MenuItem>
              <MenuItem value="Pending HOS Approval">
                Pending HOS Approval
              </MenuItem>
              <MenuItem value="Approved by HOS">Approved by HOS</MenuItem>
              <MenuItem value="Forwarded to Printing">
                Forwarded to Printing
              </MenuItem>
              <MenuItem value="Printing">Printing</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Rejected by HOD">Rejected by HOD</MenuItem>
              <MenuItem value="Rejected by HOS">Rejected by HOS</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* Loading State */}
      {/* ============================================ */}

      {loading && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
          <Typography mt={2}>Loading requests...</Typography>
        </Box>
      )}

      {/* ============================================ */}
      {/* Empty State */}
      {/* ============================================ */}

      {!loading && sortedRequests.length === 0 && (
        <Card sx={{ borderRadius: 4, p: 4, textAlign: "center" }}>
          <Typography fontWeight={700}>No active requests found.</Typography>
          <Typography color="text.secondary">
            Create a new request or check history later.
          </Typography>
        </Card>
      )}

      {/* ============================================ */}
      {/* Request Cards */}
      {/* ============================================ */}

      {!loading && paginatedRequests.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {paginatedRequests.map((request) => (
            <RequestCard
              key={request.RequestId}
              request={request}
              onView={() =>
                navigate(`/teacher/request-details/${request.RequestId}`)
              }
              onCancel={() => handleCancelRequest(request.RequestId)}
            />
          ))}

          {/* Pagination Footer */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography color="text.secondary">
              Showing {(page - 1) * requestsPerPage + 1} to{" "}
              {Math.min(page * requestsPerPage, sortedRequests.length)} of{" "}
              {sortedRequests.length} requests
            </Typography>

            {totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            )}
          </Box>
        </Box>
      )}
    </DashboardLayout>
  );
}

// ============================================
// Summary Card Component
// ============================================

function SummaryCard({ title, value, subtitle, icon, color, bg }) {
  return (
    <Card sx={{ borderRadius: 4, boxShadow: "0 8px 25px rgba(0,0,0,0.06)" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: 4,
              bgcolor: bg,
              color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography fontWeight={700}>{title}</Typography>
            <Typography variant="h4" fontWeight={800}>
              {value}
            </Typography>
            <Typography color="text.secondary" fontSize={14}>
              {subtitle}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================
// Request Card Component
// ============================================

function RequestCard({ request, onView, onCancel }) {
  const status = request.Status || "Pending";
  const statusStyle = getStatusStyle(status);

  // Teacher can cancel only before printing starts/completed/rejected
  const canCancel = [
    "Pending",
    "Approved by HOD",
    "Forwarded to HOS",
    "Pending HOS Approval",
    "Approved by HOS",
    "Forwarded to Printing",
  ].includes(status);

  return (
    <Card sx={{ borderRadius: 4, boxShadow: "0 8px 25px rgba(0,0,0,0.06)" }}>
      <CardContent>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "320px 1fr 220px",
            },
            gap: 3,
            alignItems: "center",
          }}
        >
          {/* Left Request Info */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 4,
                bgcolor: statusStyle.bg,
                color: statusStyle.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <DescriptionIcon />
            </Box>

            <Box>
              <Typography fontWeight={800} fontSize={18}>
                {request.RequestNumber}
              </Typography>

              <Typography fontWeight={700} color={statusStyle.color}>
                {request.PurposeName || "No purpose"}
              </Typography>

              <Typography color="text.secondary" fontSize={14}>
                {request.TotalPages || 0} Pages • {request.TotalSheets || 0}{" "}
                Sheets
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 0.5,
                }}
              >
                <CalendarMonthIcon sx={{ fontSize: 16, color: "#64748B" }} />
                <Typography color="text.secondary" fontSize={13}>
                  Submitted:{" "}
                  {request.SubmittedAt
                    ? new Date(request.SubmittedAt).toLocaleDateString()
                    : "-"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Dynamic Workflow Timeline */}
          <WorkflowTimeline
            status={status}
            totalSheets={request.TotalSheets}
          />

          {/* Right Actions */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: {
                xs: "flex-start",
                lg: "flex-end",
              },
              gap: 2,
            }}
          >
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                display: {
                  xs: "none",
                  lg: "block",
                },
              }}
            />

            <Box>
              <Chip
                label={status}
                sx={{
                  bgcolor: statusStyle.bg,
                  color: statusStyle.color,
                  fontWeight: 800,
                  mb: 1,
                }}
              />

              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  onClick={onView}
                  sx={{
                    border: "1px solid #E2E8F0",
                    borderRadius: 2,
                  }}
                >
                  <VisibilityIcon sx={{ color: "#2563EB" }} />
                </IconButton>

                {canCancel && (
                  <IconButton
                    onClick={onCancel}
                    sx={{
                      border: "1px solid #E2E8F0",
                      borderRadius: 2,
                    }}
                  >
                    <CancelIcon sx={{ color: "#DC2626" }} />
                  </IconButton>
                )}

                <IconButton
                  disabled
                  sx={{
                    border: "1px solid #E2E8F0",
                    borderRadius: 2,
                  }}
                >
                  <DownloadIcon sx={{ color: "#94A3B8" }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================
// Dynamic Workflow Timeline Component
//
// This component receives:
// - status
// - totalSheets
//
// It decides whether to show:
// 3 steps: Submitted → HOD Review → Printing
// or
// 4 steps: Submitted → HOD Review → HOS Approval → Printing
// ============================================

function WorkflowTimeline({ status, totalSheets }) {
  const steps = getWorkflowSteps(status, totalSheets);

  return (
    <Box>
      <Box
        sx={{
          display: "grid",

          // Important:
          // Uses dynamic column count.
          // If HOS is hidden, it becomes 3 columns.
          // If HOS is needed, it becomes 4 columns.
          gridTemplateColumns: `repeat(${steps.length}, 1fr)`,

          alignItems: "start",
          gap: 1,
        }}
      >
        {steps.map((step, index) => (
          <Box
            key={`${step.label}-${index}`}
            sx={{ position: "relative", textAlign: "center" }}
          >
            {/* Connecting line between steps */}
            {index < steps.length - 1 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 13,
                  left: "50%",
                  width: "100%",
                  height: 2,
                  bgcolor: step.done ? step.color : "#CBD5E1",
                  zIndex: 0,
                }}
              />
            )}

            {/* Circle Indicator */}
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor:
                  step.active || step.done || step.rejected
                    ? step.color
                    : "#FFFFFF",
                border: `2px solid ${
                  step.active || step.done || step.rejected
                    ? step.color
                    : "#CBD5E1"
                }`,
                color: "#FFFFFF",
                mx: "auto",
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {step.done ? "✓" : step.rejected ? "×" : ""}
            </Box>

            {/* Step Label */}
            <Typography
              fontSize={13}
              fontWeight={700}
              mt={1}
              color={
                step.active || step.done || step.rejected
                  ? step.color
                  : "#475569"
              }
            >
              {step.label}
            </Typography>

            {/* Step Caption */}
            <Typography
              fontSize={12}
              color={step.active || step.rejected ? step.color : "text.secondary"}
            >
              {step.caption}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ============================================
// Status Style Helper
// ============================================

function getStatusStyle(status) {
  const lower = status.toLowerCase();

  if (lower.includes("cancelled")) {
    return { color: "#6B7280", bg: "#F3F4F6" };
  }

  if (lower.includes("rejected")) {
    return { color: "#DC2626", bg: "#FEE2E2" };
  }

  if (lower.includes("completed")) {
    return { color: "#15803D", bg: "#DCFCE7" };
  }

  if (lower.includes("printing")) {
    return { color: "#2563EB", bg: "#DBEAFE" };
  }

  if (lower.includes("approved")) {
    return { color: "#15803D", bg: "#DCFCE7" };
  }

  return { color: "#D97706", bg: "#FEF3C7" };
}

// ============================================
// Dynamic Workflow Helper
//
// This is the most important logic.
//
// If TotalSheets <= 500:
// Submitted → HOD Review → Printing
//
// If TotalSheets > 500:
// Submitted → HOD Review → HOS Approval → Printing
// ============================================

function getWorkflowSteps(status, totalSheets) {
  const lower = (status || "").toLowerCase();

  const needsHos = Number(totalSheets || 0) > 500;

  const isRejected = lower.includes("rejected");
  const isRejectedByHod = lower.includes("rejected by hod");
  const isRejectedByHos = lower.includes("rejected by hos");

  const isPending = lower === "pending";
  const isApprovedByHod = lower.includes("approved by hod");
  const isApprovedByHos = lower.includes("approved by hos");
  const isForwardedToPrinting = lower.includes("forwarded to printing");
  const isPrinting = lower.includes("printing");
  const isCompleted = lower.includes("completed");

  // ============================================
  // REJECTED REQUESTS
  // ============================================

  if (isRejected) {
    // HOD rejected request
    if (isRejectedByHod) {
      return [
        {
          label: "Submitted",
          caption: "Done",
          done: true,
          active: false,
          rejected: false,
          color: "#15803D",
        },
        {
          label: "HOD Review",
          caption: "Rejected",
          done: false,
          active: false,
          rejected: true,
          color: "#DC2626",
        },
        {
          label: "Printing",
          caption: "Stopped",
          done: false,
          active: false,
          rejected: false,
          color: "#CBD5E1",
        },
      ];
    }

    // HOS rejected request
    if (isRejectedByHos) {
      return [
        {
          label: "Submitted",
          caption: "Done",
          done: true,
          active: false,
          rejected: false,
          color: "#15803D",
        },
        {
          label: "HOD Review",
          caption: "Approved",
          done: true,
          active: false,
          rejected: false,
          color: "#15803D",
        },
        {
          label: "HOS Approval",
          caption: "Rejected",
          done: false,
          active: false,
          rejected: true,
          color: "#DC2626",
        },
        {
          label: "Printing",
          caption: "Stopped",
          done: false,
          active: false,
          rejected: false,
          color: "#CBD5E1",
        },
      ];
    }
  }

  // ============================================
  // SMALL REQUESTS
  // TotalSheets <= 500
  // Teacher → HOD Review → Printing
  //
  // HOS Approval is NOT shown here.
  // ============================================

  if (!needsHos) {
    return [
      {
        label: "Submitted",
        caption: "Done",
        done: true,
        active: false,
        rejected: false,
        color: "#15803D",
      },

      {
        label: "HOD Review",
        caption:
          isApprovedByHod || isForwardedToPrinting || isPrinting || isCompleted
            ? "Approved"
            : "In Review",

        done:
          isApprovedByHod || isForwardedToPrinting || isPrinting || isCompleted,

        active: isPending,

        rejected: false,

        color:
          isApprovedByHod || isForwardedToPrinting || isPrinting || isCompleted
            ? "#15803D"
            : "#F59E0B",
      },

      {
        label: "Printing",
        caption: isCompleted
          ? "Completed"
          : isPrinting
          ? "In Progress"
          : isApprovedByHod || isForwardedToPrinting
          ? "Pending"
          : "Waiting",

        done: isCompleted,

        active: isApprovedByHod || isForwardedToPrinting || isPrinting,

        rejected: false,

        color: isCompleted ? "#15803D" : "#2563EB",
      },
    ];
  }

  // ============================================
  // LARGE REQUESTS
  // TotalSheets > 500
  // Teacher → HOD Review → HOS Approval → Printing
  //
  // HOS Approval is shown here because HOS approval is required.
  // ============================================

  return [
    {
      label: "Submitted",
      caption: "Done",
      done: true,
      active: false,
      rejected: false,
      color: "#15803D",
    },

    {
      label: "HOD Review",
      caption:
        isApprovedByHod ||
        isApprovedByHos ||
        isForwardedToPrinting ||
        isPrinting ||
        isCompleted
          ? "Approved"
          : "In Review",

      done:
        isApprovedByHod ||
        isApprovedByHos ||
        isForwardedToPrinting ||
        isPrinting ||
        isCompleted,

      active: isPending,

      rejected: false,

      color:
        isApprovedByHod ||
        isApprovedByHos ||
        isForwardedToPrinting ||
        isPrinting ||
        isCompleted
          ? "#15803D"
          : "#F59E0B",
    },

    {
      label: "HOS Approval",
      caption:
        isApprovedByHos || isForwardedToPrinting || isPrinting || isCompleted
          ? "Approved"
          : "Pending",

      done: isApprovedByHos || isForwardedToPrinting || isPrinting || isCompleted,

      active:
        isApprovedByHod &&
        !isApprovedByHos &&
        !isForwardedToPrinting &&
        !isPrinting &&
        !isCompleted,

      rejected: false,

      color:
        isApprovedByHos || isForwardedToPrinting || isPrinting || isCompleted
          ? "#15803D"
          : "#2563EB",
    },

    {
      label: "Printing",
      caption: isCompleted
        ? "Completed"
        : isPrinting
        ? "In Progress"
        : isApprovedByHos || isForwardedToPrinting
        ? "Pending"
        : "Waiting",

      done: isCompleted,

      active: isApprovedByHos || isForwardedToPrinting || isPrinting,

      rejected: false,

      color: isCompleted ? "#15803D" : "#2563EB",
    },
  ];
}
