// ============================================
// ARAB UNITY SCHOOL
// Reusable Department Filter Component
// ============================================

// MUI components
import { Box, Button } from "@mui/material";

// School department list
const departments = [
  "All",
  "FS",
  "Primary",
  "Secondary",
  "Inclusion",
  "Sixth Form",
];

export default function DepartmentFilter({
  selectedDepartment,
  onChange,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        flexWrap: "wrap",
        mb: 3,
      }}
    >
      {/* Department buttons */}
      {departments.map((department) => (
        <Button
          key={department}
          variant={
            selectedDepartment === department
              ? "contained"
              : "outlined"
          }
          size="small"
          onClick={() => onChange(department)}
        >
          {department}
        </Button>
      ))}
    </Box>
  );
}
