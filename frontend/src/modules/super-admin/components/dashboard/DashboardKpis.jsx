// DashboardKpis.jsx

import { Box } from "@mui/material";
import StatCard from "./StatCard";

export default function DashboardKpis({ stats = [] }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
          xl: "repeat(6, minmax(0, 1fr))",
        },
        gap: 0.5,
        mb: 0.75,
      }}
    >
      {stats.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </Box>
  );
}