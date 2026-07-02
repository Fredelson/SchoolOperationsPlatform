// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Super Admin - Widget Manager
// ============================================

import { useState } from "react";
import { Add } from "@mui/icons-material";
import { Box, MenuItem, Stack, TextField, Typography } from "@mui/material";

import usePageTitle from "@platform/hooks/usePageTitle";
import AppButton from "@platform/ui/AppButton";
import AppToolbar from "@platform/ui/AppToolbar";
import AppDataTable from "@platform/ui/AppDataTable";

import WidgetKpiCards from "../cards/WidgetKpiCards";
import WidgetFormDialog from "../dialogs/WidgetFormDialog";
import DeleteWidgetDialog from "../dialogs/DeleteWidgetDialog";
import ViewWidgetDialog from "../dialogs/ViewWidgetDialog";

import { useWidgetManager } from "../hooks/useWidgetManager";
import { getWidgetColumns } from "../columns/widgetColumns";
import {
  getWidgetId,
  getWidgetName,
  mapWidgetFromApi,
  mapWidgetToPayload,
} from "../utils/widgetMapper";

const DEFAULT_FORM = {
  moduleId: "",
  widgetKey: "",
  widgetName: "",
  widgetType: "",
  dataSourceKey: "",
  description: "",
  permissionId: "",
  featureFlagId: "",
  visibilityStatusId: 1,
  defaultWidth: 3,
  defaultHeight: 1,
  sortOrder: 0,
};

export default function WidgetManager() {
  usePageTitle("AUS | Widget Manager");

  const manager = useWidgetManager();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [selectedWidget, setSelectedWidget] = useState(null);

  const [viewOpen, setViewOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState(null);

  const handleAddWidget = () => {
    setSelectedWidget(null);
    setFormMode("create");
    setFormValues(DEFAULT_FORM);
    setFormOpen(true);
  };

  const handleEditWidget = (widget) => {
    const mapped = mapWidgetFromApi(widget);

    setSelectedWidget(mapped);
    setFormMode("edit");
    setFormValues(mapped);
    setFormOpen(true);
  };

  const handleViewWidget = (widget) => {
    setSelectedWidget(widget);
    setViewOpen(true);
  };

  const handleCloseForm = () => {
    if (manager.saving) return;

    setFormOpen(false);
    setSelectedWidget(null);
    setFormValues(DEFAULT_FORM);
  };

  const handleFormChange = (field, value) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmitForm = async () => {
    const payload = mapWidgetToPayload(formValues);

    const result =
      formMode === "edit"
        ? await manager.updateWidget(getWidgetId(selectedWidget), payload)
        : await manager.createWidget(payload);

    if (result.success) {
      handleCloseForm();
    }
  };

  const handleOpenDelete = (widget) => {
    setWidgetToDelete(widget);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    if (manager.saving) return;

    setDeleteOpen(false);
    setWidgetToDelete(null);
  };

  const handleConfirmDelete = async () => {
    const result = await manager.deleteWidget(widgetToDelete);

    if (result.success) {
      handleCloseDelete();
    }
  };

  const columns = getWidgetColumns({
    onView: handleViewWidget,
    onEdit: handleEditWidget,
    onDelete: handleOpenDelete,
    disabled: manager.saving,
  });

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Widget Manager
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage platform dashboard widgets, data sources, visibility,
            permissions, feature flags, and default layout sizes.
          </Typography>
        </Box>

        <WidgetKpiCards statistics={manager.statistics} />

        <AppToolbar
          left={
            <>
              <TextField
                size="small"
                label="Search Widgets"
                placeholder="Search by name, key, type..."
                value={manager.filters.search}
                onChange={(event) =>
                  manager.setFilters((previous) => ({
                    ...previous,
                    search: event.target.value,
                  }))
                }
                disabled={manager.saving}
                sx={{ minWidth: { xs: "100%", sm: 280 } }}
              />

              <TextField
                select
                size="small"
                label="Module"
                value={manager.filters.moduleId}
                onChange={(event) =>
                  manager.setFilters((previous) => ({
                    ...previous,
                    moduleId: event.target.value,
                  }))
                }
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
                value={manager.filters.visibilityStatusId}
                onChange={(event) =>
                  manager.setFilters((previous) => ({
                    ...previous,
                    visibilityStatusId: event.target.value,
                  }))
                }
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
            </>
          }
          right={
            <AppButton
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddWidget}
              disabled={manager.saving}
            >
              Add Widget
            </AppButton>
          }
        />

        <AppDataTable
          rows={manager.widgets}
          columns={columns}
          loading={manager.loading}
          page={(manager.pagination.page || 1) - 1}
          rowsPerPage={manager.pagination.pageSize || 10}
          totalRows={manager.pagination.totalCount || 0}
          onPageChange={manager.handlePageChange}
          onRowsPerPageChange={manager.handleRowsPerPageChange}
          emptyTitle="No widgets found"
          emptyMessage="Create your first platform widget to start building dynamic dashboards."
        />
      </Stack>

      <WidgetFormDialog
        open={formOpen}
        mode={formMode}
        values={formValues}
        lookups={manager.lookups}
        loading={manager.saving}
        onChange={handleFormChange}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
      />

      <ViewWidgetDialog
        open={viewOpen}
        widget={selectedWidget}
        onClose={() => setViewOpen(false)}
      />

      <DeleteWidgetDialog
        open={deleteOpen}
        widgetName={getWidgetName(widgetToDelete)}
        loading={manager.saving}
        onCancel={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}