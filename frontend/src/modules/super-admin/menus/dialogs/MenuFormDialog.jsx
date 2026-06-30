// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Menu Form Dialog
// ============================================

import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";

import AppButton from "@platform/ui/AppButton";

const VISIBILITY_OPTIONS = [
  { value: "enabled", label: "Visible" },
  { value: "hidden", label: "Hidden" },
];

export default function MenuFormDialog({
  open,
  mode = "create",
  values = {},
  loading = false,
  onChange,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 900 }}>
        {isEdit ? "Edit Menu" : "Add Menu"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Menu Name"
              value={values.menuName || ""}
              onChange={(e) => onChange("menuName", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Menu Key"
              value={values.menuKey || ""}
              onChange={(e) => onChange("menuKey", e.target.value)}
              disabled={isEdit}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="number"
              label="Module ID"
              value={values.moduleId || ""}
              onChange={(e) => onChange("moduleId", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Workspace ID"
              value={values.workspaceId || ""}
              onChange={(e) => onChange("workspaceId", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Parent Menu ID"
              value={values.parentMenuId || ""}
              onChange={(e) => onChange("parentMenuId", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Route"
              value={values.route || ""}
              onChange={(e) => onChange("route", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Icon"
              value={values.icon || ""}
              onChange={(e) => onChange("icon", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Badge Query Key"
              value={values.badgeQueryKey || ""}
              onChange={(e) => onChange("badgeQueryKey", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Permission ID"
              value={values.permissionId || ""}
              onChange={(e) => onChange("permissionId", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Feature Flag ID"
              value={values.featureFlagId || ""}
              onChange={(e) => onChange("featureFlagId", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Visibility"
              value={values.visibilityStatusKey || "enabled"}
              onChange={(e) => onChange("visibilityStatusKey", e.target.value)}
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Sort Order"
              value={values.sortOrder ?? 0}
              onChange={(e) => onChange("sortOrder", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(values.isPinned)}
                  onChange={(e) => onChange("isPinned", e.target.checked)}
                />
              }
              label="Pinned Menu"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(values.isCollapsible)}
                  onChange={(e) => onChange("isCollapsible", e.target.checked)}
                />
              }
              label="Collapsible Menu"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <AppButton variant="outlined" onClick={onClose} disabled={loading}>
          Cancel
        </AppButton>

        <AppButton variant="contained" onClick={onSubmit} disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Menu"}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}