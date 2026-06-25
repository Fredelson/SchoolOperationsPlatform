// ============================================
// ARAB UNITY SCHOOL
// Recent Rejected Requests Component
// Live Backend Data Version
// ============================================

// MUI Components
import { Box, Chip, Typography } from "@mui/material";

// Reusable Dashboard Card
import DashboardCard from "../common/DashboardCard";

// ============================================
// Component
// Receives requests from HodDashboard.jsx
// ============================================
export default function RecentRejectedRequests({
  requests = [],
}) {
  // ============================================
  // Get latest rejected requests
  // Backend status:
  // "Rejected by HOD"
  // ============================================
  const recentRejected = requests
    .filter(
      (request) =>
        request.status?.toLowerCase() ===
        "rejected by hod"
    )
    .sort(
      (a, b) =>
        new Date(b.rawSubmittedAt) -
        new Date(a.rawSubmittedAt)
    )
    .slice(0, 5);

  return (
    <DashboardCard title="Recent Rejected Requests">
      {/* ============================================
          Empty State
      ============================================ */}
      {recentRejected.length === 0 && (
        <Typography color="text.secondary">
          No rejected requests found.
        </Typography>
      )}

      {/* ============================================
          Rejected Requests List
      ============================================ */}
      {recentRejected.map((request) => (
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
              label="Rejected"
              color="error"
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

          {/* Rejection Reason */}
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Reason:{" "}
            {request.approvalRemarks ||
              "Rejected by HOD"}
          </Typography>

          {/* Action Date */}
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