// ============================================
// ARAB UNITY SCHOOL
// HOS Pending Requests Table
// Large Requests Awaiting HOS Approval
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

import DashboardCard from "./DashboardCard";

export default function HosPendingRequestsTable({
  requests = [],
  onReview,
}) {
  // ============================================
  // Show only requests currently awaiting HOS
  // ============================================
  const pendingRequests = requests.filter(
    (request) =>
      request.status?.toLowerCase() ===
      "forwarded to hos"
  );

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
            {/* Empty State */}
            {pendingRequests.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                >
                  <Typography
                    color="text.secondary"
                  >
                    No requests awaiting HOS
                    approval.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {/* Pending Requests */}
            {pendingRequests.map((request) => (
              <TableRow key={request.id}>
                {/* Request Number */}
                <TableCell>
                  {request.requestNumber}
                </TableCell>

                {/* Teacher */}
                <TableCell>
                  {request.teacher}
                </TableCell>

                {/* Department */}
                <TableCell>
                  {request.department}
                </TableCell>

                {/* Subject */}
                <TableCell>
                  {request.subject}
                </TableCell>

                {/* Total Sheets */}
                <TableCell>
                  {request.sheets}
                </TableCell>

                {/* Priority */}
                <TableCell>
                  <Chip
                    label={
                      request.priority ||
                      "Normal"
                    }
                    size="small"
                    color={
                      request.priority ===
                      "High"
                        ? "error"
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

                {/* Review Button */}
                <TableCell align="right">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                      onReview(request)
                    }
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