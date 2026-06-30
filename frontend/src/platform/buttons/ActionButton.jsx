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

export default function ActionButton({
  children,
  actionKey,
  disabled = false,
  ...props
}) {
  // ============================================
  // Future Permission Hook
  //
  // Later:
  // const allowed = useButtonPermission(actionKey);
  // if (!allowed) return null;
  //
  // For now:
  // All buttons are allowed.
  // ============================================

  return (
    <Button
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  );
}
