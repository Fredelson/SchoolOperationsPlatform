// ============================================
// IT Asset Dashboard Tables
// ============================================

import { Grid, Typography } from "@mui/material";
import { AppCard, AppDataTable, AppEmptyState } from "../../../platform/ui";

const withId = (rows = []) =>
  rows.map((row, index) => ({
    id: row.id || row.assetId || row.activityId || row.issueId || index + 1,
    ...row,
  }));

const tableCard = (title, rows, columns) => (
  <AppCard>
    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
      {title}
    </Typography>

    {!rows || rows.length === 0 ? (
      <AppEmptyState title="No records found" />
    ) : (
      <AppDataTable rows={withId(rows)} columns={columns} />
    )}
  </AppCard>
);

const activityColumns = [
  { field: "activityType", headerName: "Activity", flex: 1 },
  { field: "assetCode", headerName: "Asset Code", flex: 1 },
  { field: "description", headerName: "Description", flex: 2 },
  { field: "createdAt", headerName: "Date", flex: 1 },
];

const assignedColumns = [
  { field: "assetCode", headerName: "Asset Code", flex: 1 },
  { field: "assetName", headerName: "Asset Name", flex: 1.5 },
  { field: "assignedToName", headerName: "Assigned To", flex: 1.5 },
  { field: "assignedAt", headerName: "Assigned Date", flex: 1 },
];

const issueColumns = [
  { field: "assetCode", headerName: "Asset Code", flex: 1 },
  { field: "issueTitle", headerName: "Issue", flex: 2 },
  { field: "priority", headerName: "Priority", flex: 1 },
  { field: "statusName", headerName: "Status", flex: 1 },
];

const transferColumns = [
  { field: "assetCode", headerName: "Asset Code", flex: 1 },
  { field: "fromLocationName", headerName: "From", flex: 1 },
  { field: "toLocationName", headerName: "To", flex: 1 },
  { field: "statusName", headerName: "Status", flex: 1 },
];

const disposalColumns = [
  { field: "assetCode", headerName: "Asset Code", flex: 1 },
  { field: "assetName", headerName: "Asset Name", flex: 1.5 },
  { field: "reason", headerName: "Reason", flex: 2 },
  { field: "statusName", headerName: "Status", flex: 1 },
];

const DashboardTables = ({ dashboard = {} }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {tableCard("Recent Activity", dashboard.recentActivity, activityColumns)}
      </Grid>

      <Grid item xs={12} md={6}>
        {tableCard(
          "Recently Assigned Assets",
          dashboard.recentlyAssignedAssets,
          assignedColumns
        )}
      </Grid>

      <Grid item xs={12} md={6}>
        {tableCard("Open Issues", dashboard.openIssues, issueColumns)}
      </Grid>

      <Grid item xs={12} md={6}>
        {tableCard("Pending Transfers", dashboard.pendingTransfers, transferColumns)}
      </Grid>

      <Grid item xs={12} md={6}>
        {tableCard("Pending Disposals", dashboard.pendingDisposals, disposalColumns)}
      </Grid>
    </Grid>
  );
};

export default DashboardTables;