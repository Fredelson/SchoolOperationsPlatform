// ============================================
// ARAB UNITY SCHOOL
// Compact Recent Activity Section
// ============================================

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import DashboardCard from "./DashboardCard";
import ActivityItem from "./ActivityItem";

export default function RecentActivity({ items = [] }) {
  return (
    <DashboardCard
      title="Recent Activity"
      subtitle="Latest actions recorded in the audit log"
      action={
        <Button
          size="small"
          sx={{
            textTransform: "none",
            fontWeight: 800,
            fontSize: "0.72rem",
          }}
        >
          View All
        </Button>
      }
    >
      <Box>
        {items.map((item, index) => (
          <ActivityItem
            key={`${item.title}-${index}`}
            {...item}
          />
        ))}
      </Box>
    </DashboardCard>
  );
}