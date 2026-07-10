// ============================================
// Asset Audit Panel
// Arab Unity School Operations Platform
// ============================================

import {
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const safeText = (value) => value || "—";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AssetAuditPanel = ({ auditLogs = [] }) => {
  if (!auditLogs.length) {
    return (
      <Paper elevation={0} sx={(theme) => ({
        p: 3,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
      })}>
        <Typography fontWeight={800}>No audit history found.</Typography>
        <Typography variant="body2" color="text.secondary">
          No recorded changes were found for this asset.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {auditLogs.map((log) => (
        <Paper
          key={log.AuditLogId}
          elevation={0}
          sx={(theme) => ({
            p: 2,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          })}
        >
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Stack>
                <Typography fontWeight={900}>
                  {safeText(log.ActionType)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {safeText(log.Description)}
                </Typography>
              </Stack>

              <Chip size="small" label="AUDIT" color="primary" />
            </Stack>

            <Divider />

            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <Typography variant="caption" color="text.secondary">
                Date: {formatDate(log.CreatedAt)}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                By: {safeText(log.PerformedByName)}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Employee Code: {safeText(log.PerformedByEmployeeCode)}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Role: {safeText(log.RoleDisplayName || log.RoleName)}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                IP: {safeText(log.IpAddress)}
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

export default AssetAuditPanel;