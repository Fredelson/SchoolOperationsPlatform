// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppFormGrid
// ============================================

import { Box } from "@mui/material";

export default function AppFormGrid({ children, columns = 2, gap = 2.5 }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: `repeat(${columns}, 1fr)`,
        },
        gap,
      }}
    >
      {children}
    </Box>
  );
}