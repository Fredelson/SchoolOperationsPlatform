// ============================================
// Asset Timeline Panel
// Arab Unity School Operations Platform
// ============================================

import {
  Box,
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

const getGroupColor = (group = "") => {
  const value = String(group).toUpperCase();

  if (value.includes("ASSIGNMENT")) return "primary";
  if (value.includes("TRANSFER")) return "info";
  if (value.includes("MAINTENANCE")) return "warning";
  if (value.includes("DISPOSAL")) return "error";
  if (value.includes("STATUS")) return "success";
  if (value.includes("ISSUE")) return "error";
  if (value.includes("NOTE")) return "default";

  return "default";
};

const TimelineMeta = ({ label, value }) => (
  <Typography variant="caption" color="text.secondary">
    <strong>{label}:</strong> {safeText(value)}
  </Typography>
);

const AssetTimelinePanel = ({ timeline = [] }) => {
  if (!timeline.length) {
    return (
      <Paper
        elevation={0}
        sx={(theme) => ({
          p: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Typography fontWeight={800}>No timeline events found.</Typography>
        <Typography variant="body2" color="text.secondary">
          This asset has no recorded lifecycle activity yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {timeline.map((event, index) => (
        <Paper
          key={`${event.eventType}-${event.referenceId}-${index}`}
          elevation={0}
          sx={(theme) => ({
            p: 2.5,
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
          })}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
              sx={(theme) => ({
                width: 12,
                height: 12,
                borderRadius: "50%",
                mt: 0.8,
                bgcolor: theme.palette.primary.main,
                flexShrink: 0,
              })}
            />

            <Stack spacing={1.25} sx={{ width: "100%" }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={1}
              >
                <Stack spacing={0.4}>
                  <Typography fontWeight={900}>
                    {safeText(event.title)}
                  </Typography>

                  <Typography variant="body2">
                    {safeText(event.description)}
                  </Typography>
                </Stack>

                <Chip
                  size="small"
                  label={event.eventGroup || "EVENT"}
                  color={getGroupColor(event.eventGroup)}
                  sx={{ fontWeight: 800 }}
                />
              </Stack>

              <Divider />

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={{ xs: 0.5, md: 3 }}
                flexWrap="wrap"
              >
                <TimelineMeta label="Date" value={formatDate(event.eventDate)} />
                <TimelineMeta label="By" value={event.performedBy} />

                {event.notes && (
                  <TimelineMeta label="Notes" value={event.notes} />
                )}
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

export default AssetTimelinePanel;