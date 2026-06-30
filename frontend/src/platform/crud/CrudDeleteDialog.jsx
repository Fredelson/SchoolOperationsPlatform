// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// CRUD Delete Dialog
// ============================================
//
// Purpose:
// Reusable confirmation dialog for deleting
// records across Super Admin manager pages.
// ============================================

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";

import AppButton from "@platform/ui/AppButton";

export default function CrudDeleteDialog({
  open,
  title = "Delete Record",
  message,
  itemName = "this record",
  loading = false,
  onCancel,
  onConfirm,
}) {
  const fallbackMessage = `Are you sure you want to delete ${itemName}? This action cannot be undone.`;

  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 900 }}>
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {message || fallbackMessage}
        </Typography>
      </DialogContent>

      <DialogActions>
        <AppButton variant="outlined" onClick={onCancel} disabled={loading}>
          Cancel
        </AppButton>

        <AppButton
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}