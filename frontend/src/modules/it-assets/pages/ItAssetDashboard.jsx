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
        description={error}
        action={<AppButton onClick={refetch}>Retry</AppButton>}
      />
    );
  }

  const cards = buildItAssetDashboardCards(dashboard?.kpis);

  return (
    <Box>
      <AppBreadcrumbs
        items={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "IT Assets", path: "/it-assets/dashboard" },
        ]}
      />

      <AppPageHeader
        title="IT Asset Dashboard"
        subtitle="Power BI-style overview of school IT assets, assignments, issues, transfers, maintenance, and disposals."
      />

      <AppToolbar
        title="Asset Overview"
        actions={<AppButton onClick={refetch}>Refresh</AppButton>}
      />

      <Stack spacing={3}>
        <AppStatCards cards={cards} />

        <DashboardCharts charts={dashboard?.charts} />

        <DashboardTables dashboard={dashboard} />
      </Stack>
    </Box>
  );
};

export default ItAssetDashboard;