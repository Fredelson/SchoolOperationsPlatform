import { Box, LinearProgress, Typography } from "@mui/material";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import DashboardCard from "../../../components/dashboard/DashboardCard";
import { dashboardColors } from "../../../theme/dashboardColors";

const CHART_COLORS = [
  dashboardColors.assets,
  dashboardColors.info,
  dashboardColors.success,
  dashboardColors.warning,
  dashboardColors.tickets,
  dashboardColors.danger,
];

const normalizeChartData = (items = [], maxItems = 5) => {
  const normalized = (Array.isArray(items) ? items : [])
    .map((item) => ({
      id: item.id || item.key || item.name || item.label || "unknown",
      name: item.name || item.label || "Unknown",
      value: Number(item.value || item.count || item.total || 0),
    }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value);

  if (!maxItems || normalized.length <= maxItems) return normalized;

  const visible = normalized.slice(0, maxItems - 1);
  const otherValue = normalized
    .slice(maxItems - 1)
    .reduce((total, item) => total + item.value, 0);
  const groupedLabel = visible.some(
    (item) => item.name.toLowerCase() === "other"
  )
    ? "Remaining"
    : "Other";

  return [...visible, { id: "grouped-other", name: groupedLabel, value: otherValue }];
};

const EmptyChart = () => (
  <Box
    sx={{
      height: 250,
      display: "grid",
      placeItems: "center",
      color: dashboardColors.textSecondary,
    }}
  >
    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
      No dashboard data available
    </Typography>
  </Box>
);

const CompactLegend = ({ data, total }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.9 }}>
    {data.map((item, index) => (
      <Box
        key={item.name}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          minWidth: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: CHART_COLORS[index % CHART_COLORS.length],
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: dashboardColors.textPrimary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.name}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: "0.76rem",
            fontWeight: 800,
            color: dashboardColors.textSecondary,
            whiteSpace: "nowrap",
          }}
        >
          {item.value.toLocaleString()} (
          {total > 0 ? Math.round((item.value / total) * 100) : 0}%)
        </Typography>
      </Box>
    ))}
  </Box>
);

const ProgressChart = ({ data }) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <Box sx={{ height: 250, display: "flex", flexDirection: "column", gap: 1.5 }}>
      {data.map((item, index) => (
        <Box key={item.name}>
          <Box
            sx={{
              mb: 0.55,
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography
              sx={{
                minWidth: 0,
                fontSize: "0.78rem",
                fontWeight: 700,
                color: dashboardColors.textPrimary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.name}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 900,
                color: dashboardColors.textPrimary,
              }}
            >
              {item.value.toLocaleString()}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(item.value / maxValue) * 100}
            sx={{
              height: 8,
              borderRadius: 99,
              bgcolor: dashboardColors.border,
              "& .MuiLinearProgress-bar": {
                borderRadius: 99,
                bgcolor: CHART_COLORS[index % CHART_COLORS.length],
              },
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

const RankedDistribution = ({ data, total }) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <Box
      sx={{
        maxHeight: 360,
        overflowY: "auto",
        pr: 0.75,
        scrollbarWidth: "thin",
        scrollbarColor: `${dashboardColors.neutral} transparent`,
        "&::-webkit-scrollbar": { width: 6 },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: dashboardColors.neutral,
          borderRadius: 1,
        },
      }}
    >
      {data.map((item, index) => (
        <Box
          key={`${item.id}-${index}`}
          sx={{
            py: 1.15,
            borderBottom: `1px solid ${dashboardColors.border}`,
            "&:first-of-type": { pt: 0.25 },
            "&:last-child": { borderBottom: "none", pb: 0.25 },
          }}
        >
          <Box
            sx={{
              mb: 0.65,
              display: "grid",
              gridTemplateColumns: "28px minmax(0, 1fr) auto",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                display: "grid",
                placeItems: "center",
                borderRadius: 1.5,
                bgcolor: index === 0
                  ? dashboardColors.assetsLight
                  : dashboardColors.background,
                color: index === 0
                  ? dashboardColors.assets
                  : dashboardColors.textSecondary,
                fontSize: "0.72rem",
                fontWeight: 900,
                border: `1px solid ${dashboardColors.border}`,
              }}
            >
              {index + 1}
            </Box>
            <Typography
              sx={{
                minWidth: 0,
                fontSize: "0.8rem",
                lineHeight: 1.25,
                fontWeight: 800,
                color: dashboardColors.textPrimary,
                overflowWrap: "anywhere",
              }}
            >
              {item.name}
            </Typography>
            <Box sx={{ textAlign: "right", pl: 1 }}>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: dashboardColors.textPrimary,
                }}
              >
                {item.value.toLocaleString()}
              </Typography>
              <Typography
                sx={{
                  mt: 0.2,
                  fontSize: "0.68rem",
                  lineHeight: 1,
                  fontWeight: 700,
                  color: dashboardColors.textSecondary,
                }}
              >
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </Typography>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(item.value / maxValue) * 100}
            sx={{
              ml: 4.5,
              height: 5,
              borderRadius: 1,
              bgcolor: dashboardColors.border,
              "& .MuiLinearProgress-bar": {
                borderRadius: 1,
                bgcolor: CHART_COLORS[index % CHART_COLORS.length],
              },
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

export const DashboardChartCard = ({
  title,
  subtitle,
  data,
  type = "pie",
  maxItems = 5,
  itemLabel = "items",
}) => {
  const chartData = normalizeChartData(data, maxItems);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      action={
        type === "ranked" && chartData.length ? (
          <Typography
            sx={{
              flexShrink: 0,
              fontSize: "0.75rem",
              fontWeight: 800,
              color: dashboardColors.textSecondary,
            }}
          >
            {chartData.length.toLocaleString()} {itemLabel}
          </Typography>
        ) : null
      }
      sx={{ height: "100%" }}
    >
      {!chartData.length ? (
        <EmptyChart />
      ) : type === "ranked" ? (
        <RankedDistribution data={chartData} total={total} />
      ) : type === "bar" ? (
        <ProgressChart data={chartData} />
      ) : (
        <Box sx={{ height: 250, display: "flex", flexDirection: "column" }}>
          <Box sx={{ height: 135, position: "relative", mb: 1.5 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={58}
                  paddingAngle={3}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => Number(value).toLocaleString()}
                  contentStyle={{
                    borderRadius: 10,
                    border: `1px solid ${dashboardColors.border}`,
                    boxShadow: `0 10px 24px ${dashboardColors.shadow}`,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                pointerEvents: "none",
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.45rem",
                  fontWeight: 900,
                  color: dashboardColors.textPrimary,
                  lineHeight: 1,
                }}
              >
                {total.toLocaleString()}
              </Typography>
              <Typography
                sx={{
                  mt: 0.2,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: dashboardColors.textSecondary,
                }}
              >
                Total
              </Typography>
            </Box>
          </Box>

          <CompactLegend data={chartData} total={total} />
        </Box>
      )}
    </DashboardCard>
  );
};

const DashboardCharts = ({ charts = {} }) => (
  <Box
    sx={{
      mt: 1,
      mb: 1,
      display: "grid",
      gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
      gap: 1,
      alignItems: "stretch",
    }}
  >
    <Box sx={{ gridColumn: { xs: "span 12", lg: "span 6" }, minWidth: 0 }}>
      <DashboardChartCard
        title="Assets by Category"
        subtitle="Complete inventory breakdown"
        data={charts.assetsByCategory}
        type="ranked"
        maxItems={null}
        itemLabel="categories"
      />
    </Box>
    <Box sx={{ gridColumn: { xs: "span 12", lg: "span 6" }, minWidth: 0 }}>
      <DashboardChartCard
        title="Assets by Location"
        subtitle="Complete physical distribution"
        data={charts.assetsByLocation}
        type="ranked"
        maxItems={null}
        itemLabel="locations"
      />
    </Box>
    <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" }, minWidth: 0 }}>
      <DashboardChartCard
        title="Assets by Status"
        subtitle="Current lifecycle state"
        data={charts.assetsByStatus}
      />
    </Box>
    <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" }, minWidth: 0 }}>
      <DashboardChartCard
        title="Assets by Condition"
        subtitle="Recorded asset condition"
        data={charts.assetsByCondition}
      />
    </Box>
  </Box>
);

export default DashboardCharts;
