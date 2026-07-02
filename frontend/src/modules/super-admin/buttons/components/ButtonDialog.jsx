// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Form Dialog
// ============================================
//
// Purpose:
// Reusable Create/Edit dialog for Button Manager.
// ============================================

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  MenuItem,
} from "@mui/material";

import AppButton from "@platform/ui/AppButton";

const INITIAL_FORM = {
  moduleId: "",
  buttonKey: "",
  buttonName: "",
  permissionId: "",
  featureFlagId: "",
  visibilityStatusId: 1,
};

export default function ButtonDialog({
  open,
  mode = "create",
  button,
  lookups,
  loading = false,
  onClose,
  onSave,
}) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!button) {
      setForm(INITIAL_FORM);
      return;
    }

    setForm({
      moduleId: button.moduleId ?? "",
      buttonKey: button.buttonKey ?? "",
      buttonName: button.buttonName ?? "",
      permissionId: button.permissionId ?? "",
      featureFlagId: button.featureFlagId ?? "",
      visibilityStatusId: button.visibilityStatusId ?? 1,
    });
  }, [button]);

  const handleChange = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave({
      moduleId: Number(form.moduleId),
      buttonKey: form.buttonKey.trim(),
      buttonName: form.buttonName.trim(),
      permissionId: form.permissionId === "" ? null : Number(form.permissionId),
      featureFlagId:
        form.featureFlagId === "" ? null : Number(form.featureFlagId),
      visibilityStatusId: Number(form.visibilityStatusId),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle fontWeight={900}>
        {isEdit ? "Edit Button" : "Create Button"}
      </DialogTitle>

      <DialogContent dividers>
  <Box
    sx={{
      mt: 0.5,
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        md: "1fr 1fr",
      },
      gap: 2,
    }}
  >
    <TextField
      select
      fullWidth
      required
      label="Module"
      value={form.moduleId}
      onChange={(e) => handleChange("moduleId", e.target.value)}
      disabled={loading}
    >
      {lookups.modules.map((module) => (
        <MenuItem
          key={module.moduleId ?? module.ModuleId}
          value={module.moduleId ?? module.ModuleId}
        >
          {module.moduleName ?? module.ModuleName}
        </MenuItem>
      ))}
    </TextField>

    <TextField
      fullWidth
      required
      label="Button Key"
      value={form.buttonKey}
      onChange={(e) => handleChange("buttonKey", e.target.value)}
      disabled={loading}
    />

    <TextField
      fullWidth
      required
      label="Button Name"
      value={form.buttonName}
      onChange={(e) => handleChange("buttonName", e.target.value)}
      disabled={loading}
      sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}
    />

    <TextField
      select
      fullWidth
      label="Permission"
      value={form.permissionId}
      onChange={(e) => handleChange("permissionId", e.target.value)}
      disabled={loading}
    >
      <MenuItem value="">None</MenuItem>
      {lookups.permissions.map((permission) => (
        <MenuItem
          key={permission.permissionId ?? permission.PermissionId}
          value={permission.permissionId ?? permission.PermissionId}
        >
          {permission.permissionName ?? permission.PermissionName}
        </MenuItem>
      ))}
    </TextField>

    <TextField
      select
      fullWidth
      label="Feature Flag"
      value={form.featureFlagId}
      onChange={(e) => handleChange("featureFlagId", e.target.value)}
      disabled={loading}
    >
      <MenuItem value="">None</MenuItem>
      {lookups.featureFlags.map((flag) => (
        <MenuItem
          key={flag.featureFlagId ?? flag.FeatureFlagId}
          value={flag.featureFlagId ?? flag.FeatureFlagId}
        >
          {flag.featureFlagName ?? flag.FeatureFlagName}
        </MenuItem>
      ))}
    </TextField>

    <TextField
      select
      fullWidth
      label="Visibility"
      value={form.visibilityStatusId}
      onChange={(e) => handleChange("visibilityStatusId", e.target.value)}
      disabled={loading}
    >
      {lookups.visibilityStatuses.map((status) => (
        <MenuItem
          key={status.visibilityStatusId ?? status.VisibilityStatusId}
          value={status.visibilityStatusId ?? status.VisibilityStatusId}
        >
          {status.statusName ?? status.StatusName}
        </MenuItem>
      ))}
    </TextField>
  </Box>
</DialogContent>

      <DialogActions>
        <AppButton variant="outlined" onClick={onClose} disabled={loading}>
          Cancel
        </AppButton>

        <AppButton variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading
            ? "Please wait..."
            : isEdit
            ? "Save Changes"
            : "Create Button"}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}