// ============================================
// ARAB UNITY SCHOOL
// Teacher Dashboard Page
// Backend Connected Modern Dashboard UI
// ============================================

import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/common/Topbar";
import usePageTitle from "../../hooks/usePageTitle";

import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import {
  Assignment,
  CalendarMonth,
  Cancel,
  CheckCircle,
  Description,
  FolderZip,
  Image,
  MoreVert,
  Pending,
  PictureAsPdf,
  TaskAlt,
  TrendingDown,
  TrendingUp,
  Visibility,
} from "@mui/icons-material";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getTeacherDashboardData } from "../../services/teacherDashboardService";

// ============================================
// Theme Colors
// ============================================
const AUS_GREEN = "#007a3d";
const TEXT_DARK = "#070b2d";

// ============================================
// Default Trends
// Prevents undefined errors before backend loads
// ============================================
const defaultTrends = {
  totalRequests: { percent: 0, direction: "up" },
  totalSheets: { percent: 0, direction: "up" },
  totalPages: { percent: 0, direction: "up" },
  pendingRequests: { percent: 0, direction: "up" },
  approvedRequests: { percent: 0, direction: "up" },
  rejectedRequests: { percent: 0, direction: "up" },
  completedRequests: { percent: 0, direction: "up" },
};

// ============================================
// Teacher Dashboard Component
// ============================================
export default function TeacherDashboard() {
  usePageTitle("TeacherDashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // KPI values
  const [kpis, setKpis] = useState({
    totalRequests: 0,
    totalSheets: 0,
    totalPages: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    completedRequests: 0,
  });

  // KPI percentage trends
  const [trends, setTrends] = useState(defaultTrends);

  // Small chart inside KPI cards
  const [sparklineTrends, setSparklineTrends] = useState({});

  // Main dashboard data
  const [recentRequests, setRecentRequests] = useState([]);
  const [monthlyUsage, setMonthlyUsage] = useState([]);
  const [purposeBreakdown, setPurposeBreakdown] = useState([]);

  // Attachment summary
  const [attachmentSummary, setAttachmentSummary] = useState({
    pdfFiles: 0,
    imageFiles: 0,
    documentFiles: 0,
    archiveFiles: 0,
    usedMB: 0,
    totalMB: 1024,
    totalAttachments: 0,
    largestFileMB: 0,
  });

  // ============================================
  // Load Dashboard Data From Backend
  // ============================================
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getTeacherDashboardData();

        console.log("Teacher Dashboard Response:", response);
        console.log("Purpose Breakdown Response:", response.purposeBreakdown);

        const stats = response.data || response.stats || {};

        // Set KPI values
        setKpis({
          totalRequests: stats.totalRequests || stats.TotalRequests || 0,
          totalSheets: stats.totalSheets || stats.TotalSheets || 0,
          totalPages: stats.totalPages || stats.TotalPages || 0,
          pendingRequests: stats.pendingRequests || stats.PendingRequests || 0,
          approvedRequests: stats.approvedRequests || stats.ApprovedRequests || 0,
          rejectedRequests: stats.rejectedRequests || stats.RejectedRequests || 0,
          completedRequests:
            stats.completedRequests || stats.CompletedRequests || 0,
        });

        // Set trends
        setTrends({
          ...defaultTrends,
          ...(response.trends || {}),
        });

        // Set mini sparkline chart data
        setSparklineTrends(response.sparklineTrends || {});

        // Set chart/card data
        setRecentRequests(response.recentRequests || []);
        setMonthlyUsage(response.monthlyUsage || []);
        setPurposeBreakdown(response.purposeBreakdown || []);

        // Set attachment summary
        setAttachmentSummary((prev) => ({
          ...prev,
          ...(response.attachmentSummary || {}),
        }));
      } catch (err) {
        console.error("Failed to load teacher dashboard data:", err);
        setError("Failed to load teacher dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // ============================================
  // Format Monthly Usage for Chart
  // ============================================
  const chartData = useMemo(() => {
    return (monthlyUsage || []).map((item) => ({
      month: item.MonthName || item.month || item.Month || "Month",
      pages: item.TotalPages || item.totalPages || item.pages || 0,
      sheets: item.TotalSheets || item.totalSheets || item.sheets || 0,
    }));
  }, [monthlyUsage]);

  // ============================================
  // KPI Cards
  // ============================================
  const kpiCards = [
    {
      title: "Total Requests",
      value: kpis.totalRequests,
      icon: <Assignment />,
      color: AUS_GREEN,
      trend: `${trends.totalRequests?.percent || 0}% vs last month`,
      trendDirection: trends.totalRequests?.direction || "up",
      sparkData: sparklineTrends.totalRequests || [],
    },
    {
      title: "Total Sheets",
      value: kpis.totalSheets,
      icon: <TaskAlt />,
      color: AUS_GREEN,
      trend: `${trends.totalSheets?.percent || 0}% vs last month`,
      trendDirection: trends.totalSheets?.direction || "up",
      sparkData: sparklineTrends.totalSheets || [],
    },
    {
      title: "Total Pages",
      value: kpis.totalPages,
      icon: <Description />,
      color: AUS_GREEN,
      trend: `${trends.totalPages?.percent || 0}% vs last month`,
      trendDirection: trends.totalPages?.direction || "up",
      sparkData: sparklineTrends.totalPages || [],
    },
    {
      title: "Pending",
      value: kpis.pendingRequests,
      icon: <Pending />,
      color: "#f59e0b",
      trend: `${trends.pendingRequests?.percent || 0}% vs last month`,
      trendDirection: trends.pendingRequests?.direction || "up",
      sparkData: sparklineTrends.pendingRequests || [],
    },
    {
      title: "Approved",
      value: kpis.approvedRequests,
      icon: <CheckCircle />,
      color: AUS_GREEN,
      trend: `${trends.approvedRequests?.percent || 0}% vs last month`,
      trendDirection: trends.approvedRequests?.direction || "up",
      sparkData: sparklineTrends.approvedRequests || [],
    },
    {
      title: "Rejected",
      value: kpis.rejectedRequests,
      icon: <Cancel />,
      color: "#ef4444",
      trend: `${trends.rejectedRequests?.percent || 0}% vs last month`,
      trendDirection: trends.rejectedRequests?.direction || "up",
      sparkData: sparklineTrends.rejectedRequests || [],
    },
    {
      title: "Completed",
      value: kpis.completedRequests,
      icon: <TaskAlt />,
      color: "#2563eb",
      trend: `${trends.completedRequests?.percent || 0}% vs last month`,
      trendDirection: trends.completedRequests?.direction || "up",
      sparkData: sparklineTrends.completedRequests || [],
    },
  ];

  return (
    <DashboardLayout
      sidebar={<Sidebar role="teacher" />}
      topbar={(handleMenuClick) => <Topbar onMenuClick={handleMenuClick} />}
    >
      <Box sx={{ px: { xs: 1, md: 2 }, pb: 3, color: TEXT_DARK }}>
        {/* Header */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 24, md: 32 },
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: TEXT_DARK,
              }}
            >
              Good morning, Teacher! 👋
            </Typography>

            <Typography sx={{ color: "#5b6475", fontSize: 14, mt: 0.5 }}>
              Here&apos;s your request summary and photocopy activity.
            </Typography>
          </Box>

          <Select
            size="small"
            value="current"
            sx={{
              minWidth: 240,
              borderRadius: 3,
              bgcolor: "#fff",
              boxShadow: "0 8px 25px rgba(15, 23, 42, 0.06)",
              "& fieldset": { borderColor: "#e5e7eb" },
            }}
            startAdornment={
              <CalendarMonth sx={{ mr: 1, color: TEXT_DARK, fontSize: 20 }} />
            }
          >
            <MenuItem value="current">Current Month</MenuItem>
          </Select>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ py: 10, display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* KPI First Row */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 2,
                mb: 2,
              }}
            >
              {kpiCards.slice(0, 3).map((card) => (
                <ModernKpiCard key={card.title} {...card} />
              ))}
            </Box>

            {/* KPI Second Row */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  xl: "repeat(4, 1fr)",
                },
                gap: 2,
                mb: 2,
              }}
            >
              {kpiCards.slice(3).map((card) => (
                <ModernKpiCard key={card.title} {...card} compact />
              ))}
            </Box>

            {/* Analytics Row */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "2fr 1.15fr 1.2fr 1.15fr",
                },
                gap: 2,
                alignItems: "stretch",
              }}
            >
              <MonthlyUsageOverview data={chartData} />
              <RequestStatusOverview kpis={kpis} />
              <PurposeBreakdown data={purposeBreakdown} />
              <TeacherAttachmentSummary storage={attachmentSummary} />
            </Box>

            {/* Recent Requests */}
            <Box sx={{ mt: 2 }}>
              <RecentRequestsModern requests={recentRequests} />
            </Box>
          </>
        )}
      </Box>
    </DashboardLayout>
  );
}

// ============================================
// Modern KPI Card
// ============================================
function ModernKpiCard({
  title,
  value,
  icon,
  color,
  trend,
  trendDirection,
  sparkData = [],
  compact = false,
}) {
  const safeSparkData =
    sparkData.length > 0
      ? sparkData
      : [{ value: 0 }, { value: 0 }, { value: 0 }];

  return (
    <Card
      sx={{
        height: compact ? 110 : 130,
        borderRadius: 4,
        border: "1px solid #e8edf3",
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
        overflow: "hidden",
        bgcolor: "#fff",
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          p: 2.2,
          display: "grid",
          gridTemplateColumns: "auto 1fr 120px",
          alignItems: "center",
          gap: 2,
          "&:last-child": { pb: 2.2 },
        }}
      >
        <Avatar
          sx={{
            width: compact ? 52 : 58,
            height: compact ? 52 : 58,
            bgcolor: color,
            boxShadow: `0 10px 24px ${color}40`,
          }}
        >
          {icon}
        </Avatar>

        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 800, color: TEXT_DARK }}>
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: compact ? 27 : 32,
              lineHeight: 1,
              fontWeight: 950,
              color: TEXT_DARK,
              mt: 0.8,
            }}
          >
            {Number(value || 0).toLocaleString()}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.2 }}>
            {trendDirection === "up" ? (
              <TrendingUp sx={{ fontSize: 16, color }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color }} />
            )}

            <Typography sx={{ fontSize: 12, fontWeight: 800, color }}>
              {trend}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ height: 58, display: { xs: "none", sm: "block" } }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={safeSparkData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ r: 2, fill: color }}
              />
              <Tooltip cursor={false} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================
// Monthly Usage Chart
// ============================================
function MonthlyUsageOverview({ data }) {
  return (
    <ModernPanel title="Monthly Usage Overview" icon={<TrendingUp />}>
      <Box sx={{ height: 270 }}>
        {data.length === 0 ? (
          <EmptyBox message="No monthly usage yet." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={6}>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="pages" radius={[8, 8, 0, 0]} fill={AUS_GREEN} />
              <Line
                type="monotone"
                dataKey="sheets"
                stroke={TEXT_DARK}
                strokeWidth={3}
                dot={{ r: 4, fill: TEXT_DARK }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </ModernPanel>
  );
}

// ============================================
// Request Status Overview
// ============================================
function RequestStatusOverview({ kpis }) {
  const total = kpis.totalRequests || 1;

  const data = [
    { name: "Approved", value: kpis.approvedRequests, color: AUS_GREEN },
    { name: "Pending", value: kpis.pendingRequests, color: "#f59e0b" },
    { name: "Completed", value: kpis.completedRequests, color: "#2563eb" },
    { name: "Rejected", value: kpis.rejectedRequests, color: "#ef4444" },
  ];

  return (
    <ModernPanel title="Request Status Overview">
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
        <Box sx={{ height: 190, position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={54}
                outerRadius={82}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              pointerEvents: "none",
            }}
          >
            <Typography sx={{ fontSize: 26, fontWeight: 950 }}>
              {kpis.totalRequests}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#64748b" }}>Total</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "grid", alignContent: "center", gap: 1.4 }}>
          {data.map((item) => (
            <StatusLegend
              key={item.name}
              color={item.color}
              label={item.name}
              value={item.value}
              percent={Math.round((item.value / total) * 100)}
            />
          ))}
        </Box>
      </Box>
    </ModernPanel>
  );
}

// ============================================
// Status Legend
// ============================================
function StatusLegend({ color, label, value, percent }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />

      <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 700 }}>
        {label}
      </Typography>

      <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
        {value} ({percent}%)
      </Typography>
    </Box>
  );
}

// ============================================
// Purpose Breakdown
// FIXED: Gets purpose name properly from backend
// Supports: purposeName, PurposeName, purpose, Purpose
// ============================================
function PurposeBreakdown({ data = [] }) {
  const total = data.reduce((sum, item) => {
    return (
      sum +
      Number(
        item.totalRequests ||
          item.TotalRequests ||
          item.requestCount ||
          item.RequestCount ||
          item.count ||
          item.Count ||
          0
      )
    );
  }, 0);

  return (
    <ModernPanel title="Purpose Breakdown">
      {data.length === 0 ? (
        <EmptyBox message="No purpose data available." />
      ) : (
        data.map((item, index) => {
          const purposeName =
          item.purposeName ??
          item.PurposeName ??
          item.PURPOSENAME ??
          item.purpose ??
          item.Purpose ??
          item.name ??
          item.Name ??
          "Unknown Purpose";

          const count = Number(
            item.totalRequests ??
              item.TotalRequests ??
              item.TOTALREQUESTS ??
              item.requestCount ??
              item.RequestCount ??
              item.count ??
              item.Count ??
              0
          );

          const percent = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <Box key={index} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.8,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Description sx={{ fontSize: 16, color: AUS_GREEN }} />

                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: TEXT_DARK,
                    }}
                  >
                    {purposeName}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: TEXT_DARK,
                  }}
                >
                  {count} ({percent}%)
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                  height: 7,
                  borderRadius: 10,
                  bgcolor: "#eaf2f7",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 10,
                    bgcolor: AUS_GREEN,
                  },
                }}
              />
            </Box>
          );
        })
      )}
    </ModernPanel>
  );
}

// ============================================
// Attachment Summary
// ============================================
function TeacherAttachmentSummary({ storage }) {
  const usedPercent = storage.totalMB
    ? Math.round((storage.usedMB / storage.totalMB) * 100)
    : 0;

  const remainingMB = Math.max(
    (storage.totalMB || 0) - (storage.usedMB || 0),
    0
  );

  const fileCards = [
    {
      label: "PDF Files",
      value: storage.pdfFiles || 0,
      icon: <PictureAsPdf />,
      color: "#dc2626",
      bg: "#fff1f2",
    },
    {
      label: "Images",
      value: storage.imageFiles || 0,
      icon: <Image />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      label: "Documents",
      value: storage.documentFiles || 0,
      icon: <Description />,
      color: "#2563eb",
      bg: "#eff6ff",
    },
    {
      label: "Archives",
      value: storage.archiveFiles || 0,
      icon: <FolderZip />,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
  ];

  return (
    <ModernPanel title="Attachment Summary">
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}>
        {fileCards.map((item) => (
          <Box
            key={item.label}
            sx={{
              border: "1px solid #e8edf3",
              borderRadius: 3,
              p: 1.3,
              display: "flex",
              gap: 1,
              alignItems: "center",
              bgcolor: "#fff",
            }}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: item.bg,
                color: item.color,
              }}
            >
              {item.icon}
            </Avatar>

            <Box>
              <Typography
                sx={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}
              >
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 950, lineHeight: 1 }}>
                {item.value}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#64748b" }}>
                Files
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      <StorageRow label="Used Space" value={`${storage.usedMB || 0} MB`} />
      <StorageRow label="Total Space" value={`${storage.totalMB || 1024} MB`} />
      <StorageRow label="Remaining" value={`${remainingMB} MB`} />

      <LinearProgress
        variant="determinate"
        value={usedPercent}
        sx={{
          height: 8,
          borderRadius: 10,
          mt: 1.5,
          bgcolor: "#e5e7eb",
          "& .MuiLinearProgress-bar": {
            borderRadius: 10,
            bgcolor: AUS_GREEN,
          },
        }}
      />
    </ModernPanel>
  );
}

// ============================================
// Recent Requests
// ============================================
function RecentRequestsModern({ requests }) {
  const rows = requests || [];

  return (
    <Card sx={{ borderRadius: 4, border: "1px solid #e8edf3" }}>
      <CardContent>
        <Typography sx={{ fontSize: 18, fontWeight: 900, mb: 1.5 }}>
          Recent Requests
        </Typography>

        {rows.length === 0 ? (
          <EmptyBox message="No recent requests yet." />
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Box
              component="table"
              sx={{
                width: "100%",
                borderCollapse: "collapse",
                "& th": {
                  textAlign: "left",
                  fontSize: 12,
                  color: "#64748b",
                  pb: 1,
                  borderBottom: "1px solid #e5e7eb",
                },
                "& td": {
                  fontSize: 13,
                  fontWeight: 700,
                  py: 1.1,
                  borderBottom: "1px solid #f1f5f9",
                },
              }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Request ID</th>
                  <th>Purpose</th>
                  <th>Sheets</th>
                  <th>Pages</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.slice(0, 5).map((row, index) => (
                  <tr key={row.RequestId || row.requestId || index}>
                    <td>{index + 1}</td>
                    <td>{row.RequestNumber || row.requestNumber || "-"}</td>
                    <td>{row.PurposeName || row.purposeName || "-"}</td>
                    <td>{row.TotalSheets || row.totalSheets || 0}</td>
                    <td>{row.TotalPages || row.totalPages || 0}</td>
                    <td>
                      <StatusChip status={row.Status || row.status || "Pending"} />
                    </td>
                    <td>{formatDate(row.SubmittedAt || row.submittedAt)}</td>
                    <td>
                      <IconButton size="small">
                        <Visibility sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVert sx={{ fontSize: 18 }} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Shared Panel Wrapper
// ============================================
function ModernPanel({ title, icon, children }) {
  return (
    <Card sx={{ borderRadius: 4, border: "1px solid #e8edf3", height: "100%" }}>
      <CardContent>
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          {icon && (
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: "#eaf7ef",
                color: AUS_GREEN,
              }}
            >
              {icon}
            </Avatar>
          )}

          <Typography sx={{ fontSize: 16, fontWeight: 900 }}>
            {title}
          </Typography>
        </Box>

        {children}
      </CardContent>
    </Card>
  );
}

// ============================================
// Helper Components
// ============================================
function StorageRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
      <Typography sx={{ fontSize: 12, color: "#64748b" }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 850 }}>{value}</Typography>
    </Box>
  );
}

function StatusChip({ status }) {
  const cleanStatus = String(status).toLowerCase();

  let style = {
    bg: "#e5e7eb",
    color: "#374151",
  };

  // Approved
  if (cleanStatus.includes("approved")) {
    style = {
      bg: "#dcfce7",
      color: "#15803d",
    };
  }

  // Pending
  else if (cleanStatus.includes("pending")) {
    style = {
      bg: "#ffedd5",
      color: "#c2410c",
    };
  }

  // Rejected
  else if (cleanStatus.includes("rejected")) {
    style = {
      bg: "#fee2e2",
      color: "#dc2626",
    };
  }

  // Completed
  else if (cleanStatus.includes("completed")) {
    style = {
      bg: "#dcfce7",
      color: "#15803d",
    };
  }

  // Printing
  else if (cleanStatus.includes("printing")) {
    style = {
      bg: "#dbeafe",
      color: "#1d4ed8",
    };
  }

  // Forwarded
  else if (cleanStatus.includes("forwarded")) {
    style = {
      bg: "#e0f2fe",
      color: "#0369a1",
    };
  }

  // Cancelled
  else if (cleanStatus.includes("cancelled")) {
    style = {
      bg: "#f3e8ff",
      color: "#7c3aed",
    };
  }

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        minWidth: 130,
        height: 28,
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 800,
        fontSize: 11,
        borderRadius: "999px",
      }}
    />
  );
}

function EmptyBox({ message }) {
  return (
    <Box
      sx={{
        minHeight: 170,
        borderRadius: 3,
        bgcolor: "#f8fafc",
        display: "grid",
        placeItems: "center",
        color: "#64748b",
        fontWeight: 700,
      }}
    >
      {message}
    </Box>
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}