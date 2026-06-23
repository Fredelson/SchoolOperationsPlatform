// ============================================
// ARAB UNITY SCHOOL
// Teacher Attachments Page - Modern UI
// Upload button removed
// ============================================

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Chip,
  InputAdornment,
  IconButton,
  Pagination,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import TagIcon from "@mui/icons-material/Tag";
import ArticleIcon from "@mui/icons-material/Article";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import DashboardLayout from "../../layouts/DashboardLayout";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/common/Topbar";

import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FILE_BASE_URL = import.meta.env.VITE_FILE_URL || "http://localhost:5000";

const getExtension = (fileName = "") => {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
};

const getFileMeta = (fileName = "") => {
  const ext = getExtension(fileName);

  if (ext === "pdf") {
    return {
      label: "PDF",
      color: "#EF4444",
      bg: "#FEE2E2",
      icon: <PictureAsPdfIcon />,
    };
  }

  if (["ppt", "pptx"].includes(ext)) {
    return {
      label: "PPTX",
      color: "#F97316",
      bg: "#FFEDD5",
      icon: <SlideshowIcon />,
    };
  }

  if (["jpg", "jpeg", "png"].includes(ext)) {
    return {
      label: ext.toUpperCase(),
      color: "#2563EB",
      bg: "#DBEAFE",
      icon: <ImageIcon />,
    };
  }

  if (["doc", "docx"].includes(ext)) {
    return {
      label: "DOCX",
      color: "#2563EB",
      bg: "#DBEAFE",
      icon: <DescriptionIcon />,
    };
  }

  return {
    label: ext ? ext.toUpperCase() : "FILE",
    color: "#64748B",
    bg: "#E2E8F0",
    icon: <InsertDriveFileIcon />,
  };
};

export default function Attachments() {
  const { token, user } = useAuth();

  const [attachments, setAttachments] = useState([]);
  const [search, setSearch] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Recent");
  const [page, setPage] = useState(1);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAttachments = async () => {
    try {
      const response = await axios.get(`${API_URL}/requests/attachments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAttachments(response.data || []);
    } catch (error) {
      console.error("Attachments Load Error:", error);
    }
  };

  const purposes = useMemo(() => {
    return [...new Set(attachments.map((item) => item.PurposeName).filter(Boolean))];
  }, [attachments]);

  const fileTypes = useMemo(() => {
    return [
      ...new Set(
        attachments
          .map((item) => getFileMeta(item.OriginalFileName).label)
          .filter(Boolean)
      ),
    ];
  }, [attachments]);

  const filteredAttachments = useMemo(() => {
    let data = [...attachments];

    if (search.trim()) {
      const keyword = search.toLowerCase();

      data = data.filter(
        (item) =>
          item.OriginalFileName?.toLowerCase().includes(keyword) ||
          item.RequestNumber?.toLowerCase().includes(keyword) ||
          item.PurposeName?.toLowerCase().includes(keyword)
      );
    }

    if (purposeFilter !== "All") {
      data = data.filter((item) => item.PurposeName === purposeFilter);
    }

    if (typeFilter !== "All") {
      data = data.filter(
        (item) => getFileMeta(item.OriginalFileName).label === typeFilter
      );
    }

    if (sortBy === "Name") {
      data.sort((a, b) =>
        String(a.OriginalFileName || "").localeCompare(
          String(b.OriginalFileName || "")
        )
      );
    } else {
      data.sort((a, b) => Number(b.AttachmentId) - Number(a.AttachmentId));
    }

    return data;
  }, [attachments, search, purposeFilter, typeFilter, sortBy]);

  const totalPages = Math.ceil(filteredAttachments.length / itemsPerPage) || 1;

  const paginatedAttachments = filteredAttachments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const clearFilters = () => {
    setSearch("");
    setPurposeFilter("All");
    setTypeFilter("All");
    setSortBy("Recent");
    setPage(1);
  };

  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      topbar={
        <Topbar
          userName={user?.fullName || user?.FullName || "User"}
          role={user?.role || user?.Role || "Teacher"}
        />
      }
    >
      <Box sx={{ pb: 4 }}>
        {/* Page Header */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 4,
              bgcolor: "#EEF4FF",
              color: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 28px rgba(37, 99, 235, 0.12)",
            }}
          >
            <AttachFileIcon sx={{ fontSize: 34 }} />
          </Box>

          <Box>
            <Typography
              variant="h4"
              fontWeight={900}
              color="#0B1B46"
              sx={{ letterSpacing: "-0.5px" }}
            >
              Attachments
            </Typography>

            <Typography color="#64748B" fontSize={15}>
              View and manage all uploaded files.
            </Typography>
          </Box>
        </Box>

        {/* Main Card */}
        <Card
          sx={{
            borderRadius: 5,
            border: "1px solid #E5EAF2",
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            {/* Filters */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1.7fr 0.9fr 0.9fr 0.7fr",
                },
                gap: 2,
                mb: 3,
              }}
            >
              <TextField
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search attachments by name or request ID..."
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#64748B" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                value={purposeFilter}
                onChange={(e) => {
                  setPurposeFilter(e.target.value);
                  setPage(1);
                }}
                fullWidth
              >
                <MenuItem value="All">All Purposes</MenuItem>
                {purposes.map((purpose) => (
                  <MenuItem key={purpose} value={purpose}>
                    {purpose}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                fullWidth
              >
                <MenuItem value="All">All File Types</MenuItem>
                {fileTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={clearFilters}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 800,
                  color: "#2563EB",
                  borderColor: "#D6E2FF",
                }}
              >
                Clear Filters
              </Button>
            </Box>

            {/* Count and Sort */}
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography fontWeight={800} color="#334155">
                Total Attachments:{" "}
                <Box component="span" color="#2563EB">
                  {filteredAttachments.length}
                </Box>
              </Typography>

              <TextField
                select
                size="small"
                label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="Recent">Recent</MenuItem>
                <MenuItem value="Name">Name</MenuItem>
              </TextField>
            </Box>

            {/* Attachment List */}
            {paginatedAttachments.length === 0 ? (
              <Box
                sx={{
                  py: 8,
                  textAlign: "center",
                  borderRadius: 4,
                  bgcolor: "#F8FAFC",
                  border: "1px dashed #CBD5E1",
                }}
              >
                <AttachFileIcon sx={{ fontSize: 52, color: "#94A3B8", mb: 1 }} />
                <Typography fontWeight={900} color="#0F172A">
                  No attachments found
                </Typography>
                <Typography color="#64748B">
                  Try changing your search or filters.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "grid", gap: 2 }}>
                {paginatedAttachments.map((file) => (
                  <AttachmentCard key={file.AttachmentId} file={file} />
                ))}
              </Box>
            )}

            {/* Footer Pagination */}
            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography color="#64748B">
                Showing{" "}
                {filteredAttachments.length === 0
                  ? 0
                  : (page - 1) * itemsPerPage + 1}{" "}
                to {Math.min(page * itemsPerPage, filteredAttachments.length)} of{" "}
                {filteredAttachments.length} attachments
              </Typography>

              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

function AttachmentCard({ file }) {
  const meta = getFileMeta(file.OriginalFileName);

  return (
    <Box
      sx={{
        p: 2.3,
        borderRadius: 4,
        border: "1px solid #E5EAF2",
        borderLeft: `5px solid ${meta.color}`,
        bgcolor: "#FFFFFF",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "110px 1fr auto",
        },
        gap: 2.5,
        alignItems: "center",
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 16px 36px rgba(15, 23, 42, 0.10)",
        },
      }}
    >
      {/* File Icon */}
      <Box
        sx={{
          width: 86,
          height: 86,
          borderRadius: 4,
          bgcolor: meta.bg,
          color: meta.color,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
        }}
      >
        {meta.icon}

        <Chip
          label={meta.label}
          size="small"
          sx={{
            height: 22,
            bgcolor: meta.color,
            color: "#FFFFFF",
            fontWeight: 900,
            fontSize: 11,
          }}
        />
      </Box>

      {/* File Details */}
      <Box>
        <Typography
          fontWeight={900}
          color="#0B1B46"
          fontSize={19}
          sx={{ mb: 1 }}
        >
          {file.OriginalFileName}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1.2,
            flexWrap: "wrap",
            mb: 1.2,
          }}
        >
          <Chip
            icon={<ArticleIcon />}
            label={file.RequestNumber || "No Request"}
            sx={{
              bgcolor: "#EEF4FF",
              color: "#2563EB",
              fontWeight: 800,
            }}
          />

          <Chip
            icon={<TagIcon />}
            label={file.PurposeName || "No Purpose"}
            sx={{
              bgcolor: "#F3E8FF",
              color: "#7C3AED",
              fontWeight: 800,
            }}
          />

          <Chip
            icon={<DescriptionIcon />}
            label={`${file.PageCount || 0} Pages`}
            sx={{
              bgcolor: "#DCFCE7",
              color: "#15803D",
              fontWeight: 800,
            }}
          />
        </Box>

        <Typography color="#64748B" fontSize={14}>
          {file.TeacherName} • {file.DepartmentName}
        </Typography>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          mt: 1,
        }}
      >
        <Chip
          size="small"
          label={file.SubjectName}
          sx={{
            bgcolor: "#EFF6FF",
            color: "#2563EB",
            fontWeight: 700,
          }}
        />

        <Chip
          size="small"
          label={file.DepartmentName}
          sx={{
            bgcolor: "#F0FDF4",
            color: "#15803D",
            fontWeight: 700,
          }}
        />

        <Chip
          size="small"
          label={file.Status}
          sx={{
            bgcolor: "#FEF3C7",
            color: "#B45309",
            fontWeight: 700,
          }}
        />
      </Box>
    </Box>
  );
}