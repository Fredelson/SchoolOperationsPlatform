// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppEmptyState
// ============================================
//
// Purpose:
// Reusable empty state for tables, reports, and dashboards.
// ============================================

import { Box, Typography, Button } from "@mui/material";

export default function AppEmptyState({
  icon = null,
  title = "No records found",
  message = "There is no data to display right now.",
  actionLabel = "",
  onAction = null,
  sx = {},
}) {
  return (
    <Box
      sx={{
        py: 7,
        px: 3,
        textAlign: "center",
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px dashed",
        borderColor: "divider",
        ...sx,
      }}
    >
      {icon && <Box sx={{ mb: 2 }}>{icon}</Box>}

      <Typography variant="h6" fontWeight={800}>
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1, maxWidth: 420, mx: "auto" }}
      >
        {message}
      </Typography>

      {actionLabel && onAction && (
        <Button variant="contained" sx={{ mt: 3 }} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
