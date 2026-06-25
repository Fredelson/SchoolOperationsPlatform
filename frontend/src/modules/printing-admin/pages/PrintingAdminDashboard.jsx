// ============================================
// ARAB UNITY SCHOOL
// Printing Management Dashboard Page
//
// Purpose:
// Main dashboard for Printing Admin / Platform Admin.
//
// Access:
// - Super Admin
// - Printing Admin
//
// Architecture:
// Reuses Super Admin dashboard components
// and adds printing-specific widgets.
//
// Backend:
// GET /api/printing/dashboard
// ============================================

import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import PageHeader from "../../../components/common/PageHeader";

import DashboardKpis from "../../../components/dashboard/DashboardKpis";
import DashboardMiddleRow from "../../../components/layout/DashboardMiddleRow";
import TopPrintRequests from "../../../components/dashboard/TopPrintRequests";
import ModuleStatusChart from "../../../components/charts/ModuleStatusChart";
import PendingApprovals from "../../../components/dashboard/PendingApprovals";

import InventorySummaryCard from "../components/InventorySummaryCard";

import { getPrintingDashboard } from "../../../services/printingService";

import {
  printingDashboardStats,
  printActivityData,
  printJobStatus,
  inventoryHealth,
  recentPrintJobs,
  topPrintingDepartments,
  paperUsageStatus,
  printingPendingActions,
  paperInventorySummary,
} from "../data/printingDashboardData";

// ============================================
// Component
// ============================================

export default function PrintingAdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: printingDashboardStats,
    printActivity: printActivityData,
    jobStatus: printJobStatus,
    inventoryHealth,
    recentJobs: recentPrintJobs,
    topDepartments: topPrintingDepartments,
    paperUsage: paperUsageStatus,
    pendingActions: printingPendingActions,
    inventorySummary: paperInventorySummary,
  });

  const [loading, setLoading] = useState(false);

  // ============================================
  // Load Dashboard Data
  // Uses backend data when available.
  // Falls back to static demo data if backend fails.
  // ============================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const data = await getPrintingDashboard();

        setDashboardData({
          stats: data?.stats || printingDashboardStats,
          printActivity: data?.printActivity || printActivityData,
          jobStatus: data?.jobStatus || printJobStatus,
          inventoryHealth: data?.inventoryHealth || inventoryHealth,
          recentJobs: data?.recentJobs || recentPrintJobs,
          topDepartments: data?.topDepartments || topPrintingDepartments,
          paperUsage: data?.paperUsage || paperUsageStatus,
          pendingActions: data?.pendingActions || printingPendingActions,
          inventorySummary: data?.inventorySummary || paperInventorySummary,
        });
      } catch (error) {
        console.error("Failed to load printing dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2 },
        bgcolor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Page Header */}
      <PageHeader
        title="Printing Management"
        subtitle={
          loading
            ? "Loading dashboard data..."
            : "Manage print jobs, paper inventory, usage, and operational alerts"
        }
      />

      {/* KPI Cards */}
      <DashboardKpis stats={dashboardData.stats} />

      {/* 
        Main Analytics Row:
        Print Activity | Job Status | Inventory Health | Recent Print Jobs
      */}
      <DashboardMiddleRow
        platformActivityData={dashboardData.printActivity}
        moduleStatusData={dashboardData.jobStatus}
        systemHealthData={dashboardData.inventoryHealth}
        recentActivityData={dashboardData.recentJobs}
      />

      {/* 
        Printing Bottom Row:
        Top Departments | Paper Usage | Inventory Summary | Inventory Alerts
      */}
      <Box
        sx={{
          mt: 1,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1,
          alignItems: "stretch",
        }}
      >
        {/* Top Departments */}
        <TopPrintRequests
          title="Top Departments"
          subtitle="This Month"
          items={dashboardData.topDepartments}
        />

        {/* Paper Usage */}
        <ModuleStatusChart
          title="Paper Usage"
          subtitle="Current paper consumption"
          data={dashboardData.paperUsage}
        />

        {/* Inventory Summary */}
        <InventorySummaryCard items={dashboardData.inventorySummary} />

        {/* Inventory Alerts */}
        <PendingApprovals
          title="Inventory Alerts"
          subtitle="Items requiring attention"
          items={dashboardData.pendingActions}
        />
      </Box>
    </Box>
  );
}