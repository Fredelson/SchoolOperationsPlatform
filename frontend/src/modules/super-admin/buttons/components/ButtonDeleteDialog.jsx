// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Delete Dialog
// ============================================
//
// Purpose:
// Displays a confirmation dialog before deleting
// a button.
//
// Responsibilities:
// • Show selected button information
// • Confirm delete
// • Cancel delete
//
// Rules:
// • No API calls
// • No business logic
// • Parent hook performs deletion
// ============================================

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Typography,
} from "@mui/material";

import AppButton from "../../../../platform/ui/AppButton";
import AppChip from "../../../../platform/ui/AppChip";

export default function ButtonDeleteDialog({
  open,
  button,
  loading,
  onClose,
  onConfirm,
}) {
  if (!button) return null;

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
    >
      {/* ============================================
          Dialog Title
      ============================================ */}

      <DialogTitle>
        Delete Button
      </DialogTitle>

      {/* ============================================
          Dialog Content
      ============================================ */}

      <DialogContent dividers>
        <DialogContentText sx={{ mb: 3 }}>
          Are you sure you want to permanently delete
          this button?
        </DialogContentText>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            Button Name
          </Typography>

          <Typography
            variant="body1"
            sx={{ mb: 2 }}
          >
            {button.buttonName}
          </Typography>

          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            Button Key
          </Typography>

          <Typography
            variant="body1"
            sx={{ mb: 2 }}
          >
            {button.buttonKey}
          </Typography>

          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            Module
          </Typography>

          <Typography
            variant="body1"
            sx={{ mb: 2 }}
          >
            {button.moduleName}
          </Typography>

          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            Visibility
          </Typography>

          <AppChip
            size="small"
            label={button.visibilityStatusName}
            color={
              Number(button.visibilityStatusId) === 1
                ? "success"
                : "default"
            }
          />
        </Box>

        <Typography
          variant="body2"
          color="error"
          sx={{ mt: 3 }}
        >
          This action cannot be undone.
        </Typography>
      </DialogContent>

      {/* ============================================
          Actions
      ============================================ */}

      <DialogActions>
        <AppButton
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </AppButton>

        <AppButton
          color="error"
          variant="contained"
          loading={loading}
          onClick={onConfirm}
        >
          Delete Button
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}
