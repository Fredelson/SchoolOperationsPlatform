// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Delete Module Dialog
// ============================================
//
// Purpose:
// Confirms module deletion using the shared
// platform confirmation dialog.
// ============================================

import AppConfirmDialog from "@ui/AppConfirmDialog";

// ============================================
// Component
// ============================================

export default function DeleteModuleDialog({
  open,
  moduleItem,
  saving = false,
  onClose,
  onConfirm,
}) {
  return (
    <AppConfirmDialog
      open={open}
      title="Delete Module"
      message={
        moduleItem
          ? `Are you sure you want to delete "${moduleItem.moduleName}"? This action cannot be undone.`
          : "Are you sure you want to delete this module?"
      }
      confirmText="Delete"
      cancelText="Cancel"
      confirmColor="error"
      loading={saving}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}