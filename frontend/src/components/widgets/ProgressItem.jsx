// ============================================
// Reusable Progress Item
// Reserved for future dashboard sections
// ============================================

import { Box, Typography, LinearProgress } from "@mui/material";

export default function ProgressItem({ label, value }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography fontWeight={700} color="#0f172a" sx={{ mb: 0.8 }}>
        {label}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 10,
          bgcolor: "#e5e7eb",
          "& .MuiLinearProgress-bar": {
            borderRadius: 10,
            bgcolor: "#0f5132",
          },
        }}
      />
    </Box>
  );
}