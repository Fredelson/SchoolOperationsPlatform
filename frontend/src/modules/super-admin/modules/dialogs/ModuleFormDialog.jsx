// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Form Dialog
// ============================================
//
// Purpose:
// Shared create/edit dialog for Module Manager.
// Used for both adding and updating platform modules.
// ============================================

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";

import AppButton from "@ui/AppButton";

// ============================================
// Constants
// ============================================

const VISIBILITY_OPTIONS = [
  {
    value: 1,
    label: "Visible",
  },
  {
    value: 2,
    label: "Hidden",
  },
];

// ============================================
// Component
// ============================================

export default function ModuleFormDialog({
  open,
  mode = "create",
  formData,
  saving = false,
  onChange,
  onClose,
  onSave,
}) {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {isEdit ? "Edit Module" : "Add Module"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Module Key"
              value={formData.moduleKey}
              onChange={(event) => onChange("moduleKey", event.target.value)}
              fullWidth
              required
              disabled={isEdit}
              helperText={isEdit ? "Module key cannot be changed after creation." : ""}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Module Name"
              value={formData.moduleName}
              onChange={(event) => onChange("moduleName", event.target.value)}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(event) => onChange("description", event.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Icon"
              value={formData.icon}
              onChange={(event) => onChange("icon", event.target.value)}
              fullWidth
              placeholder="Example: Settings, Widgets, Inventory"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Base Route"
              value={formData.baseRoute}
              onChange={(event) => onChange("baseRoute", event.target.value)}
              fullWidth
              placeholder="/super-admin/modules"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Sort Order"
              type="number"
              value={formData.sortOrder}
              onChange={(event) =>
                onChange("sortOrder", Number(event.target.value))
              }
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Visibility"
              value={formData.visibilityStatusId}
              onChange={(event) =>
                onChange("visibilityStatusId", Number(event.target.value))
              }
              fullWidth
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <AppButton variant="outlined" onClick={onClose} disabled={saving}>
          Cancel
        </AppButton>

        <AppButton variant="contained" onClick={onSave} loading={saving}>
          {isEdit ? "Save Changes" : "Create Module"}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}