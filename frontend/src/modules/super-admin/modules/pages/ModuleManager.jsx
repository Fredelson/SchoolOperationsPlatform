// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Super Admin
// Module Manager
// ============================================
//
// Purpose:
// Provides the entry page for managing
// platform modules.
//
// Current phase:
// Phase 4D
// - Create Module connected to API
// - Edit Module connected to API
// - Reuses ModuleFormDialog
//
// ============================================

import { useState } from "react";

import { Add } from "@mui/icons-material";

import {
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

// ============================================
// Platform Components
// ============================================

import usePageTitle from "@platform/hooks/usePageTitle";
import AppButton from "@platform/ui/AppButton";
import AppToolbar from "@platform/ui/AppToolbar";
import AppDataTable from "@platform/ui/AppDataTable";

// ============================================
// Module Components
// ============================================

import ModuleKpiCards from "../cards/ModuleKpiCards";
import ModuleFormDialog from "../dialogs/ModuleFormDialog";
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
  isVisible: true,
};

// ============================================
// Helpers
// ============================================

function getModuleId(module) {
  return module?.moduleId ?? module?.ModuleId;
}

function mapModuleToForm(module) {
  return {
    moduleName: module?.moduleName ?? module?.ModuleName ?? "",
    moduleKey: module?.moduleKey ?? module?.ModuleKey ?? "",
    baseRoute: module?.baseRoute ?? module?.BaseRoute ?? "",
    icon: module?.icon ?? module?.Icon ?? "",
    sortOrder: module?.sortOrder ?? module?.SortOrder ?? 0,
    isActive: Boolean(module?.isActive ?? module?.IsActive),
    isVisible: Boolean(module?.isVisible ?? module?.IsVisible),
  };
}

function mapFormToPayload(formValues) {
  return {
    moduleName: formValues.moduleName,
    moduleKey: formValues.moduleKey,
    baseRoute: formValues.baseRoute,
    icon: formValues.icon,
    sortOrder: Number(formValues.sortOrder || 0),
    isActive: Boolean(formValues.isActive),
    isVisible: Boolean(formValues.isVisible),
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
  // Dialog Handlers
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
  // Table Columns
  // ==========================================

  const columns = getModuleColumns({
    onView: (module) => console.log("View Module:", module),
    onEdit: handleEditModule,
    onActivate: (module) => console.log("Activate Module:", module),
    onDeactivate: (module) => console.log("Deactivate Module:", module),
    onDelete: (module) => console.log("Delete Module:", module),
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
                sx={{ minWidth: { xs: "100%", sm: 260 } }}
              />

              <TextField
                select
                size="small"
                label="Status"
                value={manager.filters?.status || "all"}
                onChange={handleStatusChange}
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
            >
              Add Module
            </AppButton>
          }
        />

        <AppDataTable
          rows={manager.filteredModules || manager.modules || []}
          columns={columns}
          loading={manager.loading}
          getRowId={(row) => row.moduleId ?? row.ModuleId}
        />
      </Stack>

      <ModuleFormDialog
        open={formOpen}
        mode={formMode}
        values={formValues}
        onChange={handleFormChange}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
      />
    </Box>
  );
}