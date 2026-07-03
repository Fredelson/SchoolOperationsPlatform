/* =========================================================
   Feature Flag Dialog
   Purpose:
   Create/Edit form dialog for Feature Flag Manager.
========================================================= */

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
} from "@mui/material";

import AppButton from "@platform/ui/AppButton";

const initialForm = {
  featureKey: "",
  featureName: "",
  description: "",
  moduleId: "",
  visibilityStatusId: "",
  isEnabled: true,
};

const FeatureFlagDialog = ({
  open,
  onClose,
  onSave,
  saving = false,
  featureFlag = null,
  lookups = {},
}) => {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (featureFlag) {
      setForm({
        featureKey: featureFlag.FeatureKey || "",
        featureName: featureFlag.FeatureName || "",
        description: featureFlag.Description || "",
        moduleId: featureFlag.ModuleId || "",
        visibilityStatusId: featureFlag.VisibilityStatusId || "",
        isEnabled: Boolean(featureFlag.IsEnabled),
      });
    } else {
      setForm(initialForm);
    }
  }, [featureFlag, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {featureFlag ? "Edit Feature Flag" : "Create Feature Flag"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Feature Key"
            value={form.featureKey}
            onChange={(e) => handleChange("featureKey", e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Feature Name"
            value={form.featureName}
            onChange={(e) => handleChange("featureName", e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          <TextField
            select
            label="Module"
            value={form.moduleId}
            onChange={(e) => handleChange("moduleId", e.target.value)}
            fullWidth
            required
          >
            {(lookups.modules || []).map((module) => (
              <MenuItem key={module.ModuleId} value={module.ModuleId}>
                {module.ModuleName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Visibility Status"
            value={form.visibilityStatusId}
            onChange={(e) =>
              handleChange("visibilityStatusId", e.target.value)
            }
            fullWidth
            required
          >
            {(lookups.visibilityStatuses || []).map((status) => (
              <MenuItem
                key={status.VisibilityStatusId}
                value={status.VisibilityStatusId}
              >
                {status.StatusName}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={form.isEnabled}
                onChange={(e) => handleChange("isEnabled", e.target.checked)}
              />
            }
            label={form.isEnabled ? "Enabled" : "Disabled"}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <AppButton variant="outlined" onClick={onClose} disabled={saving}>
          Cancel
        </AppButton>

        <AppButton onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};

export default FeatureFlagDialog;