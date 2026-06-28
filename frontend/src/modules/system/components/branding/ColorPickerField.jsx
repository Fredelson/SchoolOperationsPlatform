// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Color Picker Field
// ============================================
//
// Purpose:
// Reusable color picker with HEX text input.
// ============================================

import { Box, TextField } from "@mui/material";

export default function ColorPickerField({ label, value, onChange }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        component="input"
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          width: 48,
          height: 48,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          p: 0,
          cursor: "pointer",
          bgcolor: "transparent",
        }}
      />

      <TextField
        fullWidth
        label={label}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
      />
    </Box>
  );
}