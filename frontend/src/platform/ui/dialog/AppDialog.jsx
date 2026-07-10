// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppDialog
// ============================================

import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import AppButton from "../AppButton";

export default function AppDialog({
  open,
  title = "Dialog",
  subtitle = "",
  icon = null,
  maxWidth = "md",

  loading = false,
  error = "",

  children,

  primaryText = "Save",
  secondaryText = "Cancel",
  primaryColor = "primary",

  onPrimary,
  onSecondary,
  onClose,

  disablePrimary = false,
  disableSecondary = false,
  hidePrimary = false,
  hideSecondary = false,
}) {
  const closeDialog = () => {
    if (!loading && onClose) onClose();
  };

  const handleSecondary = () => {
    if (loading) return;
    if (onSecondary) return onSecondary();
    closeDialog();
  };

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle sx={{ px: 3, py: 2.25 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {icon && <Box>{icon}</Box>}

          <Stack spacing={0.3}>
            <Typography variant="h6" fontWeight={900}>
              {title}
            </Typography>

            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {children}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={1.5}>
          {!hideSecondary && (
            <AppButton
              variant="outlined"
              color="inherit"
              disabled={loading || disableSecondary}
              onClick={handleSecondary}
            >
              {secondaryText}
            </AppButton>
          )}

          {!hidePrimary && (
            <AppButton
              color={primaryColor}
              disabled={loading || disablePrimary}
              onClick={onPrimary}
            >
              {loading ? "Please wait..." : primaryText}
            </AppButton>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}