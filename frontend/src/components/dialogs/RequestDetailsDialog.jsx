// ============================================
// ARAB UNITY SCHOOL
// Reusable Request Details Dialog
// Modern UI Version
//
// Used by HOD and HOS dashboards.
// Prevents double approve/reject clicks.
// ============================================

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CategoryIcon from "@mui/icons-material/Category";
import PrintIcon from "@mui/icons-material/Print";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import RouteIcon from "@mui/icons-material/Route";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";

export default function RequestDetailsDialog({
  open,
  request,
  comment,
  setComment,
  onClose,
  onApprove,
  onReturn,
  onReject,
  actionLoading = false,
}) {
  // ============================================
  // Do not render if no request is selected
  // ============================================
  if (!request) return null;

  // ============================================
  // Status styling helper
  // ============================================
  const getStatusStyle = (status = "") => {
    if (status.includes("Rejected")) {
      return {
        color: "#DC2626",
        bg: "#FEE2E2",
        icon: <CancelIcon />,
      };
    }

    if (status.includes("Approved") || status.includes("Completed")) {
      return {
        color: "#15803D",
        bg: "#DCFCE7",
        icon: <CheckCircleIcon />,
      };
    }

    if (status.includes("Forwarded")) {
      return {
        color: "#2563EB",
        bg: "#DBEAFE",
        icon: <PrintIcon />,
      };
    }

    return {
      color: "#D97706",
      bg: "#FEF3C7",
      icon: <PendingIcon />,
    };
  };

  const statusStyle = getStatusStyle(request.status);

  // ============================================
  // Main UI
  // ============================================

  return (
    <Dialog
      open={open}
      onClose={actionLoading ? undefined : onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: "hidden",
          background: "#F8FAFC",
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={900}>
              Request Details
            </Typography>

            <Typography color="text.secondary" fontSize={14}>
              Review request information, attachments, and approval status.
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={actionLoading}
            sx={{
              border: "1px solid #E2E8F0",
              borderRadius: 3,
              bgcolor: "#F8FAFC",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
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
          {/* Left Column */}
          <Box>
            {/* Request Information */}
            <ModernSection
              icon={<AssignmentIcon />}
              title="Request Information"
              subtitle="Main request details submitted by the teacher."
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr",
                  },
                  border: "1px solid #E2E8F0",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <InfoRow
                  icon={<AssignmentIcon />}
                  label="Request ID"
                  value={request.requestNumber || "-"}
                />

                <InfoRow
                  icon={<PriorityHighIcon />}
                  label="Priority"
                  value={
                    <Chip
                      label={request.priority || "-"}
                      size="small"
                      sx={{
                        bgcolor:
                          request.priority === "Urgent"
                            ? "#FEE2E2"
                            : "#FEF3C7",
                        color:
                          request.priority === "Urgent"
                            ? "#DC2626"
                            : "#D97706",
                        fontWeight: 800,
                      }}
                    />
                  }
                />

                <InfoRow
                  icon={<PersonIcon />}
                  label="Teacher"
                  value={request.teacher || "-"}
                />

                <InfoRow
                  icon={<PrintIcon />}
                  label="Copies"
                  value={request.copies || 0}
                />

                <InfoRow
                  icon={<BadgeIcon />}
                  label="Employee ID"
                  value={request.employeeId || "-"}
                />

                <InfoRow
                  icon={<DescriptionValue />}
                  label="Total Pages"
                  value={request.pages || 0}
                />

                <InfoRow
                  icon={<ApartmentIcon />}
                  label="Department"
                  value={request.department || "-"}
                />

                <InfoRow
                  icon={<DescriptionValue />}
                  label="Total Sheets"
                  value={request.sheets || 0}
                />

                <InfoRow
                  icon={<MenuBookIcon />}
                  label="Subject"
                  value={request.subject || "-"}
                />

                <InfoRow
                  icon={<CalendarMonthIcon />}
                  label="Submitted Date"
                  value={request.submittedDate || "-"}
                />

                <InfoRow
                  icon={<CategoryIcon />}
                  label="Purpose"
                  value={request.purpose || "-"}
                />

                <InfoRow
                  icon={statusStyle.icon}
                  label="Status"
                  value={
                    <Chip
                      label={request.status || "-"}
                      size="small"
                      sx={{
                        bgcolor: statusStyle.bg,
                        color: statusStyle.color,
                        fontWeight: 900,
                      }}
                    />
                  }
                />
              </Box>
            </ModernSection>

            {/* Printing Details */}
            <ModernSection
              icon={<PrintIcon />}
              title="Printing Details"
              subtitle="Printing preferences and request notes."
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr",
                  },
                  gap: 2,
                }}
              >
                <MiniInfo label="Paper Size" value={request.paperSize || "-"} />
                <MiniInfo label="Print Type" value={request.printType || "-"} />
                <MiniInfo label="Print Side" value={request.printSide || "-"} />
                <MiniInfo
                  label="Exam Paper"
                  value={
                    request.isExam === true || request.isExam === 1
                      ? "Yes"
                      : "No"
                  }
                />
                <MiniInfo label="Due Date" value={request.dueDate || "-"} />
                <MiniInfo
                  label="Request Remarks"
                  value={request.requestRemarks || "-"}
                />
              </Box>
            </ModernSection>

            {/* Attachments */}
            <ModernSection
              icon={<AttachFileIcon />}
              title="Attachments"
              subtitle="Uploaded files linked to this request."
            >
              {request.attachments?.length > 0 ? (
                <Box sx={{ display: "grid", gap: 1.5 }}>
                  {request.attachments.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            bgcolor: "#DBEAFE",
                            color: "#2563EB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <AttachFileIcon />
                        </Box>

                        <Box>
                          <Typography fontWeight={800}>{file}</Typography>
                          <Typography color="text.secondary" fontSize={13}>
                            Attachment #{index + 1}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        label="Uploaded"
                        size="small"
                        sx={{
                          bgcolor: "#DCFCE7",
                          color: "#15803D",
                          fontWeight: 800,
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: "#FFFFFF",
                    border: "1px dashed #CBD5E1",
                    textAlign: "center",
                  }}
                >
                  <AttachFileIcon sx={{ color: "#94A3B8", mb: 1 }} />
                  <Typography fontWeight={800}>
                    No attachments uploaded.
                  </Typography>
                  <Typography color="text.secondary" fontSize={14}>
                    Uploaded files will appear here.
                  </Typography>
                </Box>
              )}
            </ModernSection>
          </Box>

          {/* Right Column */}
          <Box>
            {/* Approval Flow */}
            <ModernSection
              icon={<RouteIcon />}
              title="Approval Flow"
              subtitle="Track request approval progress."
            >
              <ApprovalFlow request={request} />
            </ModernSection>

            {/* Approval Comment */}
            <ModernSection
              title="Approval Comment"
              subtitle="Add remarks before approving, returning, or rejecting."
            >
              <TextField
                label="Approval Comment / Remarks"
                placeholder="Add comment before approving, returning, or rejecting..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                fullWidth
                multiline
                minRows={5}
                disabled={actionLoading}
              />
            </ModernSection>
          </Box>
        </Box>
      </DialogContent>

      {/* Action Buttons */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          bgcolor: "#FFFFFF",
          borderTop: "1px solid #E2E8F0",
        }}
      >
        <Button
          onClick={onClose}
          disabled={actionLoading}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            borderRadius: 3,
          }}
        >
          Cancel
        </Button>

        <Button
          color="warning"
          variant="outlined"
          onClick={onReturn}
          disabled={actionLoading}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            borderRadius: 3,
          }}
        >
          Return for Revision
        </Button>

        <Button
          color="error"
          variant="outlined"
          onClick={onReject}
          disabled={actionLoading}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            borderRadius: 3,
          }}
        >
          Reject
        </Button>

        <Button
          color="success"
          variant="contained"
          onClick={onApprove}
          disabled={actionLoading}
          sx={{
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 3,
            px: 3,
          }}
        >
          {actionLoading ? "Processing..." : "Approve"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================
// Modern Section Card
// ============================================

function ModernSection({ icon, title, subtitle, children }) {
  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        borderRadius: 5,
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2.5 }}>
        {icon && (
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 3,
              bgcolor: "#EAF7EE",
              color: "#0B8F4D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        )}

        <Box>
          <Typography variant="h6" fontWeight={900}>
            {title}
          </Typography>

          {subtitle && (
            <Typography color="text.secondary" fontSize={14}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {children}
    </Box>
  );
}

// ============================================
// Info Row
// ============================================

function InfoRow({ icon, label, value }) {
  return (
    <Box
      sx={{
        p: 2,
        minHeight: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        borderBottom: "1px solid #E2E8F0",
        borderRight: {
          xs: "none",
          md: "1px solid #E2E8F0",
        },
        bgcolor: "#FFFFFF",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ color: "#6366F1", display: "flex" }}>{icon}</Box>

        <Typography color="text.secondary" fontWeight={700}>
          {label}
        </Typography>
      </Box>

      <Typography fontWeight={900} textAlign="right">
        {value}
      </Typography>
    </Box>
  );
}

// ============================================
// Small Information Box
// ============================================

function MiniInfo({ label, value }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: "#F8FAFC",
        border: "1px solid #E2E8F0",
      }}
    >
      <Typography color="text.secondary" fontSize={13}>
        {label}
      </Typography>

      <Typography fontWeight={900}>{value}</Typography>
    </Box>
  );
}

// ============================================
// Approval Flow Timeline
// ============================================

function ApprovalFlow({ request }) {
  const steps = [
    {
      label: "HOD",
      status: request.status?.includes("Rejected by HOD")
        ? "Rejected"
        : request.status?.includes("Pending")
        ? "Pending"
        : "Approved",
    },
    {
      label: "HOS",
      status: request.status?.includes("HOS")
        ? request.status?.includes("Rejected")
          ? "Rejected"
          : "Pending"
        : request.sheets > 500
        ? "Pending"
        : "Skipped",
    },
    {
      label: "Printing Section",
      status: request.status?.includes("Printing")
        ? "In Progress"
        : request.status?.includes("Completed")
        ? "Completed"
        : "Pending",
    },
    {
      label: "Completed",
      status: request.status?.includes("Completed") ? "Completed" : "Pending",
    },
  ];

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {steps.map((step, index) => {
        const style = getStepStyle(step.status);

        return (
          <Box key={step.label} sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  bgcolor: style.bg,
                  color: style.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                }}
              >
                {index + 1}
              </Box>

              {index < steps.length - 1 && (
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    minHeight: 32,
                    bgcolor: "#CBD5E1",
                    my: 0.5,
                  }}
                />
              )}
            </Box>

            <Box>
              <Typography fontWeight={900}>{step.label}</Typography>

              <Chip
                label={step.status}
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: style.bg,
                  color: style.color,
                  fontWeight: 800,
                }}
              />

              <Typography color="text.secondary" fontSize={13} mt={0.8}>
                {step.status === "Skipped"
                  ? "Not required for this request"
                  : step.status === "Completed"
                  ? "Step completed"
                  : step.status === "Rejected"
                  ? "Request rejected at this stage"
                  : step.status === "In Progress"
                  ? "Currently being processed"
                  : "Waiting for action"}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ============================================
// Step Style Helper
// ============================================

function getStepStyle(status) {
  if (status === "Approved" || status === "Completed") {
    return { bg: "#DCFCE7", color: "#15803D" };
  }

  if (status === "Rejected") {
    return { bg: "#FEE2E2", color: "#DC2626" };
  }

  if (status === "In Progress") {
    return { bg: "#DBEAFE", color: "#2563EB" };
  }

  if (status === "Skipped") {
    return { bg: "#F1F5F9", color: "#64748B" };
  }

  return { bg: "#FEF3C7", color: "#D97706" };
}

// ============================================
// Small Icon Placeholder
// ============================================

function DescriptionValue() {
  return <AssignmentIcon />;
}