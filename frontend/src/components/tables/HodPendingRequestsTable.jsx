// ============================================
// ARAB UNITY SCHOOL
// HOD Pending Requests Table
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
} from "@mui/material";

import DashboardCard from "../common/DashboardCard";

export default function HodPendingRequestsTable({ requests = [], onReview }) {
  return (
    <DashboardCard title="Pending Requests Table">
      <Box sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Request ID</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Sheets</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.requestNumber}</TableCell>
                <TableCell>{request.teacher}</TableCell>
                <TableCell>{request.department}</TableCell>
                <TableCell>{request.purpose}</TableCell>
                <TableCell>{request.sheets}</TableCell>
                <TableCell>
                  <Chip label={request.status} size="small" color="warning" />
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onReview(request)}
                  >
                    Review
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