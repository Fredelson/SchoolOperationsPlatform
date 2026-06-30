// ============================================
// ARAB UNITY SCHOOL
// Super Admin Dashboard - All Modules Section
//
// Purpose:
// Displays the full module overview section
// using reusable ModuleCard components.
// ============================================

import { Box, Typography } from "@mui/material";
import ModuleCard from "../widgets/ModuleCard";
// ============================================
// Component
// ============================================

export default function AllModules({ modules = [] }) {
  return (
    <Box sx={{ mt: 2 }}>
      {/* Section title */}
      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 900,
          color: "#0f172a",
          mb: 1.5,
        }}
      >
        All Modules
      </Typography>

      {/* Modules grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
            xl: "repeat(5, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        {modules.map((module) => (
          <ModuleCard key={module.title} {...module} />
        ))}
      </Box>
    </Box>
  );
}
