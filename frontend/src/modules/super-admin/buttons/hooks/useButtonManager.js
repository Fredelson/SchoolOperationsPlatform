// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Manager Hook
// ============================================
//
// Purpose:
// Handles Button Manager state, loading, pagination,
// filters, CRUD actions, lookups, and notifications.
//
// Rules:
// - No JSX here
// - No table column definitions here
// - No duplicated API logic here
// ============================================

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createButton,
  deleteButton,
  getButtonLookups,
  getButtonStatistics,
  getButtons,
  updateButton,
} from "../api/buttonApi";

import useAppNotification from "@platform/ui/feedback/useAppNotification";

const DEFAULT_FILTERS = {
  search: "",
  moduleId: "",
  visibilityStatusId: "",
};

const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
};

const DEFAULT_DIALOG_STATE = {
  open: false,
  mode: "create",
  selectedButton: null,
};

const DEFAULT_DELETE_STATE = {
  open: false,
  selectedButton: null,
};

export default function useButtonManager() {
  const { showSuccess, showError } = useAppNotification();

  const [buttons, setButtons] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [lookups, setLookups] = useState({
    modules: [],
    permissions: [],
    featureFlags: [],
    visibilityStatuses: [],
  });

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  const [loading, setLoading] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const [dialogState, setDialogState] = useState(DEFAULT_DIALOG_STATE);
  const [deleteState, setDeleteState] = useState(DEFAULT_DELETE_STATE);

  const queryParams = useMemo(
    () => ({
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: filters.search || undefined,
      moduleId: filters.moduleId || undefined,
      visibilityStatusId: filters.visibilityStatusId || undefined,
    }),
    [filters, pagination.page, pagination.pageSize]
  );

  const loadButtons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getButtons(queryParams);

      setButtons(response.data || []);
      setPagination((current) => ({
        ...current,
        ...(response.pagination || DEFAULT_PAGINATION),
      }));
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to load buttons.";

      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [queryParams, showError]);

  const loadStatistics = useCallback(async () => {
    try {
      const response = await getButtonStatistics();
      setStatistics(response.data || null);
    } catch (err) {
      showError(
        err?.response?.data?.message || "Failed to load button statistics."
      );
    }
  }, [showError]);

  const loadLookups = useCallback(async () => {
    try {
      setLookupsLoading(true);

      const response = await getButtonLookups();

      setLookups({
        modules: response.data?.modules || [],
        permissions: response.data?.permissions || [],
        featureFlags: response.data?.featureFlags || [],
        visibilityStatuses: response.data?.visibilityStatuses || [],
      });
    } catch (err) {
      showError(
        err?.response?.data?.message || "Failed to load button lookups."
      );
    } finally {
      setLookupsLoading(false);
    }
  }, [showError]);

  const refresh = useCallback(async () => {
    await Promise.all([loadButtons(), loadStatistics()]);
  }, [loadButtons, loadStatistics]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateFilter = useCallback((name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));

    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  }, []);

  const changePage = useCallback((page) => {
    setPagination((current) => ({
      ...current,
      page,
    }));
  }, []);

  const changePageSize = useCallback((pageSize) => {
    setPagination((current) => ({
      ...current,
      page: 1,
      pageSize,
    }));
  }, []);

  const openCreateDialog = useCallback(() => {
    setDialogState({
      open: true,
      mode: "create",
      selectedButton: null,
    });
  }, []);

  const openEditDialog = useCallback((button) => {
    setDialogState({
      open: true,
      mode: "edit",
      selectedButton: button,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState(DEFAULT_DIALOG_STATE);
  }, []);

  const openDeleteDialog = useCallback((button) => {
    setDeleteState({
      open: true,
      selectedButton: button,
    });
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteState(DEFAULT_DELETE_STATE);
  }, []);

  const saveButton = useCallback(
    async (payload) => {
      try {
        setSaving(true);

        if (dialogState.mode === "edit" && dialogState.selectedButton) {
          await updateButton(dialogState.selectedButton.buttonId, payload);
          showSuccess("Button updated successfully.");
        } else {
          await createButton(payload);
          showSuccess("Button created successfully.");
        }

        closeDialog();
        await refresh();
      } catch (err) {
        showError(err?.response?.data?.message || "Failed to save button.");
      } finally {
        setSaving(false);
      }
    },
    [closeDialog, dialogState, refresh, showError, showSuccess]
  );

  const confirmDeleteButton = useCallback(async () => {
    if (!deleteState.selectedButton) return;

    try {
      setDeleting(true);

      await deleteButton(deleteState.selectedButton.buttonId);

      showSuccess("Button deleted successfully.");
      closeDeleteDialog();
      await refresh();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to delete button.");
    } finally {
      setDeleting(false);
    }
  }, [
    closeDeleteDialog,
    deleteState.selectedButton,
    refresh,
    showError,
    showSuccess,
  ]);

  return {
    buttons,
    statistics,
    lookups,

    filters,
    pagination,

    loading,
    lookupsLoading,
    saving,
    deleting,
    error,

    dialogState,
    deleteState,

    updateFilter,
    resetFilters,
    changePage,
    changePageSize,

    openCreateDialog,
    openEditDialog,
    closeDialog,

    openDeleteDialog,
    closeDeleteDialog,

    saveButton,
    confirmDeleteButton,
    refresh,
  };
}