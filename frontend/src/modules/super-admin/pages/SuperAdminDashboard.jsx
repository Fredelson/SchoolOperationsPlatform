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

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardKpis from "../components/dashboard/DashboardKpis";
import DashboardMiddleRow from "../components/dashboard/DashboardMiddleRow";

import {
  dashboardStats,
  platformActivityData,
  moduleStatus,
  systemHealth,
  recentActivities,
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
    </Box>
  );
}