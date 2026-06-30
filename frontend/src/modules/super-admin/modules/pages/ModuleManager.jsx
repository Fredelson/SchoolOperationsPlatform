// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Super Admin
// Module Manager
// ============================================

import { useState } from "react";
import { Add } from "@mui/icons-material";
import { Box, MenuItem, Stack, TextField, Typography } from "@mui/material";

import usePageTitle from "@platform/hooks/usePageTitle";
import AppButton from "@platform/ui/AppButton";
import AppToolbar from "@platform/ui/AppToolbar";
import AppDataTable from "@platform/ui/AppDataTable";
import AppEmptyState from "@platform/ui/AppEmptyState";

import ModuleKpiCards from "../cards/ModuleKpiCards";
import ModuleFormDialog from "../dialogs/ModuleFormDialog";
import DeleteModuleDialog from "../dialogs/DeleteModuleDialog";
import { useModuleManager } from "../hooks/useModuleManager";
import { getModuleColumns } from "../columns/moduleColumns";

// ============================================
// Filter Options
// ============================================

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const VISIBILITY_OPTIONS = [
  { value: "all", label: "All Visibility" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
];

// ============================================
// Default Form State
// ============================================

const DEFAULT_FORM = {
  moduleName: "",
  moduleKey: "",
  baseRoute: "",
  icon: "",
  sortOrder: 0,
  isActive: true,

  // IMPORTANT:
  // Form uses backend visibility status key.
  visibilityStatusKey: "enabled",
};

// ============================================
// Helpers
// ============================================

function getModuleId(module) {
  return module?.moduleId ?? module?.ModuleId;
}

function getModuleName(module) {
  return module?.moduleName ?? module?.ModuleName ?? "this module";
}

function normalizeKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getVisibilityStatusKey(module) {
  const visibilityStatusId = Number(
    module?.visibilityStatusId ?? module?.VisibilityStatusId
  );

  const visibilityStatusKey = normalizeKey(
    module?.visibilityStatusKey ?? module?.VisibilityStatusKey
  );

  if (visibilityStatusId === 1) return "enabled";
  if (visibilityStatusId === 2) return "hidden";

  if (visibilityStatusKey === "enabled") return "enabled";
  if (visibilityStatusKey === "hidden") return "hidden";

  return "enabled";
}

function mapModuleToForm(module) {
  return {
    moduleName: module?.moduleName ?? module?.ModuleName ?? "",
    moduleKey: module?.moduleKey ?? module?.ModuleKey ?? "",
    baseRoute: module?.baseRoute ?? module?.BaseRoute ?? "",
    icon: module?.icon ?? module?.Icon ?? "",
    sortOrder: module?.sortOrder ?? module?.SortOrder ?? 0,
    isActive: Boolean(module?.isActive ?? module?.IsActive),

    // IMPORTANT:
    // Do not use Boolean(isVisible) because SQL visibility ID 2 means Hidden.
    visibilityStatusKey: getVisibilityStatusKey(module),
  };
}

function mapFormToPayload(formValues) {
  const visibilityStatusKey =
    normalizeKey(formValues.visibilityStatusKey) === "hidden"
      ? "hidden"
      : "enabled";

  return {
    moduleName: formValues.moduleName,
    moduleKey: formValues.moduleKey,
    baseRoute: formValues.baseRoute,
    icon: formValues.icon,
    sortOrder: Number(formValues.sortOrder || 0),
    isActive: Boolean(formValues.isActive),

    // Send both fields so backend can accept either format.
    visibilityStatusKey,
    visibilityStatusId: visibilityStatusKey === "enabled" ? 1 : 2,
  };
}

// ============================================
// Component
// ============================================

export default function ModuleManager() {
  usePageTitle("AUS | Module Manager");

  const manager = useModuleManager();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [selectedModule, setSelectedModule] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  // ==========================================
  // Filter Handlers
  // ==========================================

  const handleSearchChange = (event) => {
    manager.setFilters((previous) => ({
      ...previous,
      search: event.target.value,
    }));
  };

  const handleStatusChange = (event) => {
    manager.setFilters((previous) => ({
      ...previous,
      status: event.target.value,
    }));
  };

  const handleVisibilityChange = (event) => {
    manager.setFilters((previous) => ({
      ...previous,
      visibility: event.target.value,
    }));
  };

  // ==========================================
  // Form Dialog Handlers
  // ==========================================

  const handleAddModule = () => {
    setSelectedModule(null);
    setFormMode("create");
    setFormValues(DEFAULT_FORM);
    setFormOpen(true);
  };

  const handleEditModule = (module) => {
    setSelectedModule(module);
    setFormMode("edit");
    setFormValues(mapModuleToForm(module));
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (manager.saving) return;

    setFormOpen(false);
    setSelectedModule(null);
    setFormValues(DEFAULT_FORM);
  };

  const handleFormChange = (field, value) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmitForm = async () => {
    const payload = mapFormToPayload(formValues);

    const result =
      formMode === "edit"
        ? await manager.updateModule(getModuleId(selectedModule), payload)
        : await manager.createModule(payload);

    if (result.success) {
      handleCloseForm();
    }
  };

  // ==========================================
  // Delete Dialog Handlers
  // ==========================================

  const handleOpenDelete = (module) => {
    setModuleToDelete(module);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    if (manager.saving) return;

    setDeleteOpen(false);
    setModuleToDelete(null);
  };

  const handleConfirmDelete = async () => {
    const result = await manager.deleteModule(moduleToDelete);

    if (result.success) {
      handleCloseDelete();
    }
  };

  // ==========================================
  // Activate / Deactivate Handlers
  // ==========================================

  const handleActivateModule = async (module) => {
    await manager.activateModule(module);
  };

  const handleDeactivateModule = async (module) => {
    await manager.deactivateModule(module);
  };

  // ==========================================
  // Table Columns
  // ==========================================

  const columns = getModuleColumns({
    onView: (module) => console.log("View Module:", module),
    onEdit: handleEditModule,
    onActivate: handleActivateModule,
    onDeactivate: handleDeactivateModule,
    onDelete: handleOpenDelete,
    disabled: manager.saving,
  });

  // ==========================================
  // Render
  // ==========================================

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Module Manager
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage platform modules, routes, visibility, and activation status.
          </Typography>
        </Box>

        <ModuleKpiCards kpis={manager.kpis} />

        <AppToolbar
          left={
            <>
              <TextField
                size="small"
                label="Search Modules"
                placeholder="Search by name or key..."
                value={manager.filters?.search || ""}
                onChange={handleSearchChange}
                disabled={manager.saving}
                sx={{ minWidth: { xs: "100%", sm: 260 } }}
              />

              <TextField
                select
                size="small"
                label="Status"
                value={manager.filters?.status || "all"}
                onChange={handleStatusChange}
                disabled={manager.saving}
                sx={{ minWidth: { xs: "100%", sm: 170 } }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Visibility"
                value={manager.filters?.visibility || "all"}
                onChange={handleVisibilityChange}
                disabled={manager.saving}
                sx={{ minWidth: { xs: "100%", sm: 180 } }}
              >
                {VISIBILITY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </>
          }
          right={
            <AppButton
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddModule}
              disabled={manager.saving}
            >
              Add Module
            </AppButton>
          }
        />

        {manager.error ? (
          <AppEmptyState
            title="Failed to load modules"
            message="Something went wrong while loading the module list."
            actionLabel="Retry"
            onAction={manager.refreshModules}
          />
        ) : (
          <AppDataTable
            rows={manager.filteredModules || manager.modules || []}
            columns={columns}
            loading={manager.loading}
            getRowId={(row) => row.moduleId ?? row.ModuleId}
            page={manager.pagination.page}
            rowsPerPage={manager.pagination.rowsPerPage}
            totalRows={manager.pagination.totalRows}
            onPageChange={manager.handlePageChange}
            onRowsPerPageChange={manager.handleRowsPerPageChange}
          />
        )}
      </Stack>

      <ModuleFormDialog
        open={formOpen}
        mode={formMode}
        values={formValues}
        loading={manager.saving}
        onChange={handleFormChange}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
      />

      <DeleteModuleDialog
        open={deleteOpen}
        moduleName={getModuleName(moduleToDelete)}
        loading={manager.saving}
        onCancel={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
