// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Super Admin - Button Manager
// ============================================
//
// Purpose:
// Manage backend-driven action buttons, permissions,
// feature flags, module ownership, and visibility.
//
// Architecture:
// ButtonManager.jsx
//    ↓
// useButtonManager
//    ↓
// buttonApi
//    ↓
// Backend /api/buttons
//
// Rules:
// - No API calls here
// - No duplicated CRUD logic here
// - Page only composes hook + reusable components
// ============================================

import { useMemo } from "react";
import { Add } from "@mui/icons-material";
import { Box, MenuItem, Stack, TextField, Typography } from "@mui/material";

import usePageTitle from "@platform/hooks/usePageTitle";
import AppButton from "@platform/ui/AppButton";
import AppToolbar from "@platform/ui/AppToolbar";
import AppDataTable from "@platform/ui/AppDataTable";
import AppEmptyState from "@platform/ui/AppEmptyState";

import ButtonKPICards from "../components/ButtonKPICards";
import ButtonDialog from "../components/ButtonDialog";
import ButtonDeleteDialog from "../components/ButtonDeleteDialog";
import useButtonManager from "../hooks/useButtonManager";
import { getButtonColumns } from "../components/ButtonColumns";

// ============================================
// Helpers
// ============================================

function getButtonId(row) {
  return row?.buttonId ?? row?.ButtonId;
}

function getLookupId(row, camelKey, sqlKey) {
  return row?.[camelKey] ?? row?.[sqlKey];
}

function getLookupName(row, camelKey, sqlKey) {
  return row?.[camelKey] ?? row?.[sqlKey] ?? "Unknown";
}

// ============================================
// Component
// ============================================

export default function ButtonManager() {
  usePageTitle("AUS | Button Manager");

  const manager = useButtonManager();

  // ============================================
  // Table Columns
  // ============================================

  const columns = useMemo(
    () =>
      getButtonColumns({
        onEdit: manager.openEditDialog,
        onDelete: manager.openDeleteDialog,
        disabled: manager.saving || manager.deleting,
      }),
    [
      manager.openEditDialog,
      manager.openDeleteDialog,
      manager.saving,
      manager.deleting,
    ]
  );

  // ============================================
  // Render
  // ============================================

  return (
    <Box>
      <Stack spacing={3}>
        {/* Page Header */}
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Button Manager
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage backend-driven action buttons, permissions, feature flags,
            module ownership, and visibility.
          </Typography>
        </Box>

        {/* KPI Cards */}
        <ButtonKPICards statistics={manager.statistics} />

        {/* Toolbar */}
        <AppToolbar
          left={
            <>
              <TextField
                size="small"
                label="Search Buttons"
                placeholder="Search by name, key, module..."
                value={manager.filters.search}
                onChange={(event) =>
                  manager.updateFilter("search", event.target.value)
                }
                disabled={manager.saving || manager.deleting}
                sx={{ minWidth: { xs: "100%", sm: 280 } }}
              />

              <TextField
                select
                size="small"
                label="Module"
                value={manager.filters.moduleId}
                onChange={(event) =>
                  manager.updateFilter("moduleId", event.target.value)
                }
                disabled={manager.saving || manager.deleting}
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
              >
                <MenuItem value="">All Modules</MenuItem>

                {manager.lookups.modules.map((module) => {
                  const value = getLookupId(module, "moduleId", "ModuleId");
                  const label = getLookupName(
                    module,
                    "moduleName",
                    "ModuleName"
                  );

                  return (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  );
                })}
              </TextField>

              <TextField
                select
                size="small"
                label="Visibility"
                value={manager.filters.visibilityStatusId}
                onChange={(event) =>
                  manager.updateFilter(
                    "visibilityStatusId",
                    event.target.value
                  )
                }
                disabled={manager.saving || manager.deleting}
                sx={{ minWidth: { xs: "100%", sm: 180 } }}
              >
                <MenuItem value="">All Visibility</MenuItem>

                {manager.lookups.visibilityStatuses.map((status) => {
                  const value = getLookupId(
                    status,
                    "visibilityStatusId",
                    "VisibilityStatusId"
                  );

                  const label = getLookupName(
                    status,
                    "statusName",
                    "StatusName"
                  );

                  return (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  );
                })}
              </TextField>
            </>
          }
          right={
            <AppButton
              variant="contained"
              startIcon={<Add />}
              onClick={manager.openCreateDialog}
              disabled={manager.saving || manager.deleting}
            >
              Add Button
            </AppButton>
          }
        />

        {/* Data Table */}
        {manager.error ? (
          <AppEmptyState
            title="Failed to load buttons"
            message="Something went wrong while loading the button list."
            actionLabel="Retry"
            onAction={manager.refresh}
          />
        ) : (
          <AppDataTable
            rows={manager.buttons || []}
            columns={columns}
            loading={manager.loading}
            getRowId={(row) => getButtonId(row)}
            page={(manager.pagination.page || 1) - 1}
            rowsPerPage={manager.pagination.pageSize || 10}
            totalRows={manager.pagination.totalCount || 0}
            onPageChange={(event, newPage) => {
              manager.changePage(Number(newPage) + 1);
            }}
            onRowsPerPageChange={(event) => {
              manager.changePageSize(Number(event.target.value));
            }}
          />
        )}
      </Stack>

      {/* Create / Edit Dialog */}
      <ButtonDialog
        open={manager.dialogState.open}
        mode={manager.dialogState.mode}
        button={manager.dialogState.selectedButton}
        lookups={manager.lookups}
        loading={manager.saving}
        onClose={manager.closeDialog}
        onSave={manager.saveButton}
      />

      {/* Delete Dialog */}
      <ButtonDeleteDialog
        open={manager.deleteState.open}
        button={manager.deleteState.selectedButton}
        loading={manager.deleting}
        onClose={manager.closeDeleteDialog}
        onConfirm={manager.confirmDeleteButton}
      />
    </Box>
  );
}