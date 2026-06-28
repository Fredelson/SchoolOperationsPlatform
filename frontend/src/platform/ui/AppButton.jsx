// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppButton
// ============================================
//
// Purpose:
// Reusable platform button with consistent
// spacing, radius, weight, and theme behavior.
// ============================================

import { Button } from "@mui/material";

// ============================================
// Component
// ============================================

export default function AppButton({
  children,
  variant = "contained",
  size = "medium",
  sx = {},
  ...props
}) {
  return (
    <Button
      variant={variant}
      size={size}
      sx={{
        borderRadius: 3,
        fontWeight: 900,
        textTransform: "none",
        px: 3,
        minHeight: size === "large" ? 48 : 40,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}