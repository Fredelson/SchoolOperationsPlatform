// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useModuleManager Hook
// ============================================
//
// Purpose:
// Handles Module Manager page state,
// live module loading, KPI calculation,
// toolbar filters, pagination, and module CRUD actions.
//
// Architecture:
// ModuleManager.jsx -> useModuleManager -> moduleApi
// ============================================

import { useCallback, useEffect, useMemo, useState } from "react";

import { moduleApi } from "../api/moduleApi";

import useAppNotification from "@platform/ui/feedback/useAppNotification";

// ============================================
// Default Filters
// ============================================

const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  visibility: "all",
};

// ============================================
// Default Pagination
// ============================================

const DEFAULT_PAGINATION = {
  page: 0,
  rowsPerPage: 10,
  totalRows: 0,
};

// ============================================
// Helpers
// ============================================

function getBool(row, camelKey, sqlKey) {
  return Boolean(row?.[camelKey] ?? row?.[sqlKey]);
}

function getModuleId(moduleItem) {
  return moduleItem?.moduleId ?? moduleItem?.ModuleId;
}

function normalizeKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function mapStatusToIsActive(status) {
  if (status === "active") return true;
  if (status === "inactive") return false;

  return "";
}

function mapVisibilityToStatusKey(visibility) {
  if (visibility === "visible") return "enabled";
  if (visibility === "hidden") return "hidden";

  return "";
}

// ============================================
// Visibility Helper
// ============================================
//
// IMPORTANT:
// Do not use Boolean(visibilityStatusId).
// SQL value 2 means Hidden, but Boolean(2) is true in JavaScript.
// ============================================

export function isModuleVisible(moduleItem) {
  const statusId = Number(
    moduleItem?.visibilityStatusId ?? moduleItem?.VisibilityStatusId
  );

  const statusKey = normalizeKey(
    moduleItem?.visibilityStatusKey ?? moduleItem?.VisibilityStatusKey
  );

  if (statusId === 1) return true;
  if (statusId === 2) return false;

  if (statusKey === "enabled") return true;
  if (statusKey === "hidden") return false;

  return false;
}

export function getModuleVisibilityKey(moduleItem) {
  return isModuleVisible(moduleItem) ? "enabled" : "hidden";
}

// ============================================
// Hook
// ============================================

export function useModuleManager() {
  // ==========================================
  // State
  // ==========================================

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  // ==========================================
  // Platform Notifications
  // ==========================================

  const notification = useAppNotification();

  // ==========================================
  // Load Modules
  // ==========================================

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await moduleApi.getAll({
        page: pagination.page + 1,
        pageSize: pagination.rowsPerPage,
        search: filters.search || "",
        isActive: mapStatusToIsActive(filters.status),
        statusKey: mapVisibilityToStatusKey(filters.visibility),
      });

      const payload = response?.data || response;

      const moduleRows =
        payload?.items ||
        payload?.data?.items ||
        payload?.modules ||
        payload?.result ||
        payload?.recordset ||
        [];

      setModules(Array.isArray(moduleRows) ? moduleRows : []);

      setPagination((previous) => ({
        ...previous,
        totalRows:
          payload?.totalRows ??
          payload?.data?.totalRows ??
          moduleRows.length ??
          0,
      }));
    } catch (err) {
      console.error("Failed to load modules:", err);
      setError(err);
      setModules([]);

      notification.showError("Failed to load modules.");
    } finally {
      setLoading(false);
    }
  }, [
    filters.search,
    filters.status,
    filters.visibility,
    pagination.page,
    pagination.rowsPerPage,
    notification,
  ]);

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

  const updateFilters = useCallback((updater) => {
    setFilters((previous) => {
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
  // Create Module
  // ==========================================

  const createModule = useCallback(
    async (payload) => {
      try {
        setSaving(true);
        setError(null);

        await moduleApi.create(payload);
        await fetchModules();

        notification.showSuccess("Module created successfully.");

        return {
          success: true,
        };
      } catch (err) {
        console.error("Failed to create module:", err);
        setError(err);

        notification.showError("Failed to create module.");

        return {
          success: false,
          error: err,
        };
      } finally {
        setSaving(false);
      }
    },
    [fetchModules, notification]
  );

  // ==========================================
  // Update Module
  // ==========================================

  const updateModule = useCallback(
    async (moduleId, payload) => {
      try {
        setSaving(true);
        setError(null);

        await moduleApi.update(moduleId, payload);
        await fetchModules();

        notification.showSuccess("Module updated successfully.");

        return {
          success: true,
        };
      } catch (err) {
        console.error("Failed to update module:", err);
        setError(err);

        notification.showError("Failed to update module.");

        return {
          success: false,
          error: err,
        };
      } finally {
        setSaving(false);
      }
    },
    [fetchModules, notification]
  );

  // ==========================================
  // Activate Module
  // ==========================================

  const activateModule = useCallback(
    async (moduleItem) => {
      try {
        setSaving(true);
        setError(null);

        const moduleId = getModuleId(moduleItem);

        if (!moduleId) {
          throw new Error("Module ID is missing.");
        }

        await moduleApi.activate(moduleId);
        await fetchModules();

        notification.showSuccess("Module activated successfully.");

        return {
          success: true,
        };
      } catch (err) {
        console.error("Failed to activate module:", err);
        setError(err);

        notification.showError("Failed to activate module.");

        return {
          success: false,
          error: err,
        };
      } finally {
        setSaving(false);
      }
    },
    [fetchModules, notification]
  );

  // ==========================================
  // Deactivate Module
  // ==========================================

  const deactivateModule = useCallback(
    async (moduleItem) => {
      try {
        setSaving(true);
        setError(null);

        const moduleId = getModuleId(moduleItem);

        if (!moduleId) {
          throw new Error("Module ID is missing.");
        }

        await moduleApi.deactivate(moduleId);
        await fetchModules();

        notification.showSuccess("Module deactivated successfully.");

        return {
          success: true,
        };
      } catch (err) {
        console.error("Failed to deactivate module:", err);
        setError(err);

        notification.showError("Failed to deactivate module.");

        return {
          success: false,
          error: err,
        };
      } finally {
        setSaving(false);
      }
    },
    [fetchModules, notification]
  );

  // ==========================================
  // Delete Module
  // ==========================================

  const deleteModule = useCallback(
    async (moduleItem) => {
      try {
        setSaving(true);
        setError(null);

        const moduleId = getModuleId(moduleItem);

        if (!moduleId) {
          throw new Error("Module ID is missing.");
        }

        await moduleApi.remove(moduleId);
        await fetchModules();

        notification.showSuccess("Module deleted successfully.");

        return {
          success: true,
        };
      } catch (err) {
        console.error("Failed to delete module:", err);
        setError(err);

        notification.showError("Failed to delete module.");

        return {
          success: false,
          error: err,
        };
      } finally {
        setSaving(false);
      }
    },
    [fetchModules, notification]
  );

  // ==========================================
  // Initial Load
  // ==========================================

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // ==========================================
  // KPI Calculation
  // ==========================================

  const kpis = useMemo(() => {
    const totalModules = pagination.totalRows;

    const activeModules = modules.filter((moduleItem) =>
      getBool(moduleItem, "isActive", "IsActive")
    ).length;

    const inactiveModules = modules.length - activeModules;

    const visibleModules = modules.filter((moduleItem) =>
      isModuleVisible(moduleItem)
    ).length;

    return {
      totalModules,
      activeModules,
      inactiveModules,
      visibleModules,
    };
  }, [modules, pagination.totalRows]);

  // ==========================================
  // Return API
  // ==========================================

  return {
    modules,
    filteredModules: modules,
    kpis,

    loading,
    saving,
    error,

    filters,
    setFilters: updateFilters,

    pagination,
    handlePageChange,
    handleRowsPerPageChange,

    fetchModules,
    refreshModules: fetchModules,

    createModule,
    updateModule,
    activateModule,
    deactivateModule,
    deleteModule,

    // Visibility helpers for ModuleManager.jsx / moduleColumns.jsx
    isModuleVisible,
    getModuleVisibilityKey,
  };
}