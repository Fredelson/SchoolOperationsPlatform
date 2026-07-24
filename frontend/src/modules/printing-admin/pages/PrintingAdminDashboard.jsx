// ============================================
// ARAB UNITY SCHOOL
// Printing Admin Dashboard Page
//
// Purpose:
// Main dashboard for Printing Admin / Platform Admin.
//
// Access:
// - Super Admin
// - Printing Admin
//
// Architecture:
// - Page stays mostly render-only
// - Data comes from backend when available
// - Static demo data is used as fallback
// - Printing-specific widgets stay inside printing-admin module
//
// Backend:
// GET /api/printing/dashboard
// ============================================

import { useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";

import PageHeader from "../../../components/common/PageHeader";
import KpiGrid from "../../../components/common/KpiGrid";

import {
  PrintingAnalyticsRow,
  PrintingOperationsRow,
} from "../components";

import { getPrintingDashboard } from "../../../services/printingService";

const emptyDashboardData = {
  stats: [],
  printActivity: [],
  jobStatus: [],
  inventoryHealth: [],
  recentJobs: [],
  topDepartments: [],
  paperUsage: [],
  pendingActions: [],
  inventorySummary: [],
};

// ============================================
// Component
// ============================================

export default function PrintingAdminDashboard() {
  const [dashboardData, setDashboardData] = useState(emptyDashboardData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // Load Dashboard Data
  // Uses live Printing Management data only.
  // ============================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPrintingDashboard();

        setDashboardData({
          stats: data?.stats ?? [],
          printActivity: data?.printActivity ?? [],
          jobStatus: data?.jobStatus ?? [],
          inventoryHealth: data?.inventoryHealth ?? [],
          recentJobs: data?.recentJobs ?? [],
          topDepartments: data?.topDepartments ?? [],
          paperUsage: data?.paperUsage ?? [],
          pendingActions: data?.pendingActions ?? [],
          inventorySummary: data?.inventorySummary ?? [],
        });
      } catch (error) {
        console.error("Failed to load printing dashboard:", error);
        setDashboardData(emptyDashboardData);
        setError(
          error?.response?.data?.message ||
            "Printing Management data could not be loaded."
        );
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <KpiGrid stats={dashboardData.stats} />

      {/* Printing Analytics Row */}
      <PrintingAnalyticsRow
        printActivity={dashboardData.printActivity}
        jobStatus={dashboardData.jobStatus}
        inventoryHealth={dashboardData.inventoryHealth}
        recentJobs={dashboardData.recentJobs}
      />

      {/* Printing Operations Row */}
      <PrintingOperationsRow
        topDepartments={dashboardData.topDepartments}
        paperUsage={dashboardData.paperUsage}
        inventorySummary={dashboardData.inventorySummary}
        pendingActions={dashboardData.pendingActions}
      />
    </Box>
  );
}
