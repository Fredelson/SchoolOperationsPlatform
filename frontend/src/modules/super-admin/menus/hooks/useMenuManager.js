// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useMenuManager Hook
// ============================================
//
// Purpose:
// Handles Menu Manager state, loading, pagination,
// filters, dialogs, CRUD actions, visibility actions,
// and SQL-friendly payload formatting.
//
// Architecture:
// MenuManager.jsx -> useMenuManager -> menuApi
// ============================================

import { useCallback, useEffect, useMemo, useState } from "react";

import { menuApi } from "../api/menuApi";

// ============================================
// Row Helpers
// ============================================

export function getMenuId(row) {
  return row?.menuId ?? row?.MenuId ?? row?.id;
}

export function getMenuName(row) {
  return row?.menuName ?? row?.MenuName ?? "";
}

export function getMenuKey(row) {
  return row?.menuKey ?? row?.MenuKey ?? "";
}

export function getMenuVisibilityKey(row) {
  return (
    row?.visibilityStatusKey ??
    row?.VisibilityStatusKey ??
    row?.visibilityKey ??
    row?.VisibilityKey ??
    row?.VisibilityName ??
    row?.visibilityName ??
    "Enabled"
  );
}

// ============================================
// Default State
// ============================================

const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  visibility: "all",
};

const DEFAULT_FORM_VALUES = {
  menuName: "",
  menuKey: "",
  moduleId: "",
  workspaceId: "",
  parentMenuId: "",
  route: "",
  icon: "",
  badgeQueryKey: "",
  permissionId: "",
  featureFlagId: "",
  visibilityStatusKey: "Enabled",
  sortOrder: 0,
  isPinned: false,
  isCollapsible: false,
};

// ============================================
// Payload Helpers
// ============================================

function toNullableNumber(value) {
  if (value === "" || value === undefined || value === null) return null;
  return Number(value);
}

function toNumber(value, fallback = 0) {
  if (value === "" || value === undefined || value === null) return fallback;
  return Number(value);
}

function normalizeMenuPayload(values = {}) {
  return {
    ...values,

    menuName: values.menuName?.trim() || "",
    menuKey: values.menuKey?.trim() || "",

    moduleId: toNullableNumber(values.moduleId),
    workspaceId: toNullableNumber(values.workspaceId),
    parentMenuId: toNullableNumber(values.parentMenuId),
    permissionId: toNullableNumber(values.permissionId),
    featureFlagId: toNullableNumber(values.featureFlagId),

    route: values.route?.trim() || null,
    icon: values.icon?.trim() || null,
    badgeQueryKey: values.badgeQueryKey?.trim() || null,

    sortOrder: toNumber(values.sortOrder, 0),

    isPinned: Boolean(values.isPinned),
    isCollapsible: Boolean(values.isCollapsible),

    visibilityStatusKey: values.visibilityStatusKey || "Enabled",
  };
}

function unwrapRows(response) {
  return (
    response?.data?.data ??
    response?.data?.items ??
    response?.data?.menus ??
    response?.data?.rows ??
    response?.items ??
    response?.menus ??
    response?.rows ??
    response?.data ??
    []
  );
}

function unwrapTotal(response, rows) {
  return (
    response?.data?.totalRecords ??
    response?.data?.total ??
    response?.data?.pagination?.totalRecords ??
    response?.totalRecords ??
    response?.total ??
    response?.pagination?.totalRecords ??
    rows.length
  );
}

// ============================================
// Hook
// ============================================

export function useMenuManager() {
  const [menus, setMenus] = useState([]);
  const [kpis, setKpis] = useState([]);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);

  // ==========================================
  // Query Params
  // ==========================================

  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      search: filters.search,
      status: filters.status,
      visibility: filters.visibility,
    }),
    [page, pageSize, filters]
  );

  // ==========================================
  // Load Menus
  // ==========================================

  const fetchMenus = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await menuApi.getAll(queryParams);

    const payload = response?.data ?? response;

    const rows =
      payload?.data ??
      payload?.menus ??
      payload?.rows ??
      payload?.items ??
      [];

    const total =
      payload?.totalRecords ??
      payload?.totalRows ??
      payload?.total ??
      payload?.pagination?.totalRecords ??
      payload?.pagination?.totalRows ??
      payload?.pagination?.total ??
      rows.length;

    setMenus(Array.isArray(rows) ? rows : []);
    setTotalRecords(Number(total) || rows.length);
  } catch (err) {
    console.error("Failed to load menus:", err);
    setError("Failed to load menus.");
  } finally {
    setLoading(false);
  }
}, [queryParams]);

  // ==========================================
  // Load KPIs
  // ==========================================

  const fetchKpis = useCallback(async () => {
    try {
      if (!menuApi.getKpis) return;

      const response = await menuApi.getKpis();
      setKpis(response?.data ?? response ?? []);
    } catch (err) {
      console.error("Failed to load menu KPIs:", err);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  // ==========================================
  // Filters
  // ==========================================

  function handleFilterChange(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));

    setPage(1);
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  // ==========================================
  // Form Dialog
  // ==========================================

  function openCreateDialog() {
    setFormMode("create");
    setSelectedMenu(null);
    setFormValues(DEFAULT_FORM_VALUES);
    setFormOpen(true);
  }

  function openEditDialog(menu) {
    setFormMode("edit");
    setSelectedMenu(menu);

    setFormValues({
      menuId: menu.menuId ?? menu.MenuId,
      menuName: menu.menuName ?? menu.MenuName ?? "",
      menuKey: menu.menuKey ?? menu.MenuKey ?? "",
      moduleId: menu.moduleId ?? menu.ModuleId ?? "",
      workspaceId: menu.workspaceId ?? menu.WorkspaceId ?? "",
      parentMenuId: menu.parentMenuId ?? menu.ParentMenuId ?? "",
      route: menu.route ?? menu.Route ?? "",
      icon: menu.icon ?? menu.Icon ?? "",
      badgeQueryKey: menu.badgeQueryKey ?? menu.BadgeQueryKey ?? "",
      permissionId: menu.permissionId ?? menu.PermissionId ?? "",
      featureFlagId: menu.featureFlagId ?? menu.FeatureFlagId ?? "",
      visibilityStatusKey:
        menu.visibilityStatusKey ??
        menu.VisibilityStatusKey ??
        menu.visibilityKey ??
        menu.VisibilityKey ??
        "Enabled",
      sortOrder: menu.sortOrder ?? menu.SortOrder ?? 0,
      isPinned: Boolean(menu.isPinned ?? menu.IsPinned),
      isCollapsible: Boolean(menu.isCollapsible ?? menu.IsCollapsible),
    });

    setFormOpen(true);
  }

  function closeFormDialog() {
    if (saving) return;

    setFormOpen(false);
    setSelectedMenu(null);
    setFormValues(DEFAULT_FORM_VALUES);
  }

  function handleFormChange(key, value) {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  // ==========================================
  // Create / Update
  // ==========================================

  async function submitForm(externalValues) {
    try {
      setSaving(true);
      setError(null);

      const sourceValues = externalValues ?? formValues;
      const payload = normalizeMenuPayload(sourceValues);

      let result;

      if (formMode === "edit") {
        const menuId =
          selectedMenu?.menuId ??
          selectedMenu?.MenuId ??
          sourceValues.menuId;

        result = await menuApi.update(menuId, payload);
      } else {
        result = await menuApi.create(payload);
      }

      setNotification({
        type: "success",
        message:
          formMode === "edit"
            ? "Menu updated successfully."
            : "Menu created successfully.",
      });

      setFormOpen(false);
      setSelectedMenu(null);
      setFormValues(DEFAULT_FORM_VALUES);

      await fetchMenus();
      await fetchKpis();

      return { success: true, data: result };
    } catch (err) {
      console.error("Failed to save menu:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save menu.";

      setNotification({ type: "error", message });

      return { success: false, message, error: err };
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // Delete
  // ==========================================

  function openDeleteDialog(menu) {
    setSelectedMenu(menu);
    setDeleteOpen(true);
  }

  function closeDeleteDialog() {
    if (saving) return;

    setSelectedMenu(null);
    setDeleteOpen(false);
  }

  async function confirmDelete(menu = null) {
    try {
      setSaving(true);

      const targetMenu = menu ?? selectedMenu;
      const menuId = getMenuId(targetMenu) ?? targetMenu;

      if (!menuId) {
        throw new Error("Menu ID is required for delete.");
      }

      let result;

      if (menuApi.remove) {
        result = await menuApi.remove(menuId);
      } else if (menuApi.delete) {
        result = await menuApi.delete(menuId);
      } else if (menuApi.deleteMenu) {
        result = await menuApi.deleteMenu(menuId);
      } else {
        throw new Error("No delete method found in menuApi.");
      }

      setNotification({
        type: "success",
        message: "Menu deleted successfully.",
      });

      setDeleteOpen(false);
      setSelectedMenu(null);

      await fetchMenus();
      await fetchKpis();

      return { success: true, data: result };
    } catch (err) {
      console.error("Failed to delete menu:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to delete menu.";

      setNotification({ type: "error", message });

      return { success: false, message, error: err };
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // Visibility Actions
  // ==========================================

  async function showMenu(menu) {
    try {
      setSaving(true);

      const menuId = getMenuId(menu);

      if (!menuId) {
        throw new Error("Menu ID is required for show action.");
      }

      let result;

      if (menuApi.show) {
        result = await menuApi.show(menuId);
      } else if (menuApi.showMenu) {
        result = await menuApi.showMenu(menuId);
      } else if (menuApi.updateVisibility) {
        result = await menuApi.updateVisibility(menuId, "Enabled");
      } else if (menuApi.update) {
        result = await menuApi.update(menuId, {
          ...menu,
          visibilityStatusKey: "Enabled",
        });
      } else {
        throw new Error("No show method found in menuApi.");
      }

      setNotification({
        type: "success",
        message: "Menu shown successfully.",
      });

      await fetchMenus();
      await fetchKpis();

      return { success: true, data: result };
    } catch (err) {
      console.error("Failed to show menu:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to show menu.";

      setNotification({ type: "error", message });

      return { success: false, message, error: err };
    } finally {
      setSaving(false);
    }
  }

  async function hideMenu(menu) {
    try {
      setSaving(true);

      const menuId = getMenuId(menu);

      if (!menuId) {
        throw new Error("Menu ID is required for hide action.");
      }

      let result;

      if (menuApi.hide) {
        result = await menuApi.hide(menuId);
      } else if (menuApi.hideMenu) {
        result = await menuApi.hideMenu(menuId);
      } else if (menuApi.updateVisibility) {
        result = await menuApi.updateVisibility(menuId, "Hidden");
      } else if (menuApi.update) {
        result = await menuApi.update(menuId, {
          ...menu,
          visibilityStatusKey: "Hidden",
        });
      } else {
        throw new Error("No hide method found in menuApi.");
      }

      setNotification({
        type: "success",
        message: "Menu hidden successfully.",
      });

      await fetchMenus();
      await fetchKpis();

      return { success: true, data: result };
    } catch (err) {
      console.error("Failed to hide menu:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to hide menu.";

      setNotification({ type: "error", message });

      return { success: false, message, error: err };
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // Notifications
  // ==========================================

  function clearNotification() {
    setNotification(null);
  }

  // ==========================================
  // Public API
  // ==========================================

  return {
    menus,
    kpis,

    filters,
    page,
    pageSize,
    totalRecords,

    pagination: {
      page,
      pageSize,
      totalRecords,
      rowsPerPage: pageSize,
      totalRows: totalRecords,
    },

    loading,
    saving,
    error,
    notification,

    formOpen,
    formMode,
    formValues,

    deleteOpen,
    selectedMenu,

    setPage,
    setPageSize,

    handleFilterChange,
    resetFilters,

    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    handleFormChange,

    submitForm,

    createMenu: submitForm,
    updateMenu: submitForm,

    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    deleteMenu: confirmDelete,

    showMenu,
    hideMenu,

    fetchMenus,
    clearNotification,
  };
}