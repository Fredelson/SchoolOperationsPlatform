import { Box, Grid, Stack, Typography } from "@mui/material";

import {
  DashboardBottomRow,
  DashboardMiddleRow,
} from "../../../components/layout";
import {
  AppCard,
  AppChip,
  AppEmptyState,
} from "../../../platform/ui";
import { DashboardChartCard } from "./DashboardCharts";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(value)
      )
    : "Not recorded";

const PanelTitle = ({ children, helper }) => (
  <Stack spacing={0.25} sx={{ mb: 2 }}>
    <Typography variant="subtitle1" fontWeight={900}>
      {children}
    </Typography>
    {helper && (
      <Typography variant="caption" color="text.secondary">
        {helper}
      </Typography>
    )}
  </Stack>
);

const SummaryList = ({ rows = [], emptyTitle }) => (
  <Stack spacing={1.25}>
    {!rows.length ? (
      <AppEmptyState title={emptyTitle} />
    ) : (
      rows.map((row) => (
        <Stack
          key={row.name}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{ py: 1, borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="body2" fontWeight={700}>
            {row.name || "Unknown"}
          </Typography>
          <AppChip label={Number(row.value || 0).toLocaleString()} status={row.name} />
        </Stack>
      ))
    )}
  </Stack>
);

const DashboardTables = ({ dashboard = {} }) => {
  const maintenance = dashboard.operations?.maintenance || [];

  return (
    <Stack spacing={2}>
      <DashboardMiddleRow columns="1.45fr 1fr 1fr">
        <Box>
          <AppCard sx={{ height: "100%" }}>
            <PanelTitle>Recent Activity</PanelTitle>
            {!dashboard.recentActivity?.length ? (
              <AppEmptyState title="No recent activity" />
            ) : (
              <Stack spacing={1.25}>
                {dashboard.recentActivity.slice(0, 8).map((item) => (
                  <Stack
                    key={item.id}
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ pb: 1.25, borderBottom: "1px solid", borderColor: "divider" }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={800}>
                        {item.title || item.activityType}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.description || item.assetTag || "Asset activity"}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {formatDate(item.createdAt)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </AppCard>
        </Box>

        <Box>
          <AppCard sx={{ height: "100%" }}>
            <PanelTitle>Maintenance Summary</PanelTitle>
            {!maintenance.length ? (
              <AppEmptyState title="No assets under maintenance" />
            ) : (
              <Stack spacing={1.25}>
                {maintenance.map((item) => (
                  <Stack key={item.assetId} direction="row" justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="body2" fontWeight={800}>
                        {item.assetTag} · {item.assetName || "Asset"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.locationName || "Location not recorded"}
                      </Typography>
                    </Box>
                    <AppChip label={item.maintenanceType || item.statusName} status={item.statusName} />
                  </Stack>
                ))}
              </Stack>
            )}
          </AppCard>
        </Box>

        <Box>
          <AppCard sx={{ height: "100%" }}>
            <PanelTitle>Parts To Order</PanelTitle>
            <Stack spacing={1.25}>
              {!dashboard.partsToOrder?.length ? (
                <AppEmptyState title="No parts to order" />
              ) : (
                dashboard.partsToOrder.map((part) => (
                  <Stack
                    key={part.partKey}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ py: 0.75, borderBottom: "1px solid", borderColor: "divider" }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {part.partName || "Unknown part"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Number(part.assetCount || 0)} asset{Number(part.assetCount || 0) === 1 ? "" : "s"} affected
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={900} color="warning.main">
                      {Number(part.totalQuantity || 0).toLocaleString()}
                    </Typography>
                  </Stack>
                ))
              )}
            </Stack>
          </AppCard>
        </Box>
      </DashboardMiddleRow>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <AppCard sx={{ height: "100%" }}>
            <PanelTitle helper="Latest assignment records matching the active dashboard filters.">
              Recent Assignments
            </PanelTitle>
            {!dashboard.recentAssignments?.length ? (
              <AppEmptyState title="No recent assignments" />
            ) : (
              <Stack spacing={1.25}>
                {dashboard.recentAssignments.map((item) => (
                  <Stack key={item.id} direction="row" justifyContent="space-between" spacing={2}
                    sx={{ pb: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={800}>
                        {item.assetTag} assigned to {item.assignedToName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.returnedAt ? "Returned" : "Current assignment"}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {formatDate(item.assignedAt)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </AppCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <AppCard sx={{ height: "100%" }}>
            <PanelTitle helper="Latest transfer workflow records matching the active filters.">
              Recent Transfers
            </PanelTitle>
            {!dashboard.recentTransfers?.length ? (
              <AppEmptyState title="No recent transfers" />
            ) : (
              <Stack spacing={1.25}>
                {dashboard.recentTransfers.map((item) => (
                  <Stack key={item.id} direction="row" justifyContent="space-between" spacing={2}
                    sx={{ pb: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={800}>
                        {item.assetTag} transferred to {item.destinationName}
                      </Typography>
                      <AppChip label={item.status || "Pending"} status={item.status} />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {formatDate(item.completedAt || item.requestedAt)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </AppCard>
        </Grid>
      </Grid>

      <DashboardBottomRow columns="repeat(4, minmax(0, 1fr))">
        <DashboardChartCard
          title="Assignment Overview"
          data={dashboard.charts?.assignmentOverview}
        />
        <Box>
          <AppCard sx={{ height: "100%" }}>
            <PanelTitle>Transfer Summary</PanelTitle>
            <SummaryList rows={dashboard.operations?.transfers} emptyTitle="No transfers recorded" />
          </AppCard>
        </Box>
        <Box>
          <AppCard sx={{ height: "100%" }}>
            <PanelTitle>Disposal Summary</PanelTitle>
            <SummaryList rows={dashboard.operations?.disposals} emptyTitle="No disposals recorded" />
          </AppCard>
        </Box>
      </DashboardBottomRow>
    </Stack>
  );
};

export default DashboardTables;
