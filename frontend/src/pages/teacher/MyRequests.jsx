// ============================================
// ARAB UNITY SCHOOL
// Teacher - My Requests Page
// Connected to Backend API
// ============================================

import { useEffect, useMemo, useState } from "react";
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
  Alert,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "../../layouts/DashboardLayout";
import Sidebar from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";
import DashboardCard from "../../components/common/DashboardCard";
import DataTableCard from "../../components/common/DataTableCard";
import StatusChip from "../../components/common/StatusChip";

import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:5000/api";

export default function MyRequests() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [purposeFilter, setPurposeFilter] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch logged-in teacher requests
// ============================================
// Fetch logged-in teacher requests
// ============================================

useEffect(() => {
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("TOKEN:", token);

      const response = await axios.get(
        `${API_URL}/requests/my-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API RESPONSE:", response.data);

      setRequests(response.data);
    } catch (err) {
      console.error("Fetch My Requests Error:", err);
      setError("Unable to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    fetchRequests();
  }
}, [token]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const requestNumber = request.RequestNumber || "";
      const purpose = request.PurposeName || "";
      const status = request.Status || "";

      const matchesSearch =
        requestNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        purpose.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      const matchesPurpose =
        purposeFilter === "All" || purpose === purposeFilter;

      return matchesSearch && matchesStatus && matchesPurpose;
    });
  }, [requests, searchText, statusFilter, purposeFilter]);

  return (
    <DashboardLayout
      sidebar={<Sidebar role="teacher" />}
      topbar={
        <Topbar
          userName={user?.fullName || "Teacher"}
          role={user?.role || "Teacher"}
        />
      }
    >
      <PageHeader
        title="My Requests"
        subtitle="View, monitor, and manage your photocopy requests."
      />

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
          <TextField
            size="small"
            placeholder="Search request ID or purpose..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
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

          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
            <MenuItem value="Printing">Printing</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Purpose"
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Classwork">Classwork</MenuItem>
            <MenuItem value="Worksheet">Worksheet</MenuItem>
            <MenuItem value="Homework">Homework</MenuItem>
            <MenuItem value="Friday Exam">Friday Exam</MenuItem>
            <MenuItem value="Revision Material">
              Revision Material
            </MenuItem>
          </TextField>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/teacher/create-request")}
            sx={{ textTransform: "none" }}
          >
            Create Request
          </Button>
        </Box>
      </DashboardCard>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      <DataTableCard
        title="Request List"
        subtitle={
          loading
            ? "Loading requests..."
            : `Showing ${filteredRequests.length} requests`
        }
        sx={{ mt: 3 }}
      >
        {loading ? (
          <Typography sx={{ p: 2 }}>Loading...</Typography>
        ) : filteredRequests.length === 0 ? (
          <Typography sx={{ p: 2 }}>
            No requests found.
          </Typography>
        ) : (
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
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.RequestId} hover>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {request.RequestNumber}
                    </TableCell>

                    <TableCell>{request.PurposeName}</TableCell>

                    <TableCell>{request.TotalPages}</TableCell>

                    <TableCell>{request.TotalSheets}</TableCell>

                    <TableCell>
                      <StatusChip status={request.Status} />
                    </TableCell>

                    <TableCell>
                      {request.SubmittedAt
                        ? new Date(request.SubmittedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        onClick={() =>
                          navigate(
                            `/teacher/request-details/${request.RequestId}`
                          )
                        }
                      >
                        <VisibilityIcon sx={{ color: "#2563EB" }} />
                      </IconButton>

                      <IconButton disabled>
                        <DownloadIcon sx={{ color: "#94A3B8" }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTableCard>
    </DashboardLayout>
  );
}