import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const monthlyUsageData = [
  { month: "Jan", pages: 12000, sheets: 9000 },
  { month: "Feb", pages: 14500, sheets: 11000 },
  { month: "Mar", pages: 16500, sheets: 13000 },
  { month: "Apr", pages: 19000, sheets: 15500 },
  { month: "May", pages: 21000, sheets: 17000 },
  { month: "Jun", pages: 28000, sheets: 22000 },
];

export default function MonthlyUsageChart() {
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        height: "100%",
        minWidth: 0,
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={3}>
          Monthly Usage
        </Typography>

        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            height: 320,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyUsageData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Bar
                dataKey="pages"
                name="Pages"
                fill="#2563EB"
                radius={[8, 8, 0, 0]}
              />

              <Bar
                dataKey="sheets"
                name="Sheets"
                fill="#8B5CF6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}