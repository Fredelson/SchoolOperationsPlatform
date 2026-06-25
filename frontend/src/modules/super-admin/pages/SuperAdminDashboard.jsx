// ============================================
// ARAB UNITY SCHOOL
// Super Admin Dashboard Page
//
// Purpose:
// Main render-only dashboard page.
//
// Important:
// Dashboard data should stay inside:
// src/modules/super-admin/data/superAdminDashboardData.jsx
// ============================================

import { Box } from "@mui/material";

import AllModules from "../../../components/dashboard/AllModules";
import DashboardKpis from "../../../components/dashboard/DashboardKpis";
import DashboardHeader from "../../../components/layout/DashboardHeader";
import DashboardMiddleRow from "../../../components/layout/DashboardMiddleRow";
import DashboardBottomRow from "../../../components/layout/DashboardBottomRow";

import {
  dashboardStats,
  platformActivityData,
  moduleStatus,
  systemHealth,
  recentActivities,
  modulesOverview,
  pendingApprovals,
  topPrintRequests,
  ticketStatus,
  assetSummary,
} from "../data/superAdminDashboardData";

// ============================================
// Component
// ============================================

export default function SuperAdminDashboard() {
  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2 },
        bgcolor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Page Header */}
      <DashboardHeader />

      {/* KPI Cards */}
      <DashboardKpis stats={dashboardStats} />

      {/* 
        Middle Row:
        System Overview | Module Status | System Health | Recent Activities
      */}
      <DashboardMiddleRow
        platformActivityData={platformActivityData}
        moduleStatusData={moduleStatus}
        systemHealthData={systemHealth}
        recentActivityData={recentActivities}
      />

      {/* All Modules Section */}
      <AllModules modules={modulesOverview} />

      {/* Bottom Analytics Row */}
      <DashboardBottomRow
        topPrintRequests={topPrintRequests}
        ticketStatus={ticketStatus}
        assetSummary={assetSummary}
        pendingApprovals={pendingApprovals}
      />
    </Box>
  );
}