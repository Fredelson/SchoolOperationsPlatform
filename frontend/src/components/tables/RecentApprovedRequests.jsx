// ============================================
// ARAB UNITY SCHOOL
// Recent Approved Requests Component
// Live Backend Data Version
// ============================================

// MUI Components
import {
  Box,
  Chip,
  Typography,
} from "@mui/material";

// Reusable Dashboard Card
import DashboardCard from "../common/DashboardCard";

// ============================================
// Component
// Receives requests from HodDashboard.jsx
// ============================================
export default function RecentApprovedRequests({
  requests = [],
}) {
  // ============================================
  // Get latest approved requests
  // Backend status:
  // "Approved by HOD"
  // ============================================
  const recentApproved = requests
    .filter(
      (request) =>
        request.status?.toLowerCase() ===
        "approved by hod"
    )
    .sort(
      (a, b) =>
        new Date(b.rawSubmittedAt) -
        new Date(a.rawSubmittedAt)
    )
    .slice(0, 5);

  return (
    <DashboardCard title="Recent Approved Requests">
      {/* ============================================
          Empty State
      ============================================ */}
      {recentApproved.length === 0 && (
        <Typography color="text.secondary">
          No approved requests found.
        </Typography>
      )}

      {/* ============================================
          Approved Requests List
      ============================================ */}
      {recentApproved.map((request) => (
        <Box
          key={request.id}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            border: "1px solid #e5e7eb",
          }}
        >
          {/* ============================================
              Request Number + Status
          ============================================ */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            {/* Request Number */}
            <Typography fontWeight={700}>
              {request.requestNumber}
            </Typography>

            {/* Status Badge */}
            <Chip
              label="Approved"
              color="success"
              size="small"
            />
          </Box>

          {/* Teacher */}
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Teacher: {request.teacher}
          </Typography>

          {/* Department */}
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Department: {request.department}
          </Typography>

          {/* Subject */}
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Subject: {request.subject}
          </Typography>

          {/* Approval Comment */}
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Remarks:{" "}
            {request.approvalRemarks ||
              "Approved by HOD"}
          </Typography>

          {/* Approval Date */}
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Action Date:{" "}
            {request.actionDate ||
              request.submittedDate}
          </Typography>
        </Box>
      ))}
    </DashboardCard>
  );
}