// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Super Admin - Feature Flag Manager
// ============================================

import { Add } from "@mui/icons-material";
import { Box, MenuItem, Stack, TextField, Typography } from "@mui/material";

import usePageTitle from "@platform/hooks/usePageTitle";
import AppButton from "@platform/ui/AppButton";
import AppToolbar from "@platform/ui/AppToolbar";
import AppDataTable from "@platform/ui/AppDataTable";

import { CrudDeleteDialog } from "@platform/crud";

import FeatureFlagStatsCards from "../cards/FeatureFlagStatsCards";
import FeatureFlagDialog from "../dialogs/FeatureFlagDialog";
import FeatureFlagViewDialog from "../dialogs/FeatureFlagViewDialog";

import { useFeatureFlagManager } from "../hooks/useFeatureFlagManager";
import { getFeatureFlagColumns } from "../columns/featureFlagColumns.jsx";

// ============================================
// Helpers
// ============================================

function getFeatureFlagId(row) {
  return row?.FeatureFlagId ?? row?.featureFlagId ?? row?.id;
}

function getFeatureFlagName(row) {
  return row?.FeatureName ?? row?.featureName ?? "this feature flag";
}

// ============================================
// Component
// ============================================

export default function FeatureFlagManager() {
  usePageTitle("AUS | Feature Flag Manager");

  const manager = useFeatureFlagManager();

  const columns = getFeatureFlagColumns({
    onView: manager.openViewDialog,
    onEdit: manager.openEditDialog,
    onDelete: manager.openDeleteDialog,
  });

  return (
    <Box>
      <Stack spacing={3}>
        {/* Page Header */}
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Feature Flag Manager
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage platform feature flags, enabled states, module ownership, and
            visibility status.
          </Typography>
        </Box>

        {/* KPI Cards */}
        <FeatureFlagStatsCards
          featureFlags={manager.featureFlags}
          pagination={manager.pagination}
        />

        {/* Toolbar */}
        <AppToolbar
          left={
            <>
              <TextField
                size="small"
                label="Search Feature Flags"
                placeholder="Search by name, key, module..."
                value={manager.search}
                onChange={(event) => {
                  manager.setSearch(event.target.value);
                  manager.setPage(1);
                }}
                disabled={manager.saving}
                sx={{ minWidth: { xs: "100%", sm: 280 } }}
              />

              <TextField
                select
                size="small"
                label="Module"
                value={manager.moduleId}
                onChange={(event) => {
                  manager.setModuleId(event.target.value);
                  manager.setPage(1);
                }}
                disabled={manager.saving}
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
              >
                <MenuItem value="">All Modules</MenuItem>

                {(manager.lookups.modules || []).map((module) => (
                  <MenuItem key={module.ModuleId} value={module.ModuleId}>
                    {module.ModuleName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Visibility"
                value={manager.visibilityStatusId}
                onChange={(event) => {
                  manager.setVisibilityStatusId(event.target.value);
                  manager.setPage(1);
                }}
                disabled={manager.saving}
                sx={{ minWidth: { xs: "100%", sm: 180 } }}
              >
                <MenuItem value="">All Visibility</MenuItem>

                {(manager.lookups.visibilityStatuses || []).map((status) => (
                  <MenuItem
                    key={status.VisibilityStatusId}
                    value={status.VisibilityStatusId}
                  >
                    {status.StatusName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Enabled"
                value={manager.isEnabled}
                onChange={(event) => {
                  manager.setIsEnabled(event.target.value);
                  manager.setPage(1);
                }}
                disabled={manager.saving}
                sx={{ minWidth: { xs: "100%", sm: 160 } }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="true">Enabled</MenuItem>
                <MenuItem value="false">Disabled</MenuItem>
              </TextField>
            </>
          }
          right={
            <AppButton
              variant="contained"
              startIcon={<Add />}
              onClick={manager.openCreateDialog}
              disabled={manager.saving}
            >
              Add Feature Flag
            </AppButton>
          }
        />

        {/* Data Table */}
        <AppDataTable
          rows={manager.featureFlags || []}
          columns={columns}
          loading={manager.loading}
          getRowId={(row) => getFeatureFlagId(row)}
          page={(manager.pagination?.page || 1) - 1}
          rowsPerPage={manager.pagination?.limit || 10}
          totalRows={manager.pagination?.total || 0}
          onPageChange={(event, newPage) => {
            manager.setPage(Number(newPage) + 1);
          }}
          onRowsPerPageChange={(event) => {
            manager.setLimit(Number(event.target.value));
            manager.setPage(1);
          }}
          emptyTitle="No feature flags found"
          emptyMessage="Create your first feature flag to control platform features dynamically."
        />
      </Stack>

      {/* Create/Edit Dialog */}
      <FeatureFlagDialog
        open={manager.dialogOpen}
        featureFlag={manager.selectedFeatureFlag}
        lookups={manager.lookups}
        saving={manager.saving}
        onClose={() => manager.setDialogOpen(false)}
        onSave={manager.handleSave}
      />

      {/* View Dialog */}
      <FeatureFlagViewDialog
        open={manager.viewDialogOpen}
        featureFlag={manager.selectedFeatureFlag}
        onClose={() => manager.setViewDialogOpen(false)}
      />

      {/* Delete Dialog */}
      <CrudDeleteDialog
        open={manager.confirmOpen}
        title="Delete Feature Flag"
        itemName={getFeatureFlagName(manager.selectedFeatureFlag)}
        loading={manager.saving}
        onCancel={() => manager.setConfirmOpen(false)}
        onConfirm={manager.handleDelete}
      />
    </Box>
  );
}