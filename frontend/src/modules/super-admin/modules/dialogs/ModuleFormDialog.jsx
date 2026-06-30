// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Form Dialog
// ============================================
//
// Purpose:
// Reusable Create/Edit dialog for Module Manager.
//
// Phase 5:
// - Reusable Create/Edit dialog
// - Supports loading state
// - Prevents closing while saving
// - Disables buttons during save
// ============================================

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";

import AppButton from "@platform/ui/AppButton";

// ============================================
// Options
// ============================================

const STATUS_OPTIONS = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
];

const VISIBILITY_OPTIONS = [
  { value: true, label: "Visible" },
  { value: false, label: "Hidden" },
];

// ============================================
// Component
// ============================================

export default function ModuleFormDialog({
  open,
  mode = "create",
  values,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === "edit";

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle fontWeight={900}>
        {isEdit ? "Edit Module" : "Create Module"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* ======================================
              Module Name
          ======================================= */}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Module Name"
              value={values.moduleName}
              onChange={(e) => onChange("moduleName", e.target.value)}
              disabled={loading}
            />
          </Grid>

          {/* ======================================
              Module Key
          ======================================= */}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Module Key"
              value={values.moduleKey}
              onChange={(e) => onChange("moduleKey", e.target.value)}
              disabled={loading}
            />
          </Grid>

          {/* ======================================
              Base Route
          ======================================= */}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Base Route"
              value={values.baseRoute}
              onChange={(e) => onChange("baseRoute", e.target.value)}
              disabled={loading}
            />
          </Grid>

          {/* ======================================
              Icon
          ======================================= */}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Icon"
              value={values.icon}
              onChange={(e) => onChange("icon", e.target.value)}
              disabled={loading}
            />
          </Grid>

          {/* ======================================
              Sort Order
          ======================================= */}

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Sort Order"
              value={values.sortOrder}
              onChange={(e) => onChange("sortOrder", e.target.value)}
              disabled={loading}
            />
          </Grid>

          {/* ======================================
              Status
          ======================================= */}

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Status"
              value={values.isActive}
              onChange={(e) => onChange("isActive", e.target.value)}
              disabled={loading}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem
                  key={String(option.value)}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* ======================================
              Visibility
          ======================================= */}

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Visibility"
              value={values.isVisible}
              onChange={(e) => onChange("isVisible", e.target.value)}
              disabled={loading}
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <MenuItem
                  key={String(option.value)}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      {/* ==========================================
          Actions
      =========================================== */}

      <DialogActions>
        <AppButton
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </AppButton>

        <AppButton
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : isEdit
            ? "Save Changes"
            : "Create Module"}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}