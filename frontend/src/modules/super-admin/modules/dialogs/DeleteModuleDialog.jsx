// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Delete Module Dialog
// ============================================
//
// Purpose:
// Reusable confirmation dialog used by the
// Module Manager before deleting a module.
//
// Architecture:
// DeleteModuleDialog
//        ↓
// AppConfirmDialog
// ============================================

import AppConfirmDialog from "@platform/ui/AppConfirmDialog";

// ============================================
// Component
// ============================================

export default function DeleteModuleDialog({
  open,
  moduleName,
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <AppConfirmDialog
      open={open}
      title="Delete Module"
      message={`Are you sure you want to delete "${moduleName}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      confirmColor="error"
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}