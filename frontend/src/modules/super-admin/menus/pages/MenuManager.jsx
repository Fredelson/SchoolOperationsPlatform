// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Super Admin
// Menu Manager
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
import { useMenuManager, getMenuId, getMenuVisibilityKey } from "../hooks/useMenuManager";
import { getMenuColumns } from "../columns/menuColumns";

// ============================================
// Filter Options
// ============================================

const VISIBILITY_OPTIONS = [
  { value: "all", label: "All Visibility" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
];

// ============================================
// Default Form State
// ============================================

const DEFAULT_FORM = {
  workspaceId: "",
  moduleId: "",
  parentMenuId: "",
  menuName: "",
  menuKey: "",
  route: "",
  icon: "",
  permissionId: "",
  featureFlagId: "",
  badgeQueryKey: "",
  visibilityStatusKey: "enabled",
  isPinned: false,
  isCollapsible: false,
  sortOrder: 0,
};

// ============================================
// Helpers
// ============================================

function getValue(row, camelKey, sqlKey, fallback = "") {
  return row?.[camelKey] ?? row?.[sqlKey] ?? fallback;
}

function getMenuName(menu) {
  return getValue(menu, "menuName", "MenuName", "this menu");
}

function mapMenuToForm(menu) {
  return {
    workspaceId: getValue(menu, "workspaceId", "WorkspaceId", ""),
    moduleId: getValue(menu, "moduleId", "ModuleId", ""),
    parentMenuId: getValue(menu, "parentMenuId", "ParentMenuId", ""),
    menuName: getValue(menu, "menuName", "MenuName", ""),
    menuKey: getValue(menu, "menuKey", "MenuKey", ""),
    route: getValue(menu, "route", "Route", ""),
    icon: getValue(menu, "icon", "Icon", ""),
    permissionId: getValue(menu, "permissionId", "PermissionId", ""),
    featureFlagId: getValue(menu, "featureFlagId", "FeatureFlagId", ""),
    badgeQueryKey: getValue(menu, "badgeQueryKey", "BadgeQueryKey", ""),
    visibilityStatusKey: getMenuVisibilityKey(menu),
    isPinned: Boolean(getValue(menu, "isPinned", "IsPinned", false)),
    isCollapsible: Boolean(getValue(menu, "isCollapsible", "IsCollapsible", false)),
    sortOrder: getValue(menu, "sortOrder", "SortOrder", 0),
  };
}

function emptyToNull(value) {
  return value === "" || value === undefined ? null : value;
}

function mapFormToPayload(formValues) {
  return {
    workspaceId: emptyToNull(formValues.workspaceId),
    moduleId: Number(formValues.moduleId),
    parentMenuId: emptyToNull(formValues.parentMenuId),
    menuName: formValues.menuName,
    menuKey: formValues.menuKey,
    route: formValues.route || null,
    icon: formValues.icon || null,
    permissionId: emptyToNull(formValues.permissionId),
    featureFlagId: emptyToNull(formValues.featureFlagId),
    badgeQueryKey: formValues.badgeQueryKey || null,
    visibilityStatusKey: formValues.visibilityStatusKey || "enabled",
    isPinned: Boolean(formValues.isPinned),
    isCollapsible: Boolean(formValues.isCollapsible),
    sortOrder: Number(formValues.sortOrder || 0),
  };
}

// ============================================
// Component
// ============================================

export default function MenuManager() {
  usePageTitle("AUS | Menu Manager");

  const manager = useMenuManager();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [selectedMenu, setSelectedMenu] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);

  // ==========================================
  // Filter Handlers
  // ==========================================

  const handleSearchChange = (event) => {
    manager.setFilters((previous) => ({
      ...previous,
      search: event.target.value,
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

  const handleAddMenu = () => {
    setSelectedMenu(null);
    setFormMode("create");
    setFormValues(DEFAULT_FORM);
    setFormOpen(true);
  };

  const handleEditMenu = (menu) => {
    setSelectedMenu(menu);
    setFormMode("edit");
    setFormValues(mapMenuToForm(menu));
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    if (manager.saving) return;

    setFormOpen(false);
    setSelectedMenu(null);
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
        ? await manager.updateMenu(selectedMenu, payload)
        : await manager.createMenu(payload);

    if (result.success) {
      handleCloseForm();
    }
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

    if (result.success) {
      handleCloseDelete();
    }
  };

  // ==========================================
  // Visibility Handlers
  // ==========================================

  const handleShowMenu = async (menu) => {
    await manager.showMenu(menu);
  };

  const handleHideMenu = async (menu) => {
    await manager.hideMenu(menu);
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
  });

  // ==========================================
  // Render
  // ==========================================

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Menu Manager
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage backend-driven sidebar menus, routes, visibility, and access links.
          </Typography>
        </Box>

        <MenuKpiCards kpis={manager.kpis} />

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

        {manager.error ? (
          <AppEmptyState
            title="Failed to load menus"
            message="Something went wrong while loading the menu list."
            actionLabel="Retry"
            onAction={manager.refreshMenus}
          />
        ) : (
          <AppDataTable
            rows={manager.filteredMenus || manager.menus || []}
            columns={columns}
            loading={manager.loading}
            getRowId={(row) => getMenuId(row)}
            page={manager.pagination.page}
            rowsPerPage={manager.pagination.rowsPerPage}
            totalRows={manager.pagination.totalRows}
            onPageChange={manager.handlePageChange}
            onRowsPerPageChange={manager.handleRowsPerPageChange}
          />
        )}
      </Stack>

      <MenuFormDialog
        open={formOpen}
        mode={formMode}
        values={formValues}
        loading={manager.saving}
        onChange={handleFormChange}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
      />

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