/* =========================================================
   Feature Flag View Dialog
   Purpose:
   Read-only detail dialog for Feature Flag Manager.
========================================================= */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Divider,
} from "@mui/material";

import AppButton from "@platform/ui/AppButton";
import AppChip from "@platform/ui/AppChip";

const DetailRow = ({ label, value }) => (
  <Stack spacing={0.5}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value || "N/A"}</Typography>
  </Stack>
);

const FeatureFlagViewDialog = ({ open, onClose, featureFlag }) => {
  if (!featureFlag) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Feature Flag Details</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <DetailRow label="Feature Key" value={featureFlag.FeatureKey} />
          <DetailRow label="Feature Name" value={featureFlag.FeatureName} />
          <DetailRow label="Description" value={featureFlag.Description} />
          <DetailRow label="Module" value={featureFlag.ModuleName} />
          <DetailRow
            label="Visibility"
            value={featureFlag.VisibilityStatusName}
          />

          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Status
            </Typography>
            <AppChip
              label={featureFlag.IsEnabled ? "Enabled" : "Disabled"}
              color={featureFlag.IsEnabled ? "success" : "default"}
            />
          </Stack>

          <Divider />

          <DetailRow label="Created At" value={featureFlag.CreatedAt} />
          <DetailRow label="Updated At" value={featureFlag.UpdatedAt} />
        </Stack>
      </DialogContent>

      <DialogActions>
        <AppButton onClick={onClose}>Close</AppButton>
      </DialogActions>
    </Dialog>
  );
};

export default FeatureFlagViewDialog;