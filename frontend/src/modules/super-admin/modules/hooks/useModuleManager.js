// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useModuleManager Hook
// ============================================
//
// Purpose:
// Handles Module Manager page state,
// live module loading, KPI calculation,
// toolbar filters, and module CRUD actions.
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
// Helpers
// ============================================

function getBool(row, camelKey, sqlKey) {
  return Boolean(row?.[camelKey] ?? row?.[sqlKey]);
}

function getText(row, camelKey, sqlKey) {
  return String(row?.[camelKey] ?? row?.[sqlKey] ?? "").toLowerCase();
}

function getModuleId(moduleItem) {
  return moduleItem?.moduleId ?? moduleItem?.ModuleId;
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

      const response = await moduleApi.getAll();

      const moduleRows =
        response?.data ||
        response?.modules ||
        response?.result ||
        response?.recordset ||
        response ||
        [];

      setModules(Array.isArray(moduleRows) ? moduleRows : []);
    } catch (err) {
      console.error("Failed to load modules:", err);
      setError(err);
      setModules([]);

      notification.showError("Failed to load modules.");
    } finally {
      setLoading(false);
    }
  }, [notification]);

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
  // Filtered Modules
  // ==========================================

  const filteredModules = useMemo(() => {
    return modules.filter((moduleItem) => {
      const search = filters.search.trim().toLowerCase();

      const moduleName = getText(moduleItem, "moduleName", "ModuleName");
      const moduleKey = getText(moduleItem, "moduleKey", "ModuleKey");
      const baseRoute = getText(moduleItem, "baseRoute", "BaseRoute");

      const isActive = getBool(moduleItem, "isActive", "IsActive");
      const isVisible =
        getBool(moduleItem, "isVisible", "IsVisible") ||
        moduleItem?.visibilityStatusId === 1;

      const matchesSearch =
        !search ||
        moduleName.includes(search) ||
        moduleKey.includes(search) ||
        baseRoute.includes(search);

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active" && isActive) ||
        (filters.status === "inactive" && !isActive);

      const matchesVisibility =
        filters.visibility === "all" ||
        (filters.visibility === "visible" && isVisible) ||
        (filters.visibility === "hidden" && !isVisible);

      return matchesSearch && matchesStatus && matchesVisibility;
    });
  }, [modules, filters]);

  // ==========================================
  // KPI Calculation
  // ==========================================

  const kpis = useMemo(() => {
    const totalModules = modules.length;

    const activeModules = modules.filter((moduleItem) =>
      getBool(moduleItem, "isActive", "IsActive")
    ).length;

    const inactiveModules = totalModules - activeModules;

    const visibleModules = modules.filter(
      (moduleItem) =>
        getBool(moduleItem, "isVisible", "IsVisible") ||
        moduleItem?.visibilityStatusId === 1
    ).length;

    return {
      totalModules,
      activeModules,
      inactiveModules,
      visibleModules,
    };
  }, [modules]);

  // ==========================================
  // Return API
  // ==========================================

  return {
    modules,
    filteredModules,
    kpis,

    loading,
    saving,
    error,

    filters,
    setFilters,

    fetchModules,
    refreshModules: fetchModules,

    createModule,
    updateModule,
    activateModule,
    deactivateModule,
    deleteModule,
  };
}