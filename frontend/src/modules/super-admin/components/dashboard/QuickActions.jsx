// ============================================
// Super Admin Quick Actions
// ============================================

import { Grid, Button } from "@mui/material";
import DashboardCard from "./DashboardCard";

export default function QuickActions({ actions }) {
  return (
    <DashboardCard
      title="Quick Actions"
      subtitle="Common Super Admin actions"
    >
      <Grid container spacing={1.5}>
        {actions.map((action) => (
          <Grid item xs={12} sm={6} key={action}>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                py: 1.2,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 800,
                borderColor: "#cbd5e1",
                color: "#0f172a",
                justifyContent: "flex-start",
                "&:hover": {
                  borderColor: "#0f5132",
                  bgcolor: "#f0fdf4",
                },
              }}
            >
              {action}
            </Button>
          </Grid>
        ))}
      </Grid>
    </DashboardCard>
  );
}