// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget Status Chip
// ============================================

import AppChip from "@platform/ui/AppChip";

export default function WidgetStatusChip({ status }) {
  const value = String(status || "").toLowerCase();

  if (value.includes("visible")) {
    return <AppChip label="Visible" color="success" size="small" />;
  }

  if (value.includes("hidden")) {
    return <AppChip label="Hidden" color="default" size="small" />;
  }

  return <AppChip label={status || "Unknown"} color="default" size="small" />;
}