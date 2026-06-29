// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useModuleManager Hook
// ============================================
//
// Purpose:
// Handles Module Manager page state,
// live module loading, KPI calculation,
// and Phase 2 toolbar filter state.
// ============================================

import { useCallback, useEffect, useMemo, useState } from "react";

import { moduleApi } from "../api/moduleApi";

// ============================================
// Default Filters
// ============================================

const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  visibility: "all",
};

// ============================================
// Hook
// ============================================

export function useModuleManager() {
  // ==========================================
  // State
  // ==========================================

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

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

      console.log("MODULE API RESPONSE:", response);
      console.log("FIRST MODULE:", moduleRows?.[0]);
      console.log("MODULE COUNT:", moduleRows.length);

      setModules(Array.isArray(moduleRows) ? moduleRows : []);
    } catch (err) {
      console.error("Failed to load modules:", err);
      setError(err);
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
    const totalModules = modules.length;

    const activeModules = modules.filter(
      (moduleItem) => moduleItem.isActive === true
    ).length;

    const inactiveModules = totalModules - activeModules;

    const visibleModules = modules.filter(
      (moduleItem) => moduleItem.visibilityStatusId === 1
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
    kpis,
    loading,
    error,

    filters,
    setFilters,

    fetchModules,
    refreshModules: fetchModules,
  };
}