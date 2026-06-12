// ============================================
// ARAB UNITY SCHOOL
// Approval History Component
// Real Approval History Version
// Data comes from RequestApprovals table
// ============================================

// MUI Components
import { Box, Chip, Typography } from "@mui/material";

// Reusable Dashboard Card
import DashboardCard from "./DashboardCard";

// ============================================
// Component
// Receives history from HodDashboard.jsx
// ============================================
export default function ApprovalHistory({
  history = [],
}) {
  return (
    <DashboardCard title="Approval History">
      {/* Empty State */}
      {history.length === 0 && (
        <Typography color="text.secondary">
          No approval history available.
        </Typography>
      )}

      {/* Approval History List */}
      {history.map((item) => {
        // Check approval status
        const isApproved =
          item.approvalStatus?.toLowerCase() ===
          "approved";

        const isRejected =
          item.approvalStatus?.toLowerCase() ===
          "rejected";

        return (
          <Box
            key={item.approvalId}
            sx={{
              p: 2,
              mb: 2,
              border: "1px solid #e5e7eb",
              borderRadius: 3,
            }}
          >
            {/* Request Number + Status */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography fontWeight={700}>
                {item.requestNumber}
              </Typography>

              <Chip
                label={item.approvalStatus}
                size="small"
                color={
                  isApproved
                    ? "success"
                    : isRejected
                    ? "error"
                    : "primary"
                }
              />
            </Box>

            {/* Teacher */}
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Teacher: {item.teacher}
            </Typography>

            {/* Department */}
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Department: {item.department}
            </Typography>

            {/* Subject */}
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Subject: {item.subject}
            </Typography>

            {/* Approval Role */}
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Role: {item.approvalRole}
            </Typography>

            {/* Remarks */}
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Remarks: {item.remarks || "-"}
            </Typography>

            {/* Action Date */}
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Action Date: {item.actionDate}
            </Typography>
          </Box>
        );
      })}
    </DashboardCard>
  );
}