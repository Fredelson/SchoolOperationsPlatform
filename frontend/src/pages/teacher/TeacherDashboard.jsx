// ============================================
// ARAB UNITY SCHOOL
// Teacher Dashboard Page
// ============================================

import DashboardLayout from "../../layouts/DashboardLayout";

import Sidebar from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import PageHeader from "../../components/common/PageHeader";
import DateFilter from "../../components/common/DateFilter";

import { Box } from "@mui/material";

import {
  Assignment,
  Print,
  Description,
  Pending,
  CheckCircle,
  TaskAlt,
} from "@mui/icons-material";

import { useAuth } from "../../context/AuthContext";

import { dashboardStats } from "../../data/dashboardData";
import KPIGrid from "../../components/dashboard/KPIGrid";
import MonthlyUsageChart from "../../components/dashboard/MonthlyUsageChart";
import PurposeBreakdownChart from "../../components/dashboard/PurposeBreakdownChart";
import StatusOverview from "../../components/dashboard/StatusOverview";
import RecentRequestsTable from "../../components/dashboard/RecentRequestsTable";
import RequestProgressTracker from "../../components/dashboard/RequestProgressTracker";
import AttachmentSummary from "../../components/dashboard/AttachmentSummary";
import RecentAttachments from "../../components/dashboard/RecentAttachments";
import QuickActions from "../../components/dashboard/QuickActions";
import PurposeUsageTrend from "../../components/dashboard/PurposeUsageTrend";

export default function TeacherDashboard() {
  // Get logged-in user
  const { user } = useAuth();

  // Icons matched with dashboardStats order
  const icons = [
    <Assignment />,
    <Print />,
    <Description />,
    <Pending />,
    <CheckCircle />,
    <TaskAlt />,
  ];

  return (
    <DashboardLayout
      sidebar={<Sidebar role="teacher" />}
      topbar={
        <Topbar
          userName={user?.fullName || "Teacher"}
          role={user?.displayRole || user?.role || "Teacher"}
        />
      }
    >
      {/* Page Header */}
      <PageHeader
        title={`Welcome Back, ${user?.fullName || "Teacher"}! 👋`}
        subtitle="Here's your request summary and activity overview."
        action={<DateFilter label="May 1 - May 31, 2025" />}
      />

      {/* KPI Cards */}
      <KPIGrid stats={dashboardStats} icons={icons} />

      {/* Analytics Section */}
      <Box
        sx={{
          mt: 4,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "2fr 1fr 1fr",
          },
          gap: 3,
        }}
      >
        <MonthlyUsageChart />
        <PurposeBreakdownChart />
        <StatusOverview />
      </Box>

      {/* Operations Section */}
      <Box
        sx={{
          mt: 4,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "2fr 1fr 1fr",
          },
          gap: 3,
        }}
      >
        <RecentRequestsTable />
        <RequestProgressTracker />
        <AttachmentSummary />
      </Box>

      {/* Bottom Dashboard Section */}
      <Box
        sx={{
          mt: 4,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr 1fr",
          },
          gap: 3,
        }}
      >
        <RecentAttachments />
        <PurposeUsageTrend />
        <QuickActions />
      </Box>
    </DashboardLayout>
  );
}