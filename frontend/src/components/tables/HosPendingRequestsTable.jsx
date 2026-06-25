// ============================================
// ARAB UNITY SCHOOL
// HOS Pending Requests Table
// Shows Large Requests Awaiting HOS Approval
// Supports both backend status names:
// 1. Forwarded to HOS
// 2. Pending HOS Approval
// ============================================

import {
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import DashboardCard from "../common/DashboardCard";

export default function HosPendingRequestsTable({
  requests = [],
  onReview,
}) {
  // ============================================
  // Filter only requests waiting for HOS action
  // IMPORTANT:
  // Your teacher page shows "Pending HOS Approval"
  // but backend sometimes uses "Forwarded to HOS"
  // so we allow both.
  // ============================================
  const pendingRequests = requests.filter((request) => {
    const status = request.status?.toLowerCase().trim();

    return (
      status === "forwarded to hos" ||
      status === "pending hos approval"
    );
  });

  return (
    <DashboardCard title="Large Requests Awaiting HOS Approval">
      <Box sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Request ID</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Sheets</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Empty state */}
            {pendingRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">
                    No requests awaiting HOS approval.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {/* Pending HOS request rows */}
            {pendingRequests.map((request) => (
              <TableRow key={request.id}>
                {/* Request number */}
                <TableCell>
                  {request.requestNumber}
                </TableCell>

                {/* Teacher name */}
                <TableCell>
                  {request.teacher}
                </TableCell>

                {/* Department */}
                <TableCell>
                  {request.department}
                </TableCell>

                {/* Subject */}
                <TableCell>
                  {request.subject || "-"}
                </TableCell>

                {/* Total sheets */}
                <TableCell>
                  {request.sheets}
                </TableCell>

                {/* Priority */}
                <TableCell>
                  <Chip
                    label={request.priority || "Normal"}
                    size="small"
                    color={
                      request.priority === "Urgent"
                        ? "error"
                        : request.priority === "High"
                        ? "warning"
                        : "default"
                    }
                  />
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Chip
                    label={request.status}
                    size="small"
                    color="warning"
                  />
                </TableCell>

                {/* Review action */}
                <TableCell align="right">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onReview(request)}
                  >
                    Final Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </DashboardCard>
  );
}