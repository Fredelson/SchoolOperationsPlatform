// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppChip
// ============================================
//
// Purpose:
// Reusable status chip for roles, modules,
// tickets, requests, approvals, and inventory.
// ============================================

import { Chip, alpha, useTheme } from "@mui/material";

// ============================================
// Status Color Helper
// ============================================

const getStatusColor = (theme, status) => {
  const value = String(status || "").toLowerCase();

  if (value.includes("active") || value.includes("approved") || value.includes("healthy")) {
    return theme.palette.success.main;
  }

  if (value.includes("pending") || value.includes("warning") || value.includes("progress")) {
    return theme.palette.warning.main;
  }

  if (value.includes("rejected") || value.includes("inactive") || value.includes("error")) {
    return theme.palette.error.main;
  }

  return theme.palette.primary.main;
};

// ============================================
// Component
// ============================================

export default function AppChip({ label, status, sx = {}, ...props }) {
  const theme = useTheme();
  const color = getStatusColor(theme, status || label);

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 800,
        borderRadius: 2,
        color,
        bgcolor: alpha(color, 0.12),
        border: `1px solid ${alpha(color, 0.22)}`,
        ...sx,
      }}
      {...props}
    />
  );
}
