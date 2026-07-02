// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Delete Widget Dialog
// ============================================

import AppConfirmDialog from "@platform/ui/AppConfirmDialog";

export default function DeleteWidgetDialog({
  open,
  widgetName,
  loading,
  onCancel,
  onConfirm,
}) {
  return (
    <AppConfirmDialog
      open={open}
      title="Delete Widget"
      message={`Are you sure you want to delete "${widgetName}"? This action cannot be undone.`}
      confirmText="Delete"
      confirmColor="error"
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}