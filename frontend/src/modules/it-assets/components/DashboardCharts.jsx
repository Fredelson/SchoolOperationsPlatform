import { Box, Grid, Typography, alpha, useTheme } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppCard, AppEmptyState } from "../../../platform/ui";

const normalizeChartData = (items = []) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    name: item.name || item.label || "Unknown",
    value: Number(item.value || item.count || item.total || 0),
  }));

const useChartColors = () => {
  const theme = useTheme();
  const platform = theme.palette.platform || {};

  return [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    platform.accent || theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    theme.palette.success.dark,
    theme.palette.primary.light,
  ];
};

export const DashboardChartCard = ({ title, data, type = "pie" }) => {
  const theme = useTheme();
  const colors = useChartColors();
  const chartData = normalizeChartData(data);

  return (
    <AppCard sx={{ height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 2 }}>
        {title}
      </Typography>

      {!chartData.length ? (
        <AppEmptyState title="No chart data available" />
      ) : (
        <Box sx={{ height: 280, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid
                  stroke={alpha(theme.palette.text.secondary, 0.16)}
                  strokeDasharray="3 3"
                />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill={colors[0]} radius={[0, 6, 6, 0]} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </Box>
      )}
    </AppCard>
  );
};

const DashboardCharts = ({ charts = {} }) => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 6, xl: 3 }}>
      <DashboardChartCard title="Assets by Category" data={charts.assetsByCategory} />
    </Grid>
    <Grid size={{ xs: 12, md: 6, xl: 3 }}>
      <DashboardChartCard title="Assets by Status" data={charts.assetsByStatus} />
    </Grid>
    <Grid size={{ xs: 12, md: 6, xl: 3 }}>
      <DashboardChartCard title="Assets by Condition" data={charts.assetsByCondition} />
    </Grid>
    <Grid size={{ xs: 12, md: 6, xl: 3 }}>
      <DashboardChartCard title="Assets by Location" data={charts.assetsByLocation} type="bar" />
    </Grid>
  </Grid>
);

export default DashboardCharts;
