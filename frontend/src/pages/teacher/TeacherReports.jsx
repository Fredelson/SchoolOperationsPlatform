// ============================================
// ARAB UNITY SCHOOL
// Teacher Reports Page
// Modern Reports UI
//
// Includes:
// - Current Sidebar
// - Current Topbar
// - Report filters
// - KPI cards
// - Monthly usage trend
// - Requests by purpose
// - Status summary
// - Download buttons placeholder
// ============================================

import { useEffect, useMemo, useState } from "react";
import { getTeacherReportsData } from "../../services/teacherReportService";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  LinearProgress,
} from "@mui/material";

import {
  PictureAsPdf,
  TableChart,
  FilterAlt,
  RestartAlt,
  Assignment,
  Description,
  Print,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import DashboardLayout from "../../layouts/DashboardLayout";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/common/Topbar";

// ============================================
// Temporary report data
// Later this will come from backend API
// ============================================

const monthlyTrendData = [
  { month: "Jan", pages: 2800, sheets: 1350 },
  { month: "Feb", pages: 3100, sheets: 1500 },
  { month: "Mar", pages: 2950, sheets: 1450 },
  { month: "Apr", pages: 3000, sheets: 1460 },
  { month: "May", pages: 3450, sheets: 1725 },
];

const purposeData = [
  { name: "Exam Paper", value: 7, color: "#2563EB" },
  { name: "Worksheets", value: 7, color: "#22C55E" },
  { name: "Homework", value: 4, color: "#8B5CF6" },
  { name: "Revision", value: 3, color: "#F59E0B" },
  { name: "Administrative", value: 3, color: "#EF4444" },
];

const statusSummary = [
  {
    status: "Approved",
    requests: 22,
    pages: 3150,
    sheets: 1585,
    color: "#22C55E",
  },
  {
    status: "Completed",
    requests: 22,
    pages: 3150,
    sheets: 1585,
    color: "#2563EB",
  },
  {
    status: "Pending",
    requests: 2,
    pages: 300,
    sheets: 140,
    color: "#F59E0B",
  },
  {
    status: "Rejected",
    requests: 2,
    pages: 150,
    sheets: 85,
    color: "#EF4444",
  },
];

// ============================================
// Main Reports Page
// ============================================

export default function TeacherReports() {
  // ============================================
  // Filter state
  // ============================================
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("This Month");
  const [status, setStatus] = useState("All");
  const [purpose, setPurpose] = useState("All");
  const [reportType, setReportType] = useState("Usage Summary");

  // ============================================
  // Temporary KPI totals
  // Later this should come from backend
  // ============================================

  const totals = useMemo(() => {
    const stats = reportData?.stats || {};

    return {
      totalRequests: stats.TotalRequests || 0,
      totalPages: stats.TotalPages || 0,
      totalSheets: stats.TotalSheets || 0,
      completedRequests: stats.CompletedRequests || 0,
      rejectedRequests: stats.RejectedRequests || 0,
    };
  }, [reportData]);
  
  // ============================================
  // Reset filters
  // ============================================

  const clearFilters = () => {
    setDateRange("This Month");
    setStatus("All");
    setPurpose("All");
    setReportType("Usage Summary");
  };

  // ============================================
  // Download placeholders
  // Later connect to backend export endpoints
  // ============================================

  const handleDownloadPdf = () => {
    alert("PDF download will be connected later.");
  };

  const loadReports = async () => {
    try {
      setLoading(true);

      const data = await getTeacherReportsData();
      setReportData(data);
    } catch (error) {
      console.error("Load teacher reports error:", error);
      alert("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDownloadExcel = () => {
    alert("Excel download will be connected later.");
  };

  return (
    <DashboardLayout
      sidebar={<Sidebar role="teacher" />}
      topbar={(handleMenuClick) => (
        <Topbar onMenuClick={handleMenuClick} />
      )}
    >
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Reports
          </Typography>

          <Typography color="text.secondary">
            Track your photocopy usage and request statistics.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={handleDownloadPdf}
            sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800 }}
          >
            Download PDF
          </Button>

          <Button
            variant="contained"
            startIcon={<TableChart />}
            onClick={handleDownloadExcel}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 800,
              bgcolor: "#16A34A",
              "&:hover": { bgcolor: "#15803D" },
            }}
          >
            Download Excel
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <ModernCard>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(4, 1fr) auto",
            },
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            select
            label="Date Range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            size="small"
          >
            <MenuItem value="This Month">This Month</MenuItem>
            <MenuItem value="Last Month">Last Month</MenuItem>
            <MenuItem value="This Year">This Year</MenuItem>
            <MenuItem value="Custom Range">Custom Range</MenuItem>
          </TextField>

          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            size="small"
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </TextField>

          <TextField
            select
            label="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            size="small"
          >
            <MenuItem value="All">All Purposes</MenuItem>
            <MenuItem value="Classwork">Classwork</MenuItem>
            <MenuItem value="Worksheet">Worksheet</MenuItem>
            <MenuItem value="Homework">Homework</MenuItem>
            <MenuItem value="Revision">Revision</MenuItem>
            <MenuItem value="Exam Paper">Exam Paper</MenuItem>
            <MenuItem value="Administrative">Administrative</MenuItem>
          </TextField>

          <TextField
            select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            size="small"
          >
            <MenuItem value="Usage Summary">Usage Summary</MenuItem>
            <MenuItem value="Purpose Analysis">Purpose Analysis</MenuItem>
            <MenuItem value="Monthly Trend">Monthly Trend</MenuItem>
            <MenuItem value="Status Analysis">Status Analysis</MenuItem>
          </TextField>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<FilterAlt />}
              sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800 }}
            >
              Apply
            </Button>

            <Button
              variant="outlined"
              startIcon={<RestartAlt />}
              onClick={clearFilters}
              sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800 }}
            >
              Clear
            </Button>
          </Box>
        </Box>
      </ModernCard>

      {/* KPI Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(5, 1fr)",
          },
          gap: 3,
          mt: 3,
        }}
      >
        <ReportKpiCard title="Total Requests" value={totals.totalRequests} icon={<Assignment />} color="#2563EB" />
        <ReportKpiCard title="Total Pages" value={totals.totalPages} icon={<Description />} color="#22C55E" />
        <ReportKpiCard title="Total Sheets" value={totals.totalSheets} icon={<Print />} color="#8B5CF6" />
        <ReportKpiCard title="Completed" value={totals.completedRequests} icon={<CheckCircle />} color="#F59E0B" />
        <ReportKpiCard title="Rejected" value={totals.rejectedRequests} icon={<Cancel />} color="#EF4444" />
      </Box>

      {/* Charts */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 3,
          mt: 3,
        }}
      >
        <MonthlyUsageTrend />
        <RequestsByPurpose />
      </Box>

      {/* Summary */}
      <Box sx={{ mt: 3 }}>
        <RequestSummaryTable />
      </Box>
    </DashboardLayout>
  );
}

// ============================================
// Reusable Modern Card
// ============================================

function ModernCard({ children }) {
  return (
    <Card
      sx={{
        borderRadius: 5,
        border: "1px solid #E2E8F0",
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        background: "linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)",
      }}
    >
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  );
}

// ============================================
// KPI Card
// ============================================

function ReportKpiCard({ title, value, icon, color }) {
  return (
    <Card sx={{ borderRadius: 5, border: "1px solid #E2E8F0", boxShadow: "0 10px 30px rgba(15,23,42,0.06)" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: 4,
              bgcolor: `${color}20`,
              color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "& svg": { fontSize: 30 },
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography color="text.secondary" fontWeight={700}>
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={900}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================
// Monthly Usage Trend Chart
// ============================================

function MonthlyUsageTrend() {
  return (
    <ModernCard>
      <Typography variant="h6" fontWeight={900} mb={2}>
        Monthly Usage Trend
      </Typography>

      <Box sx={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyTrendData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="pages" name="Pages" stroke="#2563EB" strokeWidth={3} />
            <Line type="monotone" dataKey="sheets" name="Sheets" stroke="#22C55E" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </ModernCard>
  );
}

// ============================================
// Requests By Purpose Donut Chart
// ============================================

function RequestsByPurpose() {
  const total = purposeData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ModernCard>
      <Typography variant="h6" fontWeight={900} mb={2}>
        Requests by Purpose
      </Typography>

      <Box sx={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={purposeData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={3}>
              {purposeData.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ display: "grid", gap: 1 }}>
        {purposeData.map((item) => (
          <Box key={item.name} sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>{item.name}</Typography>
            <Typography fontWeight={800}>
              {Math.round((item.value / total) * 100)}% ({item.value})
            </Typography>
          </Box>
        ))}
      </Box>
    </ModernCard>
  );
}

// ============================================
// Request Summary Table
// ============================================

function RequestSummaryTable() {
  const totalRequests = statusSummary.reduce((sum, item) => sum + item.requests, 0);

  return (
    <ModernCard>
      <Typography variant="h6" fontWeight={900} mb={2}>
        Request Summary by Status
      </Typography>

      <Box sx={{ display: "grid", gap: 1.5 }}>
        {statusSummary.map((row) => {
          const percentage = totalRequests > 0 ? Math.round((row.requests / totalRequests) * 100) : 0;

          return (
            <Box
              key={row.status}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr 2fr" },
                gap: 2,
                alignItems: "center",
                p: 2,
                borderRadius: 3,
                bgcolor: "#FFFFFF",
                border: "1px solid #E2E8F0",
              }}
            >
              <Chip label={row.status} sx={{ bgcolor: `${row.color}20`, color: row.color, fontWeight: 800, width: "fit-content" }} />
              <Typography>{row.requests} Requests</Typography>
              <Typography>{row.pages} Pages</Typography>
              <Typography>{row.sheets} Sheets</Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    flex: 1,
                    height: 9,
                    borderRadius: 10,
                    bgcolor: "#E5E7EB",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: row.color,
                      borderRadius: 10,
                    },
                  }}
                />

                <Typography fontWeight={800}>{percentage}%</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Typography color="text.secondary" fontSize={13} mt={2}>
        Percentages are calculated based on total requests.
      </Typography>
    </ModernCard>
  );
}