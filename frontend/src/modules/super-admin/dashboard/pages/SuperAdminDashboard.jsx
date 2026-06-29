// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Super Admin Dashboard
// ============================================
//
// Purpose:
// Main dashboard for Super Admin using the
// reusable platform UI foundation.
// ============================================

import { Grid, Stack } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import AppsIcon from "@mui/icons-material/Apps";

import {
  AppBreadcrumbs,
  AppPageHeader,
  AppStatCard,
  AppSection,
  AppDataTable,
  AppChip,
} from "@ui";

export default function SuperAdminDashboard() {
  const columns = [
    { field: "module", headerName: "Module" },
    {
      field: "status",
      headerName: "Status",
      render: (row) => <AppChip label={row.status} status={row.status} />,
    },
    { field: "owner", headerName: "Owner" },
  ];

  const rows = [
    { id: 1, module: "Platform Foundation", status: "Healthy", owner: "IT Department" },
    { id: 2, module: "Printing", status: "Active", owner: "Printing Admin" },
    { id: 3, module: "IT Asset Management", status: "In Progress", owner: "IT Department" },
  ];

  return (
    <>
      <AppBreadcrumbs
        items={[
          { label: "Dashboard" },
        ]}
      />

      <AppPageHeader
        title="Super Admin Dashboard"
        subtitle="Platform overview, system health, modules, permissions, and operational controls."
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <AppStatCard title="Users" value="70" icon={<PeopleIcon />} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AppStatCard title="Modules" value="8" icon={<AppsIcon />} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AppStatCard title="Security" value="Healthy" icon={<SecurityIcon />} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AppStatCard title="Platform" value="Online" icon={<DashboardIcon />} />
        </Grid>
      </Grid>

      <Stack spacing={3}>
        <AppSection
          title="Module Status"
          subtitle="Current operational status of enabled platform modules."
        >
          <AppDataTable columns={columns} rows={rows} />
        </AppSection>
      </Stack>
    </>
  );
}
