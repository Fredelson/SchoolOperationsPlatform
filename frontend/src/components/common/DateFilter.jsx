// ============================================
// ARAB UNITY SCHOOL
// Reusable Date Filter
// Used by Teacher, HOD, HOS, Admin dashboards
// ============================================

import { Box } from "@mui/material";

export default function DateFilter({
  label = "May 1 - May 31, 2025",
}) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        border: "1px solid #E5E7EB",
        borderRadius: 2,
        backgroundColor: "#fff",
        fontWeight: 600,
        fontSize: 14,
        whiteSpace: "nowrap",
      }}
    >
      📅 {label}
    </Box>
  );
}
