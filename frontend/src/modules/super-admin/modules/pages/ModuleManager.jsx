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
// Phase 2 includes:
// - Page title
// - KPI cards
// - Toolbar
// - Search
// - Status filter
// - Visibility filter
// - Add Module button
//
// ============================================

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

// ============================================
// Module Components
// ============================================

import ModuleKpiCards from "../cards/ModuleKpiCards";
import { useModuleManager } from "../hooks/useModuleManager";

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
// Component
// ============================================

export default function ModuleManager() {
  // Browser tab title
  usePageTitle("AUS | Module Manager");

  // Module Manager state and actions
  const manager = useModuleManager();

  // ==========================================
  // Handlers
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

  const handleAddModule = () => {
    // Phase 4:
    // This will open the Create Module dialog.
    console.log("Add Module");
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <Box>
      <Stack spacing={3}>
        {/* Page heading */}
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Module Manager
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage platform modules, routes, visibility, and activation status.
          </Typography>
        </Box>

        {/* Live KPI cards */}
        <ModuleKpiCards kpis={manager.kpis} />

        {/* Phase 2 toolbar */}
        <AppToolbar
          left={
            <>
              <TextField
                size="small"
                label="Search Modules"
                placeholder="Search by name or key..."
                value={manager.filters?.search || ""}
                onChange={handleSearchChange}
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 260,
                  },
                }}
              />

              <TextField
                select
                size="small"
                label="Status"
                value={manager.filters?.status || "all"}
                onChange={handleStatusChange}
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 170,
                  },
                }}
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
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 180,
                  },
                }}
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

        {/* Phase 3: AppDataTable will be added here */}
      </Stack>
    </Box>
  );
}