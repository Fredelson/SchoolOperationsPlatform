// ============================================
// ARAB UNITY SCHOOL
// Teacher - My Requests Page
// Uses reusable DashboardLayout, Sidebar,
// Topbar, PageHeader, DashboardCard,
// DataTableCard, and StatusChip
// ============================================

import {
  Box,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  IconButton,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import Sidebar from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";
import DashboardCard from "../../components/common/DashboardCard";
import DataTableCard from "../../components/common/DataTableCard";
import StatusChip from "../../components/common/StatusChip";

import { recentRequestsData } from "../../data/dashboardData";

// ============================================
// My Requests Page
// ============================================

export default function MyRequests() {
  const navigate = useNavigate();

  return (
    <DashboardLayout
      sidebar={<Sidebar role="teacher" />}
      topbar={<Topbar userName="Ahmed Khan" role="Teacher" />}
    >
      {/* Page Header */}
      <PageHeader
        title="My Requests"
        subtitle="View, monitor, and manage your photocopy requests."
      />

      {/* Filters Section */}
      <DashboardCard title="Filters">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "2fr 1fr 1fr auto",
            },
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search request ID or purpose..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Status Filter */}
          <TextField
            select
            size="small"
            label="Status"
            defaultValue="All"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending HOD">Pending HOD</MenuItem>
            <MenuItem value="Pending HOS">Pending HOS</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Printing">Printing</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </TextField>

          {/* Purpose Filter */}
          <TextField
            select
            size="small"
            label="Purpose"
            defaultValue="All"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Worksheet">Worksheet</MenuItem>
            <MenuItem value="Homework">Homework</MenuItem>
            <MenuItem value="Friday Exam">Friday Exam</MenuItem>
            <MenuItem value="Revision Material">
              Revision Material
            </MenuItem>
          </TextField>

          {/* Create Request */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() =>
              navigate("/teacher/create-request")
            }
            sx={{
              textTransform: "none",
            }}
          >
            Create Request
          </Button>
        </Box>
      </DashboardCard>

      {/* Table Section */}
      <DataTableCard
        title="Request List"
        subtitle={`Showing ${recentRequestsData.length} requests`}
        sx={{ mt: 3 }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request ID</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Pages</TableCell>
                <TableCell>Sheets</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted Date</TableCell>
                <TableCell align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {recentRequestsData.map((request) => (
                <TableRow
                  key={request.id}
                  hover
                >
                  <TableCell
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {request.id}
                  </TableCell>

                  <TableCell>
                    {request.purpose}
                  </TableCell>

                  <TableCell>
                    {request.pages}
                  </TableCell>

                  <TableCell>
                    {request.sheets}
                  </TableCell>

                  <TableCell>
                    <StatusChip
                      status={request.status}
                    />
                  </TableCell>

                  <TableCell>
                    {request.submittedDate}
                  </TableCell>

                  <TableCell align="right">
                    {/* View Details */}
                    <IconButton
                      onClick={() =>
                        navigate(
                          `/teacher/request-details/${request.id}`
                        )
                      }
                    >
                      <VisibilityIcon
                        sx={{
                          color: "#2563EB",
                        }}
                      />
                    </IconButton>

                    {/* Download */}
                    <IconButton>
                      <DownloadIcon
                        sx={{
                          color: "#10B981",
                        }}
                      />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DataTableCard>
    </DashboardLayout>
  );
}