// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// App Stat Cards
// ============================================

import { Grid } from "@mui/material";

import AppStatCard from "./AppStatCard";

export default function AppStatCards({ items = [], spacing = 2 }) {
  return (
    <Grid container spacing={spacing}>
      {items.map((item, index) => (
        <Grid
          key={item.key || item.title || index}
          size={{
            xs: 12,
            sm: 6,
            md: item.md || 3,
          }}
        >
          <AppStatCard
            title={item.title}
            value={item.value}
            helperText={item.helperText}
            icon={item.icon}
            color={item.color}
          />
        </Grid>
      ))}
    </Grid>
  );
}
