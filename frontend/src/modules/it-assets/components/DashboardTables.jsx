import { Box, Grid, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";

import { usePermissions } from "../../../context/PermissionContext";
import {
  DashboardBottomRow,
  DashboardMiddleRow,
  DashboardSection,
} from "../../../components/layout";
import {
  AppButton,
  AppCard,
  AppChip,
  AppDataTable,
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

const partsToOrderColumns = [
  { field: "partName", headerName: "Part" },
  { field: "totalQuantity", headerName: "Quantity Required", align: "right" },
  { field: "assetCount", headerName: "Affected Assets", align: "right" },
];

const QuickActions = () => {
  const navigate = useNavigate();
  const { hasActionAccess } = usePermissions();

  const actions = [
    { label: "Asset Explorer", icon: <Inventory2OutlinedIcon />, path: "/it-assets/assets", permission: "View" },
    { label: "Assign Asset", icon: <AssignmentIndOutlinedIcon />, path: "/it-assets/assignments", permission: "Assign" },
    { label: "Transfer Asset", icon: <SwapHorizOutlinedIcon />, path: "/it-assets/transfers", permission: "Transfer" },
    { label: "Issues", icon: <BuildOutlinedIcon />, path: "/it-assets/issues", permission: "ViewIssues" },
    { label: "Rectangular Asset Tag Printer", icon: <LocalPrintshopOutlinedIcon />, path: "/it-assets/asset-tag-printer", permission: "PrintRectangularTags" },
    { label: "Rounded Asset Tag Printer", icon: <LocalPrintshopOutlinedIcon />, path: "/it-assets/rounded-asset-tag-printer", permission: "PrintRoundedTags" },
    { label: "Maintenance", icon: <BuildOutlinedIcon />, path: "/it-assets/maintenance", permission: "Maintenance" },
    { label: "Disposal", icon: <DeleteOutlineOutlinedIcon />, path: "/it-assets/disposals", permission: "Disposal" },
    { label: "Reports", icon: <SummarizeOutlinedIcon />, path: "/it-assets/reports", permission: "Reports" },
    { label: "Import Assets", icon: <FileUploadOutlinedIcon />, path: "/it-assets/assets", permission: "Import" },
  ].filter((action) => hasActionAccess("ITAssets", action.permission));

  return (
    <Grid container spacing={1.25}>
      {actions.map((action) => (
        <Grid key={action.label} size={{ xs: 12, sm: 6 }}>
          <AppButton
            fullWidth
            variant="outlined"
            startIcon={action.icon}
            onClick={() => navigate(action.path)}
            sx={{ justifyContent: "flex-start" }}
          >
            {action.label}
          </AppButton>
        </Grid>
      ))}
    </Grid>
  );
};

const DashboardTables = ({ dashboard = {} }) => {
  const maintenance = dashboard.operations?.maintenance || [];

  return (
    <Stack spacing={2}>
      <DashboardMiddleRow columns="1.45fr 1fr 1fr">
        <DashboardSection
          title="Parts To Order"
          subtitle="Replacement parts recorded from computer returns marked Need Parts."
        >
          <AppDataTable
            rows={dashboard.partsToOrder || []}
            columns={partsToOrderColumns}
            getRowId={(row) => row.partKey}
            emptyTitle="No parts to order"
            emptyMessage="No active replacement-part requirements have been recorded."
          />
        </DashboardSection>

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
        <Box>
          <AppCard sx={{ height: "100%" }}>
            <PanelTitle>Quick Actions</PanelTitle>
            <QuickActions />
          </AppCard>
        </Box>
      </DashboardBottomRow>
    </Stack>
  );
};

export default DashboardTables;
