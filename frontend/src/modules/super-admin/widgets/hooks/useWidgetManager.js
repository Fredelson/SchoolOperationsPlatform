// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useWidgetManager Hook
// ============================================
//
// Purpose:
// Handles Widget Manager page state,
// live widget loading, lookups, statistics,
// toolbar filters, pagination, and widget CRUD.
//
// Architecture:
// WidgetManager.jsx -> useWidgetManager -> widgetService -> widgetApi
// ============================================

import { useCallback, useEffect, useState } from "react";

import { widgetService } from "../services/widgetService";
import { mapWidgetFromApi, getWidgetId } from "../utils/widgetMapper";

import useAppNotification from "@platform/ui/feedback/useAppNotification";

// ============================================
// Default Filters
// ============================================

const DEFAULT_FILTERS = {
  search: "",
  moduleId: "",
  visibilityStatusId: "",
};

// ============================================
// Default Pagination
// ============================================
//
// AppDataTable uses zero-based page index.
// Backend uses one-based page index.
// ============================================

const DEFAULT_PAGINATION = {
  page: 0,
  rowsPerPage: 10,
  totalRows: 0,
};

// ============================================
// Default Statistics
// ============================================

const DEFAULT_STATISTICS = {
  TotalWidgets: 0,
  VisibleWidgets: 0,
  PermissionProtectedWidgets: 0,
  FeatureControlledWidgets: 0,
};

// ============================================
// Hook
// ============================================

export function useWidgetManager() {
  // ==========================================
  // Platform Notifications
  // ==========================================

  const notification = useAppNotification();

  // ==========================================
  // State
  // ==========================================

  const [widgets, setWidgets] = useState([]);
  const [lookups, setLookups] = useState({
    modules: [],
    permissions: [],
    featureFlags: [],
    visibilityStatuses: [],
  });

  const [filters, setFiltersState] = useState(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [statistics, setStatistics] = useState(DEFAULT_STATISTICS);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================
  // Load Widgets
  // ==========================================
  //
  // Converts frontend zero-based page index into
  // backend one-based page number.
  // ==========================================

  const fetchWidgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await widgetService.getWidgets({
        page: pagination.page + 1,
        pageSize: pagination.rowsPerPage,
        search: filters.search || "",
        moduleId: filters.moduleId || "",
        visibilityStatusId: filters.visibilityStatusId || "",
      });

      const payload = response?.data ? response : response || {};

      const widgetRows =
        payload?.data ||
        payload?.items ||
        payload?.widgets ||
        payload?.result ||
        payload?.recordset ||
        [];

      setWidgets(Array.isArray(widgetRows) ? widgetRows.map(mapWidgetFromApi) : []);

      setPagination((previous) => ({
        ...previous,
        totalRows:
          payload?.pagination?.totalCount ??
          payload?.totalRows ??
          payload?.data?.totalRows ??
          widgetRows.length ??
          0,
      }));

      setStatistics(payload?.statistics || DEFAULT_STATISTICS);
    } catch (err) {
      console.error("Failed to load widgets:", err);
      setError(err);
      setWidgets([]);

      notification.showError("Failed to load widgets.");
    } finally {
      setLoading(false);
    }
  }, [
    filters.search,
    filters.moduleId,
    filters.visibilityStatusId,
    pagination.page,
    pagination.rowsPerPage,
    notification,
  ]);

  // ==========================================
  // Load Widget Lookups
  // ==========================================

  const fetchLookups = useCallback(async () => {
    try {
      const response = await widgetService.getWidgetLookups();

      const payload = response?.data || {};

      setLookups({
        modules: payload.modules || [],
        permissions: payload.permissions || [],
        featureFlags: payload.featureFlags || [],
        visibilityStatuses: payload.visibilityStatuses || [],
      });
    } catch (err) {
      console.error("Failed to load widget lookups:", err);

      notification.showError("Failed to load widget lookups.");
    }
  }, [notification]);

  // ==========================================
  // Pagination Handlers
  // ==========================================

  const handlePageChange = useCallback((event, newPage) => {
    setPagination((previous) => ({
      ...previous,
      page: newPage,
    }));
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setPagination((previous) => ({
      ...previous,
      page: 0,
      rowsPerPage: Number(event.target.value),
    }));
  }, []);

  // ==========================================
  // Filter Handler
  // ==========================================

  const setFilters = useCallback((updater) => {
    setFiltersState((previous) => {
      const nextFilters =
        typeof updater === "function" ? updater(previous) : updater;

      return nextFilters;
    });

    setPagination((previous) => ({
      ...previous,
      page: 0,
    }));
  }, []);

  // ==========================================
  // Create Widget
  // ==========================================

  const createWidget = useCallback(
    async (payload) => {
      try {
        setSaving(true);
        setError(null);

        await widgetService.createWidget(payload);
        await fetchWidgets();

        notification.showSuccess("Widget created successfully.");

        return { success: true };
      } catch (err) {
        console.error("Failed to create widget:", err);
        setError(err);

        notification.showError(
          err?.response?.data?.message || "Failed to create widget."
        );

        return {
          success: false,
          error: err,
        };
      } finally {
        setSaving(false);
      }
    },
    [fetchWidgets, notification]
  );

  // ==========================================
  // Update Widget
  // ==========================================

  const updateWidget = useCallback(
    async (widgetId, payload) => {
      try {
        setSaving(true);
        setError(null);

        await widgetService.updateWidget(widgetId, payload);
        await fetchWidgets();

        notification.showSuccess("Widget updated successfully.");

        return { success: true };
      } catch (err) {
        console.error("Failed to update widget:", err);
        setError(err);

        notification.showError(
          err?.response?.data?.message || "Failed to update widget."
        );

        return {
          success: false,
          error: err,
        };
      } finally {
        setSaving(false);
      }
    },
    [fetchWidgets, notification]
  );

  // ==========================================
  // Delete Widget
  // ==========================================

  const deleteWidget = useCallback(
    async (widgetItem) => {
      try {
        setSaving(true);
        setError(null);

        const widgetId = getWidgetId(widgetItem);

        if (!widgetId) {
          throw new Error("Widget ID is missing.");
        }

        await widgetService.deleteWidget(widgetId);
        await fetchWidgets();

        notification.showSuccess("Widget deleted successfully.");

        return { success: true };
      } catch (err) {
        console.error("Failed to delete widget:", err);
        setError(err);

        notification.showError(
          err?.response?.data?.message || "Failed to delete widget."
        );

        return {
          success: false,
          error: err,
        };
      } finally {
        setSaving(false);
      }
    },
    [fetchWidgets, notification]
  );

  // ==========================================
  // Initial Load
  // ==========================================

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  // ==========================================
  // Return API
  // ==========================================

  return {
    widgets,
    filteredWidgets: widgets,
    lookups,
    statistics,

    loading,
    saving,
    error,

    filters,
    setFilters,

    pagination,
    handlePageChange,
    handleRowsPerPageChange,

    fetchWidgets,
    refreshWidgets: fetchWidgets,

    createWidget,
    updateWidget,
    deleteWidget,
  };
}