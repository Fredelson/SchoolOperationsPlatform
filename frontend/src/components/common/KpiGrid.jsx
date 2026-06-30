// ============================================
// ARAB UNITY SCHOOL
// Reusable KPI Grid
// Used by Teacher, HOD, HOS, and Printing dashboards
// Supports stats + icons
// ============================================

import { Box } from "@mui/material";
import StatCard from "../common/StatCard";

export default function KPIGrid({ stats = [], icons = [] }) {
  return (
    <Box
      sx={{
        display: "grid",

        // Responsive layout
        // On extra-large screens, 7 KPI cards stay on one row
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
          xl:
            stats.length === 7
              ? "repeat(7, 1fr)"
              : stats.length === 6
              ? "repeat(6, 1fr)"
              : stats.length === 5
              ? "repeat(5, 1fr)"
              : "repeat(4, 1fr)",
        },

        gap: 3,
      }}
    >
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={icons[index]}
          color={stat.color}
        />
      ))}
    </Box>
  );
}
