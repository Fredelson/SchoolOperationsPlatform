// ============================================
// IT Asset Dashboard Charts
// ============================================

import { Box, Grid, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { AppCard, AppEmptyState } from "../../../platform/ui";

const COLORS = ["#0B5D3B", "#1976D2", "#F57C00", "#7B1FA2", "#C62828", "#455A64"];

const normalizeChartData = (items = []) => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    name:
      item.name ||
      item.label ||
      item.categoryName ||
      item.statusName ||
      item.locationName ||
      "Unknown",
    value: Number(item.value || item.count || item.total || 0),
  }));
};

const PieChartCard = ({ title, data }) => {
  const chartData = normalizeChartData(data);

  return (
    <AppCard>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        {title}
      </Typography>

      {chartData.length === 0 ? (
        <AppEmptyState title="No chart data available" />
      ) : (
        <Box sx={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={95} label>
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </AppCard>
  );
};

const BarChartCard = ({ title, data }) => {
  const chartData = normalizeChartData(data);

  return (
    <AppCard>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        {title}
      </Typography>

      {chartData.length === 0 ? (
        <AppEmptyState title="No chart data available" />
      ) : (
        <Box sx={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </AppCard>
  );
};

const DashboardCharts = ({ charts = {} }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <PieChartCard title="Assets by Category" data={charts.assetsByCategory} />
      </Grid>

      <Grid item xs={12} md={4}>
        <PieChartCard title="Assets by Status" data={charts.assetsByStatus} />
      </Grid>

      <Grid item xs={12} md={4}>
        <BarChartCard title="Assets by Location" data={charts.assetsByLocation} />
      </Grid>
    </Grid>
  );
};

export default DashboardCharts;