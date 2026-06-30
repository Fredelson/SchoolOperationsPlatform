// ============================================
// ARAB UNITY SCHOOL
// Teacher Reports Page
// Microsoft Fabric / Power BI Modern Style
//
// Connected to:
// - GET /api/teacher/reports
// - GET /api/master/purposes
//
// Features:
// - No hardcoded purposes
// - No hardcoded statuses
// - No hardcoded months
// - No hardcoded paper sizes
// - PDF export of full report content
// - Excel export of filtered report data
// ============================================

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import {
  AssignmentOutlined,
  CalendarMonthOutlined,
  CancelOutlined,
  CheckCircleOutlineOutlined,
  DescriptionOutlined,
  FactCheckOutlined,
  FilterAltOutlined,
  InsertDriveFileOutlined,
  PictureAsPdfOutlined,
  PrintOutlined,
  RestartAltOutlined,
  SearchOutlined,
  TableChartOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

import DashboardLayout from "../../../components/layout/DashboardLayout";
import Sidebar from "../../../components/sidebar/Sidebar";
import Topbar from "../../../components/common/Topbar";
import usePageTitle from "@platform/hooks/usePageTitle";

import { getTeacherReportsData } from "../../../services/teacherReportService";
import { getMasterData } from "../../../services/masterService";

// ============================================
// Theme colors
// ============================================

const COLORS = {
  navy: "#071B4D",
  blue: "#2563EB",
  green: "#00A651",
  purple: "#7C3AED",
  red: "#EF4444",
  orange: "#F97316",
  teal: "#14B8A6",
  bg: "#F6F8FC",
  border: "#E2E8F0",
};

const CHART_COLORS = [
  COLORS.green,
  COLORS.blue,
  "#FBBF24",
  COLORS.purple,
  "#94A3B8",
  COLORS.red,
];

// ============================================
// Main Component
// ============================================

export default function TeacherReports() {
  usePageTitle("AUS | Teacher Reports");

  // This ref is used for PDF export.
  // Sidebar and topbar are excluded because only this report area is captured.
  const reportRef = useRef(null);

  // Backend report data
  const [reportData, setReportData] = useState(null);

  // Master Data purposes
  const [purposes, setPurposes] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [purposeLoading, setPurposeLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters sent to backend
  const [month, setMonth] = useState("All");
  const [purposeId, setPurposeId] = useState("All");
  const [status, setStatus] = useState("All");
  const [paperSize, setPaperSize] = useState("All");

  // Table search
  const [search, setSearch] = useState("");

  // ============================================
  // Load purposes from Master Data
  // ============================================

  const loadPurposes = async () => {
    try {
      setPurposeLoading(true);

      const data = await getMasterData("purposes");

      setPurposes((data || []).filter((item) => Boolean(item.IsActive)));
    } catch (err) {
      console.error("Load purposes error:", err);
    } finally {
      setPurposeLoading(false);
    }
  };

  // ============================================
  // Load teacher report data from backend
  // ============================================

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTeacherReportsData({
        month,
        purposeId,
        status,
        paperSize,
      });

      setReportData(data);
    } catch (err) {
      console.error("Load teacher reports error:", err);
      setError(err.response?.data?.message || "Failed to load teacher reports.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Initial load
  // ============================================

  useEffect(() => {
    loadPurposes();
    loadReports();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // Backend values
  // ============================================

  const stats = reportData?.stats || {};
  const filters = reportData?.filters || {};
  const monthlyTrend = reportData?.monthlyTrend || [];
  const statusSummary = reportData?.statusSummary || [];
  const activityTimeline = reportData?.activityTimeline || [];
  const purposeBreakdown = reportData?.purposeBreakdown || [];
  const paperUsage = reportData?.paperUsage || [];
  const insights = reportData?.insights || {};
  const requests = reportData?.requests || [];

  // ============================================
  // KPI totals
  // ============================================

  const totals = useMemo(() => {
    return {
      totalRequests: Number(stats.TotalRequests || 0),
      totalSheets: Number(stats.TotalSheets || 0),
      totalPages: Number(stats.TotalPages || 0),
      approved: Number(stats.ApprovedRequests || 0),
      rejected: Number(stats.RejectedRequests || 0),
      completed: Number(stats.CompletedRequests || 0),
      pending: Number(stats.PendingRequests || 0),
      a4Sheets: Number(stats.A4Sheets || 0),
      a3Sheets: Number(stats.A3Sheets || 0),
    };
  }, [stats]);

  // ============================================
  // Search filtered table
  // ============================================

  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests;

    const keyword = search.toLowerCase();

    return requests.filter((row) => {
      return (
        row.RequestNumber?.toLowerCase().includes(keyword) ||
        row.PurposeName?.toLowerCase().includes(keyword) ||
        row.Status?.toLowerCase().includes(keyword) ||
        row.PaperSize?.toLowerCase().includes(keyword)
      );
    });
  }, [requests, search]);

  // ============================================
  // Derived insight data
  // ============================================

  const mostUsedPurpose = purposeBreakdown[0];

  const a4Usage = paperUsage.find((item) => item.paperSize === "A4") || {
    sheets: totals.a4Sheets,
    percentage: 0,
  };

  const a3Usage = paperUsage.find((item) => item.paperSize === "A3") || {
    sheets: totals.a3Sheets,
    percentage: 0,
  };

  // ============================================
  // Reset filters
  // ============================================

  const resetFilters = async () => {
    setMonth("All");
    setPurposeId("All");
    setStatus("All");
    setPaperSize("All");
    setSearch("");

    try {
      setLoading(true);
      setError("");

      const data = await getTeacherReportsData({
        month: "All",
        purposeId: "All",
        status: "All",
        paperSize: "All",
      });

      setReportData(data);
    } catch (err) {
      console.error("Reset filters error:", err);
      setError("Failed to reset filters.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Export full report UI to PDF
  // ============================================

  const handleExportPdf = async () => {
    try {
      const element = reportRef.current;

      if (!element) {
        alert("Report content not found.");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: COLORS.bg,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("Teacher_Report.pdf");
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to export PDF.");
    }
  };

  // ============================================
  // Export filtered report data to Excel
  // ============================================

  const handleExportExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      const selectedPurpose =
        purposes.find((item) => String(item.Id) === String(purposeId))?.Name ||
        "All";

      const summaryRows = [
        ["Arab Unity School"],
        ["Teacher Reports"],
        [],
        ["Filters"],
        ["Month", month],
        ["Purpose", selectedPurpose],
        ["Status", status],
        ["Paper Size", paperSize],
        [],
        ["Summary"],
        ["Total Requests", totals.totalRequests],
        ["Total Sheets", totals.totalSheets],
        ["Total Pages", totals.totalPages],
        ["Approved", totals.approved],
        ["Rejected", totals.rejected],
        ["Completed", totals.completed],
        ["Pending", totals.pending],
        ["A4 Sheets", totals.a4Sheets],
        ["A3 Sheets", totals.a3Sheets],
      ];

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet(summaryRows),
        "Summary"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(
          requests.map((row) => ({
            "Request No": row.RequestNumber || "-",
            Date: row.SubmittedAt
              ? new Date(row.SubmittedAt).toLocaleDateString()
              : "-",
            Purpose: row.PurposeName || "-",
            "Paper Size": row.PaperSize || "-",
            Sheets: row.TotalSheets || 0,
            Pages: row.TotalPages || 0,
            Status: row.Status || "-",
          }))
        ),
        "Requests"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(purposeBreakdown),
        "Purpose Breakdown"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(statusSummary),
        "Status Summary"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(monthlyTrend),
        "Monthly Trend"
      );

      XLSX.writeFile(workbook, "Teacher_Report.xlsx");
    } catch (err) {
      console.error("Excel export error:", err);
      alert("Failed to export Excel.");
    }
  };

  return (
      <DashboardLayout
        sidebar={<Sidebar role="teacher" />}
        topbar={<Topbar />}
      >
      <Box
        ref={reportRef}
        sx={{
          bgcolor: COLORS.bg,
          minHeight: "100vh",
          p: { xs: 1.5, md: 3 },
        }}
      >
        {/* HEADER */}
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
            <Typography
              variant="h4"
              fontWeight={950}
              sx={{ color: COLORS.navy, letterSpacing: "-0.5px" }}
            >
              Teacher Reports
            </Typography>

            <Typography
              sx={{
                color: "#475569",
                fontWeight: 700,
                mt: 0.5,
              }}
            >
              Photocopy Analytics & Insights
            </Typography>

            <Typography sx={{ color: "#64748B", mt: 0.5, fontSize: 14 }}>
              Track and analyze your photocopy requests and usage.
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gap: 1 }}>
            <Button
              variant="outlined"
              endIcon={<TableChartOutlined />}
              onClick={handleExportExcel}
              sx={topButtonStyle}
            >
              Export
            </Button>

            <Button
              variant="outlined"
              startIcon={<CalendarMonthOutlined />}
              sx={topButtonStyle}
            >
              {month === "All"
                ? "All Months"
                : filters.months?.find((m) => m.value === month)?.label || month}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {/* KPI CARDS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              xl: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          <KpiCard title="Total Requests" value={totals.totalRequests} color={COLORS.blue} icon={<AssignmentOutlined />} />
          <KpiCard title="Total Sheets" value={totals.totalSheets} color={COLORS.green} icon={<PrintOutlined />} />
          <KpiCard title="Total Pages" value={totals.totalPages} color={COLORS.purple} icon={<DescriptionOutlined />} />
          <KpiCard title="Approved" value={totals.approved} color={COLORS.teal} icon={<CheckCircleOutlineOutlined />} />
          <KpiCard title="Rejected" value={totals.rejected} color={COLORS.red} icon={<CancelOutlined />} negative />
          <KpiCard title="Completed" value={totals.completed} color={COLORS.blue} icon={<FactCheckOutlined />} />
          <KpiCard title="A4 Usage" value={totals.a4Sheets} color={COLORS.teal} icon={<InsertDriveFileOutlined />} />
          <KpiCard title="A3 Usage" value={totals.a3Sheets} color={COLORS.orange} icon={<InsertDriveFileOutlined />} negative />
        </Box>

        {/* FILTER BAR */}
        <ReportCard sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(4, 1fr) auto auto",
              },
              gap: 2,
              alignItems: "end",
            }}
          >
            <TextField
              select
              label="Month"
              size="small"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <MenuItem value="All">All Months</MenuItem>
              {(filters.months || []).map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Purpose"
              size="small"
              value={purposeId}
              onChange={(e) => setPurposeId(e.target.value)}
              disabled={purposeLoading}
            >
              <MenuItem value="All">All Purposes</MenuItem>
              {purposes.map((item) => (
                <MenuItem key={item.Id} value={String(item.Id)}>
                  {item.Name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="All">All Status</MenuItem>
              {(filters.statuses || []).map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.value}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Paper Size"
              size="small"
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
            >
              <MenuItem value="All">All Sizes</MenuItem>
              {(filters.paperSizes || []).map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.value}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              startIcon={<RestartAltOutlined />}
              onClick={resetFilters}
              sx={actionButtonStyle}
            >
              Reset Filters
            </Button>

            <Box sx={{ display: "grid", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<TableChartOutlined />}
                onClick={handleExportExcel}
                sx={{ ...actionButtonStyle, bgcolor: COLORS.green }}
              >
                Export Excel
              </Button>

              <Button
                variant="contained"
                startIcon={<PictureAsPdfOutlined />}
                onClick={handleExportPdf}
                sx={{ ...actionButtonStyle, bgcolor: COLORS.blue }}
              >
                Export PDF
              </Button>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<FilterAltOutlined />}
            onClick={loadReports}
            disabled={loading}
            sx={{
              mt: 2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 900,
              bgcolor: COLORS.navy,
            }}
          >
            Apply Filters
          </Button>
        </ReportCard>

        {/* CHART ROW */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.25fr 1fr" },
            gap: 2,
            mt: 2,
          }}
        >
          <TrendChart data={monthlyTrend} />
          <StatusOverview data={statusSummary} total={totals.totalRequests} />
        </Box>

        {/* ACTIVITY TIMELINE */}
        <Box sx={{ mt: 2 }}>
          <ActivityTimeline data={activityTimeline} />
        </Box>

        {/* PURPOSE + PAPER USAGE */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 2,
            mt: 2,
          }}
        >
          <PurposeBreakdown data={purposeBreakdown} />
          <PaperUsageSplit a4={a4Usage} a3={a3Usage} />
        </Box>

        {/* INSIGHTS */}
        <Box sx={{ mt: 2 }}>
          <ReportCard>
            <SectionTitle title="Insights" />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  xl: "repeat(4, 1fr)",
                },
                gap: 2,
                mt: 2,
              }}
            >
              <InsightCard title="Most used purpose" value={mostUsedPurpose?.name || "No data"} subtitle={`${mostUsedPurpose?.percentage || 0}% of total sheets`} />
              <InsightCard title="Highest usage month" value={insights.highestUsageMonth?.month || "No data"} subtitle={`${insights.highestUsageMonth?.sheets || 0} sheets`} />
              <InsightCard title="Average sheets per request" value={insights.averageSheetsPerRequest || 0} subtitle="Based on filtered data" />
              <InsightCard title="Most common paper size" value={insights.mostCommonPaperSize || "No data"} subtitle="Based on sheet usage" />
            </Box>
          </ReportCard>
        </Box>

        {/* DETAILED REQUESTS */}
        <Box sx={{ mt: 2 }}>
          <DetailedRequests
            rows={filteredRequests}
            search={search}
            setSearch={setSearch}
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
}

// ============================================
// Reusable Report Card
// ============================================

function ReportCard({ children, sx = {} }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
        bgcolor: "#FFFFFF",
        ...sx,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>{children}</CardContent>
    </Card>
  );
}

// ============================================
// Section Title
// ============================================

function SectionTitle({ title }) {
  return (
    <Typography fontWeight={950} color={COLORS.navy} fontSize={17}>
      {title}
    </Typography>
  );
}

// ============================================
// KPI Card with mini sparkline visual
// ============================================

function KpiCard({ title, value, icon, color, negative = false }) {
  return (
    <ReportCard>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            bgcolor: color,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 12px 24px ${color}35`,
            "& svg": { fontSize: 28 },
          }}
        >
          {icon}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography fontSize={13} fontWeight={900} color={COLORS.navy}>
            {title}
          </Typography>

          <Typography variant="h5" fontWeight={950} color={COLORS.navy}>
            {value}
          </Typography>

          <Typography
            fontSize={12}
            fontWeight={900}
            color={negative ? COLORS.red : "#059669"}
          >
            {negative ? "▼" : "▲"} {negative ? "0%" : "0%"}
          </Typography>
        </Box>

        <MiniSparkline color={color} />
      </Box>
    </ReportCard>
  );
}

// ============================================
// Mini Sparkline visual only
// ============================================

function MiniSparkline({ color }) {
  const data = [
    { v: 2 },
    { v: 4 },
    { v: 3 },
    { v: 5 },
    { v: 4 },
    { v: 7 },
    { v: 6 },
    { v: 9 },
  ];

  return (
    <Box sx={{ width: 82, height: 44 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            fill={`${color}22`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

// ============================================
// Sheets Printed Trend
// ============================================

function TrendChart({ data }) {
  return (
    <ReportCard>
      <SectionTitle title="Sheets Printed Trend" />

      <Box sx={{ height: 300, mt: 2 }}>
        {data.length === 0 ? (
          <EmptyState message="No trend data available." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="sheets"
                name="Total Sheets"
                stroke={COLORS.blue}
                fill="#DBEAFE"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>
    </ReportCard>
  );
}

// ============================================
// Status Overview Donut
// ============================================

function StatusOverview({ data, total }) {
  return (
    <ReportCard>
      <SectionTitle title="Status Overview" />

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Box sx={{ height: 280 }}>
          {data.length === 0 ? (
            <EmptyState message="No status data." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="requests"
                  nameKey="status"
                  innerRadius={75}
                  outerRadius={110}
                  paddingAngle={2}
                >
                  {data.map((item, index) => (
                    <Cell
                      key={item.status}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Box sx={{ display: "grid", alignContent: "center", gap: 1.5 }}>
          {data.map((item, index) => {
            const percent =
              total > 0 ? ((item.requests / total) * 100).toFixed(1) : 0;

            return (
              <Box key={item.status}>
                <Typography fontWeight={900} color={COLORS.navy}>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: CHART_COLORS[index % CHART_COLORS.length],
                      mr: 1,
                    }}
                  />
                  {item.status}
                </Typography>

                <Typography fontSize={13} color="#475569">
                  {item.requests} ({percent}%)
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </ReportCard>
  );
}

// ============================================
// Request Activity Timeline
// ============================================

function ActivityTimeline({ data }) {
  return (
    <ReportCard>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <SectionTitle title="Request Activity Timeline (Daily)" />

        <Box sx={{ display: "flex", gap: 1 }}>
          {["Daily", "Weekly", "Monthly"].map((item) => (
            <Chip
              key={item}
              label={item}
              size="small"
              variant={item === "Daily" ? "filled" : "outlined"}
              sx={{
                fontWeight: 900,
                bgcolor: item === "Daily" ? "#DBEAFE" : "#FFFFFF",
                color: COLORS.blue,
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ height: 230, mt: 2 }}>
        {data.length === 0 ? (
          <EmptyState message="No activity data available." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="requests"
                name="Requests"
                stroke={COLORS.blue}
                fill="#DBEAFE"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>
    </ReportCard>
  );
}

// ============================================
// Purpose Breakdown Donut
// ============================================

function PurposeBreakdown({ data }) {
  return (
    <ReportCard>
      <SectionTitle title="Purpose Breakdown" />

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Box sx={{ height: 260 }}>
          {data.length === 0 ? (
            <EmptyState message="No purpose data." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="sheets"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                >
                  {data.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Box sx={{ display: "grid", alignContent: "center", gap: 1 }}>
          {data.map((item, index) => (
            <Box
              key={item.name}
              sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}
            >
              <Typography fontSize={13} fontWeight={800}>
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: CHART_COLORS[index % CHART_COLORS.length],
                    mr: 1,
                  }}
                />
                {item.name}
              </Typography>

              <Typography fontSize={13} fontWeight={900}>
                {item.sheets} ({item.percentage}%)
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </ReportCard>
  );
}

// ============================================
// Paper Usage Split
// ============================================

function PaperUsageSplit({ a4, a3 }) {
  const total = Number(a4.sheets || 0) + Number(a3.sheets || 0);
  const a4Percent = total > 0 ? ((a4.sheets / total) * 100).toFixed(1) : 0;
  const a3Percent = total > 0 ? ((a3.sheets / total) * 100).toFixed(1) : 0;

  return (
    <ReportCard>
      <SectionTitle title="Paper Usage Split" />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "3fr 1fr",
          gap: 0.5,
          height: 210,
          mt: 3,
        }}
      >
        <Box
          sx={{
            borderRadius: 3,
            bgcolor: COLORS.green,
            color: "#FFFFFF",
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5" fontWeight={950}>
            A4
          </Typography>
          <Typography variant="h4" fontWeight={950}>
            {a4.sheets || 0}
          </Typography>
          <Typography fontWeight={900}>{a4Percent}%</Typography>
        </Box>

        <Box
          sx={{
            borderRadius: 3,
            bgcolor: COLORS.blue,
            color: "#FFFFFF",
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5" fontWeight={950}>
            A3
          </Typography>
          <Typography variant="h4" fontWeight={950}>
            {a3.sheets || 0}
          </Typography>
          <Typography fontWeight={900}>{a3Percent}%</Typography>
        </Box>
      </Box>
    </ReportCard>
  );
}

// ============================================
// Insight Card
// ============================================

function InsightCard({ title, value, subtitle }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 6px 18px rgba(15,23,42,0.04)",
      }}
    >
      <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            bgcolor: "#DCFCE7",
            color: COLORS.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrendingUpOutlined />
        </Box>

        <Box>
          <Typography fontSize={12} color="#475569" fontWeight={800}>
            {title}
          </Typography>
          <Typography color={COLORS.green} fontWeight={950}>
            {value}
          </Typography>
          <Typography fontSize={12} color="#475569">
            {subtitle}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================
// Detailed Requests Table
// ============================================

function DetailedRequests({ rows, search, setSearch }) {
  return (
    <ReportCard>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <SectionTitle title="Detailed Requests" />

        <TextField
          size="small"
          placeholder="Search requests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: "100%", sm: 280 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {rows.length === 0 ? (
        <EmptyState message="No request records found." />
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={tableHeaderStyle}>
            <Box>Request No.</Box>
            <Box>Date</Box>
            <Box>Purpose</Box>
            <Box>Paper Size</Box>
            <Box>Sheets</Box>
            <Box>Pages</Box>
            <Box>Status</Box>
          </Box>

          <Divider />

          {rows.map((row) => (
            <Box key={row.RequestId || row.RequestNumber} sx={tableRowStyle}>
              <Box>{row.RequestNumber}</Box>
              <Box>
                {row.SubmittedAt
                  ? new Date(row.SubmittedAt).toLocaleDateString()
                  : "-"}
              </Box>
              <Box>{row.PurposeName || "-"}</Box>
              <Box>{row.PaperSize || "-"}</Box>
              <Box>{row.TotalSheets || 0}</Box>
              <Box>{row.TotalPages || 0}</Box>
              <Box>
                <Chip
                  label={row.Status || "-"}
                  size="small"
                  sx={{
                    fontWeight: 900,
                    bgcolor: getStatusColor(row.Status).bg,
                    color: getStatusColor(row.Status).color,
                  }}
                />
              </Box>
            </Box>
          ))}

          <Typography fontSize={13} color="#475569" mt={2}>
            Showing {rows.length} filtered record(s)
          </Typography>
        </Box>
      )}
    </ReportCard>
  );
}

// ============================================
// Empty State
// ============================================

function EmptyState({ message }) {
  return (
    <Box
      sx={{
        minHeight: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        color: "#64748B",
        textAlign: "center",
      }}
    >
      {message}
    </Box>
  );
}

// ============================================
// Status colors
// ============================================

function getStatusColor(status = "") {
  const value = status.toLowerCase();

  if (value.includes("completed")) return { bg: "#DBEAFE", color: "#1D4ED8" };
  if (value.includes("approved")) return { bg: "#DCFCE7", color: "#15803D" };
  if (value.includes("pending")) return { bg: "#FEF3C7", color: "#B45309" };
  if (value.includes("rejected")) return { bg: "#FEE2E2", color: "#B91C1C" };
  if (value.includes("printing")) return { bg: "#EDE9FE", color: "#6D28D9" };

  return { bg: "#E5E7EB", color: "#374151" };
}

// ============================================
// Styles
// ============================================

const topButtonStyle = {
  borderRadius: 3,
  textTransform: "none",
  fontWeight: 900,
  color: COLORS.navy,
  borderColor: COLORS.border,
  bgcolor: "#FFFFFF",
};

const actionButtonStyle = {
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 900,
  minHeight: 40,
};

const tableHeaderStyle = {
  minWidth: 900,
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr 1.5fr 1fr 1fr 1fr 1.2fr",
  gap: 2,
  p: 1.5,
  bgcolor: "#F8FAFC",
  borderRadius: 2,
  fontWeight: 950,
  color: COLORS.navy,
  fontSize: 13,
};

const tableRowStyle = {
  minWidth: 900,
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr 1.5fr 1fr 1fr 1fr 1.2fr",
  gap: 2,
  p: 1.5,
  alignItems: "center",
  borderBottom: `1px solid ${COLORS.border}`,
  fontSize: 14,
};
