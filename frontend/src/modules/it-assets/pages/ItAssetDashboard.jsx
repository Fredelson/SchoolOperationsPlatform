// ============================================
// IT Asset Dashboard Page
// Arab Unity School Operations Platform
// ============================================

import { Box, Stack } from "@mui/material";

import usePageTitle from "../../../platform/hooks/usePageTitle";
import {
  AppBreadcrumbs,
  AppButton,
  AppEmptyState,
  AppLoadingState,
  AppPageHeader,
  AppStatCards,
  AppToolbar,
} from "../../../platform/ui";

import { useItAssetDashboard } from "../hooks/useItAssetDashboard";
import { buildItAssetDashboardCards } from "../cards/dashboardCards";
import DashboardCharts from "../components/DashboardCharts";
import DashboardTables from "../components/DashboardTables";

const ItAssetDashboard = () => {
  usePageTitle("AUS | IT Asset Dashboard");

  const { dashboard, loading, error, refetch } = useItAssetDashboard();

  if (loading) {
    return <AppLoadingState title="Loading IT Asset Dashboard..." />;
  }

  if (error) {
    return (
      <AppEmptyState
        title="Unable to load dashboard"
        message={error}
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }

  const cards = buildItAssetDashboardCards(dashboard?.kpis);

  return (
    <Box>
      <AppBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "IT Assets" },
        ]}
      />

      <AppPageHeader
        title="IT Asset Dashboard"
        subtitle="Live operational view of assets, assignments, maintenance, transfers, disposals, and procurement requirements."
      />

      <AppToolbar
        title="Asset Overview"
        actions={<AppButton onClick={refetch}>Refresh</AppButton>}
      />

      <Stack spacing={3}>
        <AppStatCards items={cards} spacing={1.5} />

        <DashboardCharts charts={dashboard?.charts} />

        <DashboardTables dashboard={dashboard} />
      </Stack>
    </Box>
  );
};

export default ItAssetDashboard;
