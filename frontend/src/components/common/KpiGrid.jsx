import { Grid } from "@mui/material";
import StatCard from "./StatCard";

export default function KpiGrid({ items }) {
  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item.title}>
          <StatCard
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
          />
        </Grid>
      ))}
    </Grid>
  );
}