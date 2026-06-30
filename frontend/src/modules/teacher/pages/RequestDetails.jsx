// ============================================
// ARAB UNITY SCHOOL
// Teacher - Request Details Page
// Modern UI
// Sidebar and Topbar are NOT changed
// ============================================

import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Typography,
  Button,
  Alert,
  Chip,
  LinearProgress,
  CircularProgress,
} from "@mui/material";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ScienceIcon from "@mui/icons-material/Science";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import FlagIcon from "@mui/icons-material/Flag";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DescriptionIcon from "@mui/icons-material/Description";
import LayersIcon from "@mui/icons-material/Layers";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AttachmentIcon from "@mui/icons-material/Attachment";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import PendingIcon from "@mui/icons-material/Pending";
import PrintIcon from "@mui/icons-material/Print";
import PaletteIcon from "@mui/icons-material/Palette";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import InfoIcon from "@mui/icons-material/Info";

import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "../../../components/layout/DashboardLayout";
import Sidebar from "../../../components/sidebar/Sidebar";
import Topbar from "../../../components/common/Topbar";
import usePageTitle from "@platform/hooks/usePageTitle";

import { useAuth } from "../../../context/AuthContext";

const API_URL = "http://localhost:5000/api";

// Theme colors
const NAVY = "#071E46";
const BLUE = "#2563EB";
const GREEN = "#198754";
const ORANGE = "#F59E0B";
const PURPLE = "#7C3AED";
const BG = "#F4F7FB";
const BORDER = "#E5EAF3";

export default function RequestDetails() {
  usePageTitle("RequestDetails");
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token } = useAuth();

  const [request, setRequest] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // Fetch request details
  // Backend route: GET /api/requests/:id
  // ============================================
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/requests/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("REQUEST DETAILS RESPONSE:", response.data);

        const data = response.data;

        // Supports different response structures safely
        setRequest(data.request || data.data?.request || null);
        setApprovals(data.approvals || data.data?.approvals || []);
        setAttachments(data.attachments || data.data?.attachments || []);
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
  // Workflow progress based on status
  // ============================================
  const workflow = useMemo(() => {
    const status = request?.Status || "";

    let completed = 1;

    if (status.includes("Approved by HOD")) completed = 2;
    if (status.includes("Approved by HOS")) completed = 3;
    if (status.includes("Printing")) completed = 3;
    if (status.includes("Completed")) completed = 4;

    return {
      completed,
      total: 4,
      percent: Math.round((completed / 4) * 100),
    };
  }, [request]);

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
      <Box sx={{ bgcolor: BG, minHeight: "100vh", p: { xs: 2, md: 3 } }}>
        <PageTitle onBack={() => navigate("/teacher/my-requests")} />

        {loading && (
          <Card>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CircularProgress size={24} />
              <Typography fontWeight={800}>
                Loading request details...
              </Typography>
            </Box>
          </Card>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && !request && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
            Request details not found.
          </Alert>
        )}

        {!loading && !error && request && (
          <>
            <HeroCard request={request} workflow={workflow} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1.45fr 0.95fr" },
                gap: 3,
                mb: 3,
              }}
            >
              <RequestSummary request={request} />
              <ApprovalActivity approvals={approvals} />
            </Box>

            <AttachmentsCard attachments={attachments} />

            <HelpCard />
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}

// ============================================
// Page Header
// ============================================
function PageTitle({ onBack }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconBox color={BLUE} size={64}>
          <AssignmentTurnedInIcon fontSize="large" />
        </IconBox>

        <Box>
          <Typography variant="h4" fontWeight={900} color={NAVY}>
            Request Details
          </Typography>
          <Typography color="#5B6B84">
            Track your request status and view all details.
          </Typography>
        </Box>
      </Box>

      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{
          textTransform: "none",
          borderRadius: 2.5,
          px: 2.2,
          py: 1,
          fontWeight: 900,
          bgcolor: "#fff",
          borderColor: "#BFD0F7",
          color: BLUE,
        }}
      >
        Back to My Requests
      </Button>
    </Box>
  );
}

// ============================================
// Top Hero Card
// ============================================
function HeroCard({ request, workflow }) {
  return (
    <Card
      sx={{
        mb: 3,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr 0.75fr" },
        alignItems: "center",
        gap: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <IconBox color={GREEN} size={88}>
          <AssignmentTurnedInIcon sx={{ fontSize: 48 }} />
        </IconBox>

        <Box>
          <Typography fontWeight={900} color={NAVY} fontSize={18}>
            {request.PurposeName || "Request"}
          </Typography>

          <Typography variant="h5" fontWeight={950} color={NAVY} sx={{ mt: 0.7 }}>
            {request.RequestNumber || "-"}
          </Typography>

          <Typography color="#5B6B84" fontWeight={700} sx={{ mt: 1 }}>
            Submitted on {formatDateTime(request.SubmittedAt)}
          </Typography>

          <Typography color="#5B6B84" fontWeight={700} sx={{ mt: 0.5 }}>
            Submitted by {request.TeacherName || "-"} ({request.EmployeeId || "-"})
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          borderLeft: { md: `1px solid ${BORDER}` },
          borderRight: { md: `1px solid ${BORDER}` },
          px: { md: 3 },
        }}
      >
        <StatusPill label={request.Status} type="success" />

        <Typography color="#5B6B84" fontWeight={800} sx={{ mt: 2 }}>
          Workflow Progress
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={workflow.percent}
            sx={{
              flex: 1,
              height: 10,
              borderRadius: 99,
              bgcolor: "#DDE3ED",
              "& .MuiLinearProgress-bar": {
                bgcolor: GREEN,
                borderRadius: 99,
              },
            }}
          />
          <Typography color={GREEN} fontWeight={950}>
            {workflow.percent}%
          </Typography>
        </Box>

        <Typography color="#5B6B84" fontWeight={700} sx={{ mt: 1.3 }}>
          {workflow.completed} of {workflow.total} steps completed
        </Typography>
      </Box>

      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconBox color={BLUE} size={110}>
          <AssignmentIcon sx={{ fontSize: 68 }} />
        </IconBox>
      </Box>
    </Card>
  );
}

// ============================================
// Request Summary
// ============================================
function RequestSummary({ request }) {
  return (
    <Card>
      <SectionTitle icon={<AssignmentTurnedInIcon />} title="Request Summary" />

      <Box sx={{ mt: 2 }}>
        <SummaryRow icon={<PersonIcon />} label="Teacher" value={request.TeacherName} />
        <SummaryRow icon={<BadgeIcon />} label="Employee ID" value={request.EmployeeId} />
        <SummaryRow icon={<ApartmentIcon />} label="Department" value={request.DepartmentName} />
        <SummaryRow icon={<ScienceIcon />} label="Subject" value={request.SubjectName} />
        <SummaryRow icon={<TrackChangesIcon />} label="Purpose" value={request.PurposeName} />
        <SummaryRow
          icon={<FlagIcon />}
          label="Priority"
          value={<StatusPill label={request.PriorityLevel || "Normal"} type="success" />}
        />
        <SummaryRow icon={<ContentCopyIcon />} label="Copies" value={request.Copies} />
        <SummaryRow icon={<DescriptionIcon />} label="Total Pages" value={request.TotalPages} />
        <SummaryRow icon={<LayersIcon />} label="Total Sheets" value={request.TotalSheets} />
        <SummaryRow
          icon={<CalendarMonthIcon />}
          label="Submitted Date"
          value={formatDateTime(request.SubmittedAt)}
          last
        />
      </Box>
    </Card>
  );
}

// ============================================
// Approval Activity
// ============================================
function ApprovalActivity({ approvals }) {
  const fallback = [
    {
      ApprovalRole: "HOD Review",
      ApprovalStatus: "Pending",
      Remarks: "Waiting for HOD approval",
    },
    {
      ApprovalRole: "HOS Approval",
      ApprovalStatus: "Pending",
      Remarks: "Waiting for HOS approval",
    },
    {
      ApprovalRole: "Printing Admin",
      ApprovalStatus: "Pending",
      Remarks: "Waiting for printing admin",
    },
    {
      ApprovalRole: "Printing",
      ApprovalStatus: "Pending",
      Remarks: "Request will be printed",
    },
  ];

  const items = approvals.length > 0 ? approvals : fallback;

  return (
    <Card sx={{ height: "100%" }}>
      <SectionTitle icon={<GroupsIcon />} title="Approval Activity" />

      <Box sx={{ mt: 3 }}>
        {items.map((item, index) => (
          <ActivityItem
            key={index}
            title={item.ApprovalRole}
            status={item.ApprovalStatus}
            remarks={item.Remarks || "No remarks."}
            isLast={index === items.length - 1}
          />
        ))}
      </Box>
    </Card>
  );
}

// ============================================
// Attachments Section
// ============================================
function AttachmentsCard({ attachments }) {
  return (
    <Card sx={{ mb: 3 }}>
      <SectionTitle icon={<AttachmentIcon />} title="Attachments" />

      {attachments.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No attachments uploaded.
        </Typography>
      ) : (
        attachments.map((file) => (
          <Box
            key={file.AttachmentId}
            sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 260px" },
              gap: 3,
              alignItems: "stretch",
            }}
          >
            <Box
              sx={{
                border: `1px solid ${BORDER}`,
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#FBFCFF",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  borderBottom: `1px solid ${BORDER}`,
                }}
              >
                <IconBox color="#DC2626" size={48}>
                  <PictureAsPdfIcon />
                </IconBox>

                <Box>
                  <Typography fontWeight={950} color={NAVY} fontSize={18}>
                    {file.OriginalFileName || file.FileName || "-"}
                  </Typography>

                  <Typography color="#64748B" fontWeight={700}>
                    {file.DocumentName || "No document name"} •{" "}
                    {file.FileType || "File"}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                <Metric icon={<DescriptionIcon />} label="Pages" value={file.PageCount} color={BLUE} />
                <Metric icon={<AssignmentIcon />} label="Selected Pages" value={file.SelectedPages} color="#64748B" />
                <Metric icon={<ContentCopyIcon />} label="Copies" value={file.Copies} color={GREEN} />
                <Metric icon={<DescriptionIcon />} label="Paper Size" value={file.PaperSize} color={ORANGE} />
                <Metric icon={<PrintIcon />} label="Print Type" value={file.PrintType} color={GREEN} />
                <Metric icon={<PaletteIcon />} label="Print Color" value={file.PrintColor} color="#475569" />
                <Metric icon={<ViewModuleIcon />} label="Pages / Sheet" value={file.PagesPerSheet} color="#F43F5E" />
                <Metric icon={<LayersIcon />} label="Sheets / Set" value={file.SheetsPerSet} color={PURPLE} />
                <Metric icon={<LayersIcon />} label="Total Sheets" value={file.TotalSheets} color={ORANGE} />
              </Box>
            </Box>

            <Box
              sx={{
                border: `1px solid ${BORDER}`,
                borderRadius: 3,
                bgcolor: "#FBFCFF",
                p: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 170,
                  height: 230,
                  borderRadius: 2,
                  bgcolor: "#fff",
                  border: `1px solid ${BORDER}`,
                  display: "grid",
                  placeItems: "center",
                  color: "#94A3B8",
                }}
              >
                <DescriptionIcon sx={{ fontSize: 70 }} />
              </Box>

              <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 900,
                  }}
                  component="a"
                  href={`${API_URL.replace("/api", "")}${file.FilePath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 900,
                    bgcolor: BLUE,
                  }}
                  component="a"
                  href={`${API_URL.replace("/api", "")}${file.FilePath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </Button>
              </Box>
            </Box>
          </Box>
        ))
      )}
    </Card>
  );
}

// ============================================
// Help Card
// ============================================
function HelpCard() {
  return (
    <Box
      sx={{
        border: "1px solid #BFD0F7",
        bgcolor: "#F8FBFF",
        borderRadius: 3,
        p: 2.2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconBox color={NAVY} size={48}>
          <InfoIcon />
        </IconBox>

        <Box>
          <Typography fontWeight={950} color={NAVY}>
            Need Help?
          </Typography>
          <Typography color="#5B6B84">
            If you have any questions about this request, please contact the
            printing admin.
          </Typography>
        </Box>
      </Box>

      <Button
        variant="outlined"
        startIcon={<HeadsetMicIcon />}
        sx={{
          textTransform: "none",
          borderRadius: 2,
          fontWeight: 900,
          bgcolor: "#fff",
          color: BLUE,
          borderColor: "#BFD0F7",
          display: { xs: "none", sm: "inline-flex" },
        }}
      >
        Contact Printing Admin
      </Button>
    </Box>
  );
}

// ============================================
// Reusable Card
// ============================================
function Card({ children, sx }) {
  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        p: { xs: 2, md: 2.6 },
        boxShadow: "0 18px 45px rgba(15, 23, 42, 0.06)",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

// ============================================
// Reusable Section Title
// ============================================
function SectionTitle({ icon, title }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
      <IconBox color={BLUE} size={38}>
        {icon}
      </IconBox>

      <Typography variant="h6" fontWeight={950} color={NAVY}>
        {title}
      </Typography>
    </Box>
  );
}

// ============================================
// Reusable Summary Row
// ============================================
function SummaryRow({ icon, label, value, last }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "32px 1fr auto",
        alignItems: "center",
        gap: 1.4,
        py: 1.35,
        borderBottom: last ? "none" : "1px dashed #DCE4F0",
      }}
    >
      <Box sx={{ color: "#64748B", display: "grid", placeItems: "center" }}>
        {icon}
      </Box>

      <Typography color="#5B6B84" fontWeight={800}>
        {label}
      </Typography>

      {typeof value === "object" ? (
        value
      ) : (
        <Typography color={NAVY} fontWeight={950} textAlign="right">
          {value || "-"}
        </Typography>
      )}
    </Box>
  );
}

// ============================================
// Approval Activity Item
// ============================================
function ActivityItem({ title, status, remarks, isLast }) {
  const approved = String(status || "").toLowerCase().includes("approved");
  const pending = String(status || "").toLowerCase().includes("pending");

  const color = approved ? GREEN : pending ? BLUE : ORANGE;

  return (
    <Box sx={{ display: "flex", gap: 1.6 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box sx={{ color }}>
          {approved ? (
            <CheckCircleIcon />
          ) : pending ? (
            <PendingIcon />
          ) : (
            <RadioButtonUncheckedIcon />
          )}
        </Box>

        {!isLast && (
          <Box
            sx={{
              width: 2,
              minHeight: 62,
              bgcolor: "#D7DFEC",
              my: 0.5,
            }}
          />
        )}
      </Box>

      <Box sx={{ pb: isLast ? 0 : 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography fontWeight={950} color={NAVY}>
            {title || "Approver"}
          </Typography>

          <StatusPill
            label={status || "Pending"}
            type={approved ? "success" : "default"}
          />
        </Box>

        <Typography color="#5B6B84" fontWeight={700} sx={{ mt: 0.6 }}>
          {remarks}
        </Typography>
      </Box>
    </Box>
  );
}

// ============================================
// Attachment Metric Box
// ============================================
function Metric({ icon, label, value, color }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        bgcolor: "#fff",
        border: `1px solid ${BORDER}`,
        display: "flex",
        alignItems: "center",
        gap: 1.3,
      }}
    >
      <IconBox color={color} size={38}>
        {icon}
      </IconBox>

      <Box>
        <Typography fontSize={12.5} color="#64748B" fontWeight={900}>
          {label}
        </Typography>
        <Typography color={NAVY} fontWeight={950}>
          {value || "-"}
        </Typography>
      </Box>
    </Box>
  );
}

// ============================================
// Reusable Icon Box
// ============================================
function IconBox({ children, color, size = 42 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: size > 70 ? 4 : 2.5,
        bgcolor: `${color}14`,
        color,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}

// ============================================
// Reusable Status Pill
// ============================================
function StatusPill({ label, type = "default" }) {
  const styles = {
    success: {
      bgcolor: "#DCFCE7",
      color: "#15803D",
      borderColor: "#BBF7D0",
    },
    default: {
      bgcolor: "#EAF0FF",
      color: BLUE,
      borderColor: "#C7D2FE",
    },
  };

  return (
    <Chip
      size="small"
      label={label || "-"}
      sx={{
        height: 28,
        borderRadius: 999,
        fontWeight: 950,
        border: "1px solid",
        ...styles[type],
      }}
    />
  );
}

// ============================================
// Date Formatter
// ============================================
function formatDateTime(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
