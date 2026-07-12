// ============================================
// ARAB UNITY SCHOOL
// Reusable Action Button
//
// Purpose:
// Centralized button component used across
// the AUS Operations Platform.
//
// Why:
// Later, Super Admin Button Manager can control
// which buttons are visible/enabled without
// editing every page.
//
// Future Integration:
// - Button Manager
// - Permission Engine
// - Feature Flags
//
// Current Behavior:
// Works like a normal MUI Button.
// ============================================

import { Button } from "@mui/material";
import { usePermissions } from "../../context/PermissionContext";

export default function ActionButton({
  children,
  actionKey,
  buttonKey,
  disabled = false,
  ...props
}) {
  const { hasPermission, hasButtonAccess, loading } = usePermissions();
  if (actionKey && (loading || !hasPermission(actionKey))) return null;
  if (buttonKey && (loading || !hasButtonAccess(buttonKey))) return null;

  return (
    <Button
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  );
}
