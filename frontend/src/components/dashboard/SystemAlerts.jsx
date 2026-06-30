// ============================================
// ARAB UNITY SCHOOL
// System Alerts
//
// Purpose:
// Displays current platform alerts.
//
// Reusable:
// Yes
// ============================================

import { Box } from "@mui/material";

import { DashboardSection } from "../layout";
import { AlertItem } from "../widgets";

export default function SystemAlerts({ items = [] }) {
  return (
    <DashboardSection title="System Alerts">
      <Box>
        {items.map((alert, index) => (
          <AlertItem key={index} {...alert} />
        ))}
      </Box>
    </DashboardSection>
  );
}
