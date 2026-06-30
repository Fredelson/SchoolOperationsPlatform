// ============================================
// ARAB UNITY SCHOOL
// Pending Approvals Section
//
// Purpose:
// Displays items waiting for approval.
//
// Architecture:
// DashboardCard
//   └── ApprovalItem
// ============================================

import Box from "@mui/material/Box";

import DashboardCard from "./DashboardCard";
// NEW
import ApprovalItem from "../widgets/ApprovalItem";

export default function PendingApprovals({
  title = "Pending Approvals",
  subtitle = "Items awaiting review",
  items = [],
}) {
  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {items.map((item, index) => (
          <ApprovalItem
            key={`${item.title}-${index}`}
            {...item}
          />
        ))}
      </Box>
    </DashboardCard>
  );
}
