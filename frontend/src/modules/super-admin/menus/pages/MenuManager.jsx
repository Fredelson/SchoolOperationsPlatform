// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Super Admin - Menu Manager
// ============================================
//
// Purpose:
// Manage backend-driven sidebar menus, routes,
// visibility, permissions, feature flags, and hierarchy.
//
// Architecture:
// MenuManager.jsx -> useMenuManager -> menuApi
//
// Important:
// Form state is now fully owned by useMenuManager.
// Do not create separate local formOpen/formValues state here.
// ============================================

import { useState } from "react";
import { Add } from "@mui/icons-material";
import { Box, MenuItem, Stack, TextField, Typography } from "@mui/material";

import usePageTitle from "@platform/hooks/usePageTitle";
import AppButton from "@platform/ui/AppButton";
import AppToolbar from "@platform/ui/AppToolbar";
import AppDataTable from "@platform/ui/AppDataTable";
import AppEmptyState from "@platform/ui/AppEmptyState";

import { CrudDeleteDialog } from "@platform/crud";

import MenuKpiCards from "../cards/MenuKpiCards";
import MenuFormDialog from "../dialogs/MenuFormDialog";
import {
  useMenuManager,
  getMenuId,
  getMenuVisibilityKey,
} from "../hooks/useMenuManager";
import { getMenuColumns } from "../columns/menuColumns";

// ============================================
// Filter Options
// ============================================

const VISIBILITY_OPTIONS = [
  { value: "all", label: "All Visibility" },
  { value: "Enabled", label: "Enabled" },
  { value: "Hidden", label: "Hidden" },
  { value: "Disabled", label: "Disabled" },
];

// ============================================
// Helpers
// ============================================

function getValue(row, camelKey, sqlKey, fallback = "") {
  return row?.[camelKey] ?? row?.[sqlKey] ?? fallback;
}

function getMenuName(menu) {
  return getValue(menu, "menuName", "MenuName", "this menu");
}

// ============================================
// Component
// ============================================

export default function MenuManager() {
  usePageTitle("AUS | Menu Manager");

  // ==========================================
  // Hook State
  // ==========================================
  //
  // useMenuManager owns:
  // - menu rows
  // - loading/saving
  // - filters
  // - pagination
  // - create/edit dialog state
  // - delete actions
  // ==========================================

  const manager = useMenuManager();

  // ==========================================
  // Delete Dialog State
  // ==========================================
  //
  // Delete dialog can stay local because it only
  // tracks which row is being confirmed for delete.
  // ==========================================

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);

  // ==========================================
  // Filter Handlers
  // ==========================================

  const handleSearchChange = (event) => {
    manager.handleFilterChange("search", event.target.value);
  };

  const handleVisibilityChange = (event) => {
    manager.handleFilterChange("visibility", event.target.value);
  };

  // ==========================================
  // Form Dialog Handlers
  // ==========================================

  const handleAddMenu = () => {
    manager.openCreateDialog();
  };

  const handleEditMenu = (menu) => {
    manager.openEditDialog(menu);
  };

  const handleSubmitForm = async () => {
    await manager.submitForm();
  };

  // ==========================================
  // Delete Dialog Handlers
  // ==========================================

  const handleOpenDelete = (menu) => {
    setMenuToDelete(menu);
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    if (manager.saving) return;

    setDeleteOpen(false);
    setMenuToDelete(null);
  };

  const handleConfirmDelete = async () => {
    const result = await manager.deleteMenu(menuToDelete);

    if (result?.success) {
      handleCloseDelete();
    }
  };

  // ==========================================
  // Visibility Handlers
  // ==========================================
  //
  // These are placeholders until show/hide actions
  // are fully added to useMenuManager.
  // ==========================================

  const handleShowMenu = async (menu) => {
    if (manager.showMenu) {
      await manager.showMenu(menu);
    }
  };

  const handleHideMenu = async (menu) => {
    if (manager.hideMenu) {
      await manager.hideMenu(menu);
    }
  };

  // ==========================================
  // Table Columns
  // ==========================================

  const columns = getMenuColumns({
    onEdit: handleEditMenu,
    onShow: handleShowMenu,
    onHide: handleHideMenu,
    onDelete: handleOpenDelete,
    disabled: manager.saving,
    getVisibilityKey: getMenuVisibilityKey,
  });

  // ==========================================
  // Render
  // ==========================================

  return (
    <Box>
      <Stack spacing={3}>
        {/* Page Header */}
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Menu Manager
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage backend-driven sidebar menus, routes, visibility, and access
            links.
          </Typography>
        </Box>

        {/* KPI Cards */}
        <MenuKpiCards kpis={manager.kpis} />

        {/* Toolbar */}
        <AppToolbar
          left={
            <>
              <TextField
                size="small"
                label="Search Menus"
                placeholder="Search by name, key, route..."
                value={manager.filters?.search || ""}
                onChange={handleSearchChange}
                disabled={manager.saving}
                sx={{ minWidth: { xs: "100%", sm: 280 } }}
              />

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
              onClick={handleAddMenu}
              disabled={manager.saving}
            >
              Add Menu
            </AppButton>
          }
        />

        {/* Data Table */}
        {manager.error ? (
          <AppEmptyState
            title="Failed to load menus"
            message="Something went wrong while loading the menu list."
            actionLabel="Retry"
            onAction={manager.fetchMenus}
          />
        ) : (
          <AppDataTable
            rows={manager.menus || []}
            columns={columns}
            loading={manager.loading}
            getRowId={(row) => getMenuId(row)}
            page={(manager.pagination?.page || 1) - 1}
            rowsPerPage={manager.pagination?.pageSize || 10}
            totalRows={manager.pagination?.totalRecords || 0}
            onPageChange={(event, newPage) => {
              manager.setPage(Number(newPage) + 1);
            }}
            onRowsPerPageChange={(event) => {
              manager.setPageSize(Number(event.target.value));
              manager.setPage(1);
            }}
          />
        )}
      </Stack>

      {/* Create/Edit Dialog */}
      <MenuFormDialog
        open={manager.formOpen}
        mode={manager.formMode}
        values={manager.formValues}
        loading={manager.saving}
        onChange={manager.handleFormChange}
        onClose={manager.closeFormDialog}
        onSubmit={handleSubmitForm}
      />

      {/* Delete Dialog */}
      <CrudDeleteDialog
        open={deleteOpen}
        title="Delete Menu"
        itemName={getMenuName(menuToDelete)}
        loading={manager.saving}
        onCancel={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}