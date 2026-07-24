import { Box, Stack, Typography } from "@mui/material";

import DashboardCard from "../../../components/dashboard/DashboardCard";
import ActivityItem from "../../../components/widgets/ActivityItem";
import { dashboardColors } from "../../../theme/dashboardColors";
import { DashboardChartCard } from "./DashboardCharts";

const formatActivityTime = (value) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("en-AE", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const RecentAssetActivity = ({ items = [] }) => {
  const activityItems = items.slice(0, 5);

  return (
    <DashboardCard
      title="Recent Activity"
      subtitle="Latest asset actions"
      sx={{ height: "100%" }}
    >
      {activityItems.length ? (
        <Box>
          {activityItems.map((item, index) => (
            <ActivityItem
              key={item.id || `${item.title}-${index}`}
              title={item.title || item.activityType || "Asset activity"}
              description={
                item.description ||
                [item.assetTag, item.performedByName].filter(Boolean).join(" · ") ||
                "Asset record updated"
              }
              time={formatActivityTime(item.createdAt)}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            height: 250,
            display: "grid",
            placeItems: "center",
            color: dashboardColors.textSecondary,
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
            No recent asset activity
          </Typography>
        </Box>
      )}
    </DashboardCard>
  );
};

const AttentionQueue = ({ kpis = {} }) => {
  const items = [
    {
      label: "Parts to order",
      value: kpis.partsToOrder || 0,
      color: dashboardColors.warning,
    },
    {
      label: "Under maintenance / repair",
      value: (kpis.underMaintenanceAssets || 0) + (kpis.underRepairAssets || 0),
      color: dashboardColors.warning,
    },
    {
      label: "Pending transfers",
      value: kpis.pendingTransfers || 0,
      color: dashboardColors.info,
    },
    {
      label: "Pending disposals",
      value: kpis.pendingDisposals || 0,
      color: dashboardColors.danger,
    },
  ];

  return (
    <DashboardCard
      title="Attention Queue"
      subtitle="Items requiring operational follow-up"
      sx={{ height: "100%" }}
    >
      <Stack>
        {items.map((item) => (
          <Box
            key={item.label}
            sx={{
              py: 1.15,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              borderBottom: `1px solid ${dashboardColors.border}`,
              "&:last-child": { borderBottom: "none" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: item.color,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: dashboardColors.textPrimary,
                }}
              >
                {item.label}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: "0.88rem",
                fontWeight: 900,
                color: item.color,
              }}
            >
              {Number(item.value).toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Stack>
    </DashboardCard>
  );
};

const PartsToOrder = ({ partsToOrder = [] }) => (
  <DashboardCard
    title="Parts To Order"
    subtitle="Replacement parts from asset returns"
    sx={{ height: "100%" }}
  >
    <Stack spacing={1.25}>
      {!partsToOrder.length ? (
        <Typography sx={{ fontSize: 13, color: dashboardColors.textSecondary }}>
          No parts to order
        </Typography>
      ) : (
        partsToOrder.map((part) => (
          <Box
            key={part.partKey}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 0.75,
              borderBottom: `1px solid ${dashboardColors.border}`,
              "&:last-child": { borderBottom: "none" },
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: dashboardColors.textPrimary }}>
                {part.partName || "Unknown part"}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: dashboardColors.textSecondary }}>
                {Number(part.assetCount || 0)} asset{Number(part.assetCount || 0) === 1 ? "" : "s"} affected
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 900, color: dashboardColors.warning }}>
              {Number(part.totalQuantity || 0).toLocaleString()}
            </Typography>
          </Box>
        ))
      )}
    </Stack>
  </DashboardCard>
);

export default function AssetDashboardOperationsRow({ dashboard = {} }) {
  return (
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
      <DashboardChartCard
        title="Assignment Overview"
        subtitle="Current custody distribution"
        data={dashboard.charts?.assignmentOverview}
      />
      <RecentAssetActivity items={dashboard.recentActivity} />
      <AttentionQueue kpis={dashboard.kpis} />
      <PartsToOrder partsToOrder={dashboard.partsToOrder || []} />
    </Box>
  );
}
