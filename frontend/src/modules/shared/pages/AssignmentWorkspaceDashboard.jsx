import { Alert, Chip, Grid, Stack, Typography } from "@mui/material";
import { AppPageHeader, AppSection, AppStatCard } from "../../../platform/ui";
import { useAuth } from "../../../context/AuthContext";

export default function AssignmentWorkspaceDashboard({ title, subtitle }) {
  const { user } = useAuth();
  const assignments = user?.assignments || [];
  const primary = user?.primaryAssignment;
  const scopes = user?.scopes || [];

  return <Stack spacing={3}>
    <AppPageHeader title={title} subtitle={subtitle} />
    {!primary && <Alert severity="warning">No active primary assignment is available for this workspace.</Alert>}
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}><AppStatCard title="Primary responsibility" value={primary?.assignmentName || "Not configured"} /></Grid>
      <Grid item xs={12} sm={4}><AppStatCard title="Active assignments" value={assignments.length} /></Grid>
      <Grid item xs={12} sm={4}><AppStatCard title="Organizational scopes" value={scopes.length} /></Grid>
    </Grid>
    <AppSection title="My organizational scope" subtitle="Data access is enforced by the backend assignment context.">
      <Stack direction="row" gap={1} flexWrap="wrap">
        {scopes.map((scope) => <Chip key={`${scope.userAssignmentId}-${scope.scopeType}-${scope.scopeEntityId}`} label={`${scope.scopeType}: ${scope.scopeName || scope.scopeEntityId}`} />)}
        {!scopes.length && <Typography color="text.secondary">No organizational scopes configured.</Typography>}
      </Stack>
    </AppSection>
  </Stack>;
}
