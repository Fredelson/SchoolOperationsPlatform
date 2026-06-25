// ============================================
// ARAB UNITY SCHOOL
// Teacher Dashboard
// Modern Recent Requests Component
// Connected to live backend dashboard data
// ============================================

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useNavigate } from "react-router-dom";
import StatusChip from "../common/StatusChip";

// ============================================
// Format Submitted Date
// ============================================

const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ============================================
// Recent Requests Component
// ============================================

export default function RecentRequestsTable({ requests = [] }) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        borderRadius: 5,
        border: "1px solid #E2E8F0",
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        background: "linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={900}>
              My Recent Requests
            </Typography>

            <Typography color="text.secondary" fontSize={14}>
              Latest 5 photocopy requests submitted.
            </Typography>
          </Box>

          <Button
            size="small"
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/teacher/my-requests")}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 800,
              borderColor: "#A7F3D0",
              color: "#0B8F4D",
            }}
          >
            View All
          </Button>
        </Box>

        {/* Empty State */}
        {requests.length === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
              borderRadius: 4,
              bgcolor: "#F8FAFC",
              border: "1px dashed #CBD5E1",
            }}
          >
            <DescriptionIcon sx={{ fontSize: 42, color: "#94A3B8", mb: 1 }} />

            <Typography fontWeight={800}>
              No recent requests found.
            </Typography>

            <Typography color="text.secondary" fontSize={14}>
              New requests will appear here after submission.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gap: 1.5 }}>
            {requests.map((request) => (
              <Box
                key={request.RequestId}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1.4fr 1fr 0.8fr 0.8fr auto",
                  },
                  gap: 2,
                  alignItems: "center",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
                  },
                }}
              >
                {/* Request Info */}
                <Box>
                  <Typography fontWeight={900}>
                    {request.RequestNumber || "-"}
                  </Typography>

                  <Typography color="text.secondary" fontSize={13}>
                    Submitted {formatDate(request.SubmittedAt)}
                  </Typography>
                </Box>

                {/* Purpose */}
                <Box>
                  <Typography color="text.secondary" fontSize={12}>
                    Purpose
                  </Typography>

                  <Typography fontWeight={800}>
                    {request.PurposeName || "-"}
                  </Typography>
                </Box>

                {/* Sheets */}
                <Box>
                  <Typography color="text.secondary" fontSize={12}>
                    Sheets
                  </Typography>

                  <Chip
                    label={request.TotalSheets || 0}
                    size="small"
                    sx={{
                      fontWeight: 900,
                      bgcolor: "#EAF7EE",
                      color: "#0B8F4D",
                    }}
                  />
                </Box>

                {/* Status */}
                <Box>
                  <Typography color="text.secondary" fontSize={12}>
                    Status
                  </Typography>

                  <StatusChip status={request.Status} />
                </Box>

                {/* View Action */}
                <IconButton
                  onClick={() =>
                    navigate(`/teacher/request-details/${request.RequestId}`)
                  }
                  sx={{
                    border: "1px solid #E2E8F0",
                    borderRadius: 3,
                    color: "#2563EB",
                  }}
                >
                  <VisibilityIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* Footer */}
        <Typography
          color="text.secondary"
          fontSize={13}
          sx={{ mt: 2 }}
        >
          Showing {requests.length} recent requests
        </Typography>
      </CardContent>
    </Card>
  );
}