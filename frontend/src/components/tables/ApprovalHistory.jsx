// ============================================
// ARAB UNITY SCHOOL
// Approval History Component
// Real Approval History Version
// Data comes from RequestApprovals table
// ============================================

// MUI Components
import { Box, Chip, Typography } from "@mui/material";

// Reusable Dashboard Card
import DashboardCard from "../common/DashboardCard";

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
        // Check if action is approved
        const isApproved =
          item.approvalStatus?.toLowerCase() === "approved";

        // Check if action is rejected
        const isRejected =
          item.approvalStatus?.toLowerCase() === "rejected";

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
                Request: {item.requestNumber}
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
            <Typography variant="body2" color="text.secondary">
              Teacher: {item.teacher}
            </Typography>

            {/* Department */}
            <Typography variant="body2" color="text.secondary">
              Department: {item.department}
            </Typography>

            {/* Subject */}
            <Typography variant="body2" color="text.secondary">
              Subject: {item.subject}
            </Typography>

            {/* Action */}
            <Typography variant="body2" color="text.secondary">
              Action: {item.approvalStatus}
            </Typography>

            {/* Approver Display */}
            <Typography variant="body2" color="text.secondary">
              By: {item.displayApproverRole || item.approvalRole} /{" "}
              {item.approverName || "Unknown"}
            </Typography>

            {/* Remarks */}
            <Typography variant="body2" color="text.secondary">
              Remarks: {item.remarks || "-"}
            </Typography>

            {/* Action Date */}
            <Typography variant="body2" color="text.secondary">
              Date: {item.actionDate}
            </Typography>
          </Box>
        );
      })}
    </DashboardCard>
  );
}