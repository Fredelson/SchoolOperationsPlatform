// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget Form Dialog
// ============================================
//
// Purpose:
// Reusable Create/Edit dialog for Widget Manager.
//
// Enterprise Rules:
// - No hardcoded Module / Permission / Feature Flag IDs.
// - Dropdown values come from SQL Server through Widget lookups.
// - Dialog remains render-focused.
// - Parent hook/service handles submit behavior.
// ============================================

import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
} from "@mui/material";

import AppButton from "@platform/ui/AppButton";

// ============================================
// Widget Type Options
// ============================================
//
// These are type labels only, not database IDs.
// Actual widgets still come from SQL Server.
// ============================================

const WIDGET_TYPES = [
  "KPI",
  "Chart",
  "Table",
  "List",
  "Summary",
  "Quick Action",
  "Progress",
  "Calendar",
];

// ============================================
// Helpers
// ============================================
//
// Purpose:
// Safely read values whether API returns
// PascalCase, camelCase, or normalized fields.
// ============================================

function getValue(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null) {
      return row[key];
    }
  }

  return "";
}

// ============================================
// Component
// ============================================

export default function WidgetFormDialog({
  open,
  mode = "create",
  values = {},
  lookups = {},
  loading = false,
  onChange,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === "edit";
  const isBusy = loading;

  const modules = lookups.modules || [];
  const permissions = lookups.permissions || [];
  const featureFlags = lookups.featureFlags || [];
  const visibilityStatuses = lookups.visibilityStatuses || [];

  return (
    <Dialog
      open={open}
      onClose={isBusy ? undefined : onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 900 }}>
        {isEdit ? "Edit Widget" : "Create Widget"}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            gap: 2.5,
          }}
        >
          {/* Widget Name */}
          <TextField
            fullWidth
            required
            label="Widget Name"
            value={values.widgetName || ""}
            onChange={(e) => onChange("widgetName", e.target.value)}
            disabled={isBusy}
          />

          {/* Widget Key */}
          <TextField
            fullWidth
            required
            label="Widget Key"
            value={values.widgetKey || ""}
            onChange={(e) => onChange("widgetKey", e.target.value)}
            disabled={isBusy}
            helperText="Example: super_admin_total_users"
          />

          {/* Module */}
          <TextField
            select
            fullWidth
            label="Module"
            value={values.moduleId || ""}
            onChange={(e) => onChange("moduleId", e.target.value)}
            disabled={isBusy}
          >
            <MenuItem value="">No Module</MenuItem>

            {modules.map((item) => {
              const id = getValue(item, "ModuleId", "moduleId", "Id", "id");
              const label = getValue(
                item,
                "ModuleName",
                "moduleName",
                "Name",
                "name",
                "Label",
                "label"
              );

              return (
                <MenuItem key={id} value={id}>
                  {label || `Module ${id}`}
                </MenuItem>
              );
            })}
          </TextField>

          {/* Widget Type */}
          <TextField
            select
            fullWidth
            label="Widget Type"
            value={values.widgetType || ""}
            onChange={(e) => onChange("widgetType", e.target.value)}
            disabled={isBusy}
          >
            <MenuItem value="">Select Type</MenuItem>

            {WIDGET_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          {/* Data Source Key */}
          <TextField
            fullWidth
            label="Data Source Key"
            value={values.dataSourceKey || ""}
            onChange={(e) => onChange("dataSourceKey", e.target.value)}
            disabled={isBusy}
            helperText="Example: super_admin.total_users"
            sx={{
              gridColumn: {
                xs: "1",
                md: "1 / -1",
              },
            }}
          />

          {/* Description */}
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Description"
            value={values.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            disabled={isBusy}
            sx={{
              gridColumn: {
                xs: "1",
                md: "1 / -1",
              },
            }}
          />

          {/* Permission */}
          <TextField
            select
            fullWidth
            label="Permission"
            value={values.permissionId || ""}
            onChange={(e) => onChange("permissionId", e.target.value)}
            disabled={isBusy}
          >
            <MenuItem value="">No Permission</MenuItem>

            {permissions.map((item) => {
              const id = getValue(
                item,
                "PermissionId",
                "permissionId",
                "Id",
                "id"
              );

              const label =
                getValue(
                  item,
                  "PermissionName",
                  "permissionName",
                  "Name",
                  "name"
                ) ||
                getValue(
                  item,
                  "PermissionKey",
                  "permissionKey",
                  "Key",
                  "key"
                );

              return (
                <MenuItem key={id} value={id}>
                  {label || `Permission ${id}`}
                </MenuItem>
              );
            })}
          </TextField>

          {/* Feature Flag */}
          <TextField
            select
            fullWidth
            label="Feature Flag"
            value={values.featureFlagId || ""}
            onChange={(e) => onChange("featureFlagId", e.target.value)}
            disabled={isBusy}
          >
            <MenuItem value="">No Feature Flag</MenuItem>

            {featureFlags.map((item) => {
              const id = getValue(
                item,
                "FeatureFlagId",
                "featureFlagId",
                "Id",
                "id"
              );

              const label =
                getValue(
                  item,
                  "FeatureName",
                  "featureName",
                  "FeatureFlagName",
                  "featureFlagName",
                  "Name",
                  "name"
                ) ||
                getValue(
                  item,
                  "FeatureKey",
                  "featureKey",
                  "FeatureFlagKey",
                  "featureFlagKey",
                  "Key",
                  "key"
                );

              return (
                <MenuItem key={id} value={id}>
                  {label || `Feature Flag ${id}`}
                </MenuItem>
              );
            })}
          </TextField>

          {/* Visibility */}
          <TextField
            select
            fullWidth
            required
            label="Visibility"
            value={values.visibilityStatusId || 1}
            onChange={(e) => onChange("visibilityStatusId", e.target.value)}
            disabled={isBusy}
          >
            {visibilityStatuses.map((item) => {
              const id = getValue(
                item,
                "VisibilityStatusId",
                "visibilityStatusId",
                "Id",
                "id"
              );

              const label =
                getValue(
                  item,
                  "StatusName",
                  "statusName",
                  "VisibilityStatusName",
                  "visibilityStatusName",
                  "Name",
                  "name",
                  "Label",
                  "label"
                ) || `Status ${id}`;

              return (
                <MenuItem key={id} value={id}>
                  {label}
                </MenuItem>
              );
            })}
          </TextField>

          {/* Default Width */}
          <TextField
            fullWidth
            type="number"
            label="Default Width"
            value={values.defaultWidth ?? 3}
            onChange={(e) => onChange("defaultWidth", e.target.value)}
            disabled={isBusy}
          />

          {/* Default Height */}
          <TextField
            fullWidth
            type="number"
            label="Default Height"
            value={values.defaultHeight ?? 1}
            onChange={(e) => onChange("defaultHeight", e.target.value)}
            disabled={isBusy}
          />

          {/* Sort Order */}
          <TextField
            fullWidth
            type="number"
            label="Sort Order"
            value={values.sortOrder ?? 0}
            onChange={(e) => onChange("sortOrder", e.target.value)}
            disabled={isBusy}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <AppButton variant="outlined" onClick={onClose} disabled={isBusy}>
          Cancel
        </AppButton>

        <AppButton variant="contained" onClick={onSubmit} disabled={isBusy}>
          {isBusy
            ? "Please wait..."
            : isEdit
            ? "Save Changes"
            : "Create Widget"}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}