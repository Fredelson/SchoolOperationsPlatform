// ============================================
// ARAB UNITY SCHOOL
// Modules Overview Section
//
// Purpose:
// Displays all platform modules
// available in the system.
//
// Reusable:
// Yes
//
// Future Backend:
// GET /api/superadmin/modules
// ============================================

// ============================================
// Imports
// ============================================

import { Grid } from "@mui/material";

import DashboardCard from "./DashboardCard";
import ModuleCard from "./ModuleCard";

// ============================================
// Component
// ============================================

export default function ModulesOverview({ modules }) {
  return (
    <DashboardCard
      title="Platform Modules"
      subtitle="Manage and monitor all active system modules"
    >
      <Grid container spacing={2.5}>
        {modules.map((module) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={module.title}
          >
            <ModuleCard {...module} />
          </Grid>
        ))}
      </Grid>
    </DashboardCard>
  );
}

// ============================================
// End Component
// ============================================