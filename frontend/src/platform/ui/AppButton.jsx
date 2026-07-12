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
import { usePermissions } from "../../context/PermissionContext";

// ============================================
// Component
// ============================================

export default function AppButton({
  children,
  variant = "contained",
  size = "medium",
  actionKey,
  buttonKey,
  sx = {},
  ...props
}) {
  const { hasPermission, hasButtonAccess, loading } = usePermissions();
  if (actionKey && (loading || !hasPermission(actionKey))) return null;
  if (buttonKey && (loading || !hasButtonAccess(buttonKey))) return null;
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
