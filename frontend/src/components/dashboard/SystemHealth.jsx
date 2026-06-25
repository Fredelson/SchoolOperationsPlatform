// ============================================
// ARAB UNITY SCHOOL
// Compact System Health Section
// ============================================

import Box from "@mui/material/Box";

import DashboardCard from "../common/DashboardCard";
import HealthItem from "../widgets/HealthItem";

export default function SystemHealth({ items = [] }) {
  return (
    <DashboardCard
      title="System Health"
      subtitle="Current status of core platform services"
    >
      <Box>
        {items.map((item) => (
          <HealthItem
            key={item.label}
            label={item.label}
            status={item.status}
            value={item.value}
          />
        ))}
      </Box>
    </DashboardCard>
  );
}