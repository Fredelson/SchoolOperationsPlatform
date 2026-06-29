// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppConfirmDialog
// ============================================
//
// Purpose:
// Reusable confirmation dialog for delete,
// archive, reset, deactivate, restore, and
// other sensitive platform actions.
// ============================================

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
} from "@mui/material";

import AppButton from "./AppButton";

// ============================================
// Component
// ============================================

export default function AppConfirmDialog({
  open,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "error",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle fontWeight={900}>
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography color="text.secondary">
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Stack direction="row" spacing={1.5}>
          <AppButton
            variant="outlined"
            color="inherit"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelText}
          </AppButton>

          <AppButton
            color={confirmColor}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Please wait..." : confirmText}
          </AppButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}