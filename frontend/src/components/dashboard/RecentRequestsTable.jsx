// ============================================
// ARAB UNITY SCHOOL
// Teacher Dashboard
// Recent Requests Table Component
// Uses reusable StatusChip
// ============================================

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";

import StatusChip from "../common/StatusChip";

// Centralized mock data
import { recentRequestsData } from "../../data/dashboardData";

// ============================================
// Recent Requests Table Component
// ============================================

export default function RecentRequestsTable() {
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        height: "100%",
        minWidth: 0,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            My Recent Requests
          </Typography>

          <Button
            size="small"
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            View All
          </Button>
        </Box>

        {/* Responsive Table Wrapper */}
        <TableContainer
          sx={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell>Request ID</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Sheets</TableCell>
                <TableCell>Pages</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted On</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {recentRequestsData.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {request.id}
                  </TableCell>

                  <TableCell>{request.purpose}</TableCell>
                  <TableCell>{request.sheets}</TableCell>
                  <TableCell>{request.pages}</TableCell>

                  <TableCell>
                    <StatusChip status={request.status} />
                  </TableCell>

                  <TableCell>{request.submittedDate}</TableCell>

                  <TableCell align="right">
                    <VisibilityIcon
                      sx={{
                        fontSize: 18,
                        mr: 1,
                        color: "#1E3A8A",
                        cursor: "pointer",
                      }}
                    />

                    <DownloadIcon
                      sx={{
                        fontSize: 18,
                        color: "#1E3A8A",
                        cursor: "pointer",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          Showing {recentRequestsData.length} recent requests
        </Typography>
      </CardContent>
    </Card>
  );
}