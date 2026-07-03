/* =========================================================
   Feature Flag Stats Cards
   Purpose:
   Displays quick summary cards for Feature Flag Manager.
========================================================= */

import AppStatCards from "@platform/ui/AppStatCards";

const FeatureFlagStatsCards = ({ featureFlags = [], pagination = {} }) => {
  const enabledCount = featureFlags.filter((item) => item.IsEnabled).length;
  const disabledCount = featureFlags.filter((item) => !item.IsEnabled).length;

  const stats = [
    {
      label: "Total Feature Flags",
      value: pagination.total ?? featureFlags.length,
    },
    {
      label: "Enabled",
      value: enabledCount,
    },
    {
      label: "Disabled",
      value: disabledCount,
    },
    {
      label: "Current Page",
      value: featureFlags.length,
    },
  ];

  return <AppStatCards stats={stats} />;
};

export default FeatureFlagStatsCards;