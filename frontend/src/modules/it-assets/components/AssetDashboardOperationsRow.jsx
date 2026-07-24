import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

import DashboardCard from "../../../components/dashboard/DashboardCard";
import ActivityItem from "../../../components/widgets/ActivityItem";
import { dashboardColors } from "../../../theme/dashboardColors";
import { usePermissions } from "../../../context/PermissionContext";
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
      label: "Open issues",
      value: kpis.openIssues || kpis.itemsRequiringAttention || 0,
      color: dashboardColors.danger,
    },
    {
      label: "Parts to order",
      value: kpis.partsToOrder || 0,
      color: dashboardColors.warning,
    },
    {
      label: "Under maintenance",
      value: kpis.underMaintenanceAssets || 0,
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

const QuickActions = () => {
  const navigate = useNavigate();
  const { hasActionAccess, loading } = usePermissions();

  const actions = [
    {
      label: "Asset Explorer",
      icon: <Inventory2OutlinedIcon />,
      path: "/it-assets/assets",
      permission: "View",
    },
    {
      label: "Assign Asset",
      icon: <AssignmentIndOutlinedIcon />,
      path: "/it-assets/assignments",
      permission: "Assign",
    },
    {
      label: "Transfer Asset",
      icon: <SwapHorizOutlinedIcon />,
      path: "/it-assets/transfers",
      permission: "Transfer",
    },
    {
      label: "Asset Issues",
      icon: <WarningAmberOutlinedIcon />,
      path: "/it-assets/issues",
      permission: "ViewIssues",
    },
    {
      label: "Maintenance",
      icon: <BuildOutlinedIcon />,
      path: "/it-assets/maintenance",
      permission: "Maintenance",
    },
    {
      label: "Reports",
      icon: <SummarizeOutlinedIcon />,
      path: "/it-assets/reports",
      permission: "Reports",
    },
  ];

  const visibleActions = loading
    ? actions
    : actions.filter((action) =>
        hasActionAccess("ITAssets", action.permission)
      );

  return (
    <DashboardCard
      title="Quick Actions"
      subtitle="Common asset workflows"
      sx={{ height: "100%" }}
    >
      {visibleActions.length ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1,
          }}
        >
          {visibleActions.map((action) => (
            <Button
              key={action.label}
              variant="outlined"
              startIcon={action.icon}
              onClick={() => navigate(action.path)}
              sx={{
                minHeight: 48,
                px: 1.25,
                justifyContent: "flex-start",
                borderRadius: 2,
                textTransform: "none",
                fontSize: "0.76rem",
                fontWeight: 800,
                color: dashboardColors.textPrimary,
                borderColor: dashboardColors.border,
                bgcolor: dashboardColors.cardBackground,
                whiteSpace: "nowrap",
                overflow: "hidden",
                "& .MuiButton-startIcon": {
                  color: dashboardColors.assets,
                  flexShrink: 0,
                },
                "&:hover": {
                  borderColor: dashboardColors.assets,
                  bgcolor: dashboardColors.assetsLight,
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {action.label}
              </Box>
            </Button>
          ))}
        </Box>
      ) : (
        <Typography sx={{ fontSize: 13, color: dashboardColors.textSecondary }}>
          No asset actions are available for this workspace.
        </Typography>
      )}
    </DashboardCard>
  );
};

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
      <QuickActions />
    </Box>
  );
}
