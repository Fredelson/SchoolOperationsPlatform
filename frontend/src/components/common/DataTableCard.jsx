// ============================================
// ARAB UNITY SCHOOL
// Reusable Data Table Card
// Used by Teacher, HOD, HOS, Admin pages
// For all pages containing tables
// ============================================

import { Box } from "@mui/material";
import DashboardCard from "../dashboard/DashboardCard";

export default function DataTableCard({
  title,
  subtitle,
  action,
  children,
  sx = {},
}) {
  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      action={action}
      sx={sx}
    >
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        {children}
      </Box>
    </DashboardCard>
  );
}
