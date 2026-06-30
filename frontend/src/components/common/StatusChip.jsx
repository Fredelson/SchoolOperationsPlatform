// ============================================
// ARAB UNITY SCHOOL
// Reusable Status Chip
//
// Purpose:
// Displays status consistently across
// all modules in the AUS Operations Platform.
//
// Reusable:
// - Teacher
// - HOD
// - HOS
// - Printing Admin
// - Admin
// - Super Admin
// ============================================

import Chip from "@mui/material/Chip";
import { dashboardColors } from "../../theme/dashboardColors";
// ============================================
// Status Style Mapping
// ============================================

const getStatusStyles = (status = "") => {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case "approved":
    case "completed":
    case "active":
      return {
        color: dashboardColors.success,
        backgroundColor: dashboardColors.successLight,
      };

    case "printing":
    case "open":
    case "in progress":
      return {
        color: dashboardColors.info,
        backgroundColor: dashboardColors.infoLight,
      };

    case "pending":
    case "pending hod":
    case "pending hos":
    case "pending approval":
      return {
        color: dashboardColors.warning,
        backgroundColor: dashboardColors.warningLight,
      };

    case "rejected":
    case "inactive":
    case "failed":
      return {
        color: dashboardColors.danger,
        backgroundColor: dashboardColors.dangerLight,
      };

    case "draft":
      return {
        color: dashboardColors.neutral,
        backgroundColor: "#f1f5f9",
      };

    default:
      return {
        color: dashboardColors.textPrimary,
        backgroundColor: dashboardColors.background,
      };
  }
};

// ============================================
// Component
// ============================================

export default function StatusChip({
  status,
  size = "small",
}) {
  const styles = getStatusStyles(status);

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        fontWeight: 700,
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        border: "none",
      }}
    />
  );
}
