// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Menu Form Dialog
// ============================================
//
// Purpose:
// Create/Edit dialog for Menu Manager.
//
// Enterprise Rules:
// - No hardcoded Module / Workspace / Permission IDs.
// - Dropdown values come from SQL Server through Platform Lookups.
// - Dialog remains render-focused.
// - Parent hook/service handles submit behavior.
// ============================================

import {
  Box,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  MenuItem,
  TextField,
} from "@mui/material";

import AppButton from "@platform/ui/AppButton";
import { useLookups } from "../../../../platform/lookups";

// ============================================
// Helpers
// ============================================
//
// Purpose:
// Safely read values from backend rows whether the API
// returns PascalCase, camelCase, or normalized fields.
// ============================================

function getValue(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null) {
      return row[key];
    }
  }

  return "";
}

function sameId(a, b) {
  return String(a ?? "") === String(b ?? "");
}

// ============================================
// Component
// ============================================

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

  // ==========================================
  // Platform Lookups
  // ==========================================

  const {
    workspaces = [],
    modules = [],
    menus = [],
    permissions = [],
    featureFlags = [],
    visibilityStatuses = [],
    loading: lookupsLoading,
  } = useLookups([
    "workspaces",
    "modules",
    "menus",
    "permissions",
    "featureFlags",
    "visibilityStatuses",
  ]);

  const isBusy = loading || lookupsLoading;
  const selectedModuleId = values.moduleId;

  // ==========================================
  // Parent Menu Filtering
  // ==========================================
  //
  // Rules:
  // - Parent menu must belong to selected module.
  // - Current menu cannot be its own parent.
  // ==========================================

  const parentMenuOptions = menus.filter((menu) => {
    const menuId = getValue(menu, "MenuId", "menuId", "id");
    const moduleId = getValue(menu, "ModuleId", "moduleId");

    return sameId(moduleId, selectedModuleId) && !sameId(menuId, values.menuId);
  });

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
        {isEdit ? "Edit Menu" : "Add Menu"}
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
          {/* Menu Name */}
          <TextField
            fullWidth
            required
            label="Menu Name"
            value={values.menuName || ""}
            onChange={(e) => onChange("menuName", e.target.value)}
            disabled={isBusy}
          />

          {/* Menu Key */}
          <TextField
            fullWidth
            required
            label="Menu Key"
            value={values.menuKey || ""}
            onChange={(e) => onChange("menuKey", e.target.value)}
            disabled={isBusy || isEdit}
          />

          {/* Workspace */}
          <TextField
            select
            fullWidth
            label="Workspace"
            value={values.workspaceId || ""}
            onChange={(e) => onChange("workspaceId", e.target.value)}
            disabled={isBusy}
          >
            <MenuItem value="">None</MenuItem>

            {workspaces.map((item) => {
              const id = getValue(item, "WorkspaceId", "workspaceId", "Id", "id");
              const label = getValue(
                item,
                "WorkspaceName",
                "workspaceName",
                "Name",
                "name",
                "Label",
                "label"
              );

              return (
                <MenuItem key={id} value={id}>
                  {label || `Workspace ${id}`}
                </MenuItem>
              );
            })}
          </TextField>

          {/* Module */}
          <TextField
            select
            fullWidth
            required
            label="Module"
            value={values.moduleId || ""}
            onChange={(e) => {
              onChange("moduleId", e.target.value);
              onChange("parentMenuId", "");
            }}
            disabled={isBusy}
          >
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

          {/* Parent Menu */}
          <TextField
            select
            fullWidth
            label="Parent Menu"
            value={values.parentMenuId || ""}
            onChange={(e) => onChange("parentMenuId", e.target.value)}
            disabled={isBusy || !selectedModuleId}
            helperText={
              selectedModuleId
                ? "Leave blank for top-level menu."
                : "Select a module first."
            }
          >
            <MenuItem value="">None</MenuItem>

            {parentMenuOptions.map((item) => {
              const id = getValue(item, "MenuId", "menuId", "Id", "id");
              const label = getValue(
                item,
                "MenuName",
                "menuName",
                "Name",
                "name",
                "Label",
                "label"
              );

              return (
                <MenuItem key={id} value={id}>
                  {label || `Menu ${id}`}
                </MenuItem>
              );
            })}
          </TextField>

          {/* Visibility */}
          <TextField
            select
            fullWidth
            label="Visibility"
            value={values.visibilityStatusKey || "enabled"}
            onChange={(e) => onChange("visibilityStatusKey", e.target.value)}
            disabled={isBusy}
          >
            {visibilityStatuses.map((item) => {
              const key =
                getValue(
                  item,
                  "VisibilityKey",
                  "visibilityKey",
                  "VisibilityStatusKey",
                  "visibilityStatusKey",
                  "StatusKey",
                  "statusKey",
                  "Key",
                  "key"
                ) || "enabled";

              const label =
                getValue(
                  item,
                  "VisibilityName",
                  "visibilityName",
                  "VisibilityStatusName",
                  "visibilityStatusName",
                  "StatusName",
                  "statusName",
                  "Name",
                  "name",
                  "Label",
                  "label"
                ) || key;

              return (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              );
            })}
          </TextField>

          {/* Route */}
          <TextField
            fullWidth
            label="Route"
            value={values.route || ""}
            onChange={(e) => onChange("route", e.target.value)}
            disabled={isBusy}
          />

          {/* Icon */}
          <TextField
            fullWidth
            label="Icon"
            value={values.icon || ""}
            onChange={(e) => onChange("icon", e.target.value)}
            disabled={isBusy}
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
            <MenuItem value="">None</MenuItem>

            {permissions.map((item) => {
              const id = getValue(item, "PermissionId", "permissionId", "Id", "id");
              const label =
                getValue(item, "PermissionName", "permissionName", "Name", "name") ||
                getValue(item, "PermissionKey", "permissionKey", "Key", "key");

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
            <MenuItem value="">None</MenuItem>

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

          {/* Badge Query Key */}
          <TextField
            fullWidth
            label="Badge Query Key"
            value={values.badgeQueryKey || ""}
            onChange={(e) => onChange("badgeQueryKey", e.target.value)}
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

          {/* Pinned */}
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(values.isPinned)}
                onChange={(e) => onChange("isPinned", e.target.checked)}
                disabled={isBusy}
              />
            }
            label="Pinned Menu"
          />

          {/* Collapsible */}
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(values.isCollapsible)}
                onChange={(e) => onChange("isCollapsible", e.target.checked)}
                disabled={isBusy}
              />
            }
            label="Collapsible Menu"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <AppButton variant="outlined" onClick={onClose} disabled={isBusy}>
          Cancel
        </AppButton>

        <AppButton
          variant="contained"
          onClick={() => {
            console.log("CREATE MENU BUTTON CLICKED");
            onSubmit();
          }}
          disabled={isBusy}
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Menu"}
        </AppButton>
      </DialogActions>
    </Dialog>
  );
}