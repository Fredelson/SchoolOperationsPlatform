// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useCrudManager
// ============================================
//
// Purpose:
// Shared CRUD state manager for enterprise
// Super Admin management pages.
//
// Used by:
// - Menu Manager
// - Button Manager
// - Widget Manager
// - Future CRUD modules
//
// Rules:
// - No business-specific logic here.
// - Business modules provide API functions,
//   mappers, filters, and notification labels.
// ============================================

import { useCallback, useEffect, useMemo, useState } from "react";

import useAppNotification from "@platform/ui/feedback/useAppNotification";

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

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback ||
    "Something went wrong."
  );
}

function normalizeRows(payload, rowsKey) {
  return (
    payload?.items ||
    payload?.data?.items ||
    payload?.[rowsKey] ||
    payload?.data?.[rowsKey] ||
    payload?.result ||
    payload?.recordset ||
    []
  );
}

function normalizeTotalRows(payload, rows) {
  return (
    payload?.totalRows ??
    payload?.data?.totalRows ??
    payload?.total ??
    payload?.data?.total ??
    rows.length ??
    0
  );
}

// ============================================
// Hook
// ============================================

export function useCrudManager({
  api,
  rowsKey = "items",
  defaultFilters = {},
  defaultPagination = DEFAULT_PAGINATION,
  buildQueryParams,
  getItemId,
  labels = {},
  deriveKpis,
} = {}) {
  const notification = useAppNotification();

  const [rows, setRows] = useState([]);
  const [filters, setFiltersState] = useState(defaultFilters);
  const [pagination, setPagination] = useState(defaultPagination);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const entityLabel = labels.entity || "Record";
  const entityPluralLabel = labels.entityPlural || "Records";

  // ==========================================
  // Load Rows
  // ==========================================

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams =
        typeof buildQueryParams === "function"
          ? buildQueryParams({ filters, pagination })
          : {
              page: pagination.page + 1,
              pageSize: pagination.rowsPerPage,
              ...filters,
            };

      const response = await api.getAll(queryParams);
      const payload = response?.data || response;

      const nextRows = normalizeRows(payload, rowsKey);

      setRows(Array.isArray(nextRows) ? nextRows : []);

      setPagination((previous) => ({
        ...previous,
        totalRows: normalizeTotalRows(payload, nextRows),
      }));
    } catch (err) {
      console.error(`Failed to load ${entityPluralLabel}:`, err);

      setError(err);
      setRows([]);

      notification.showError(
        getErrorMessage(err, `Failed to load ${entityPluralLabel}.`)
      );
    } finally {
      setLoading(false);
    }
  }, [
    api,
    buildQueryParams,
    entityPluralLabel,
    filters,
    notification,
    pagination.page,
    pagination.rowsPerPage,
    rowsKey,
  ]);

  // ==========================================
  // Filters
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
  // Pagination
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
  // Create
  // ==========================================

  const createItem = useCallback(
    async (payload) => {
      try {
        setSaving(true);
        setError(null);

        await api.create(payload);
        await fetchRows();

        notification.showSuccess(`${entityLabel} created successfully.`);

        return { success: true };
      } catch (err) {
        console.error(`Failed to create ${entityLabel}:`, err);
        setError(err);

        notification.showError(
          getErrorMessage(err, `Failed to create ${entityLabel}.`)
        );

        return { success: false, error: err };
      } finally {
        setSaving(false);
      }
    },
    [api, entityLabel, fetchRows, notification]
  );

  // ==========================================
  // Update
  // ==========================================

  const updateItem = useCallback(
    async (itemOrId, payload) => {
      try {
        setSaving(true);
        setError(null);

        const itemId =
          typeof getItemId === "function" ? getItemId(itemOrId) : itemOrId;

        if (!itemId) {
          throw new Error(`${entityLabel} ID is missing.`);
        }

        await api.update(itemId, payload);
        await fetchRows();

        notification.showSuccess(`${entityLabel} updated successfully.`);

        return { success: true };
      } catch (err) {
        console.error(`Failed to update ${entityLabel}:`, err);
        setError(err);

        notification.showError(
          getErrorMessage(err, `Failed to update ${entityLabel}.`)
        );

        return { success: false, error: err };
      } finally {
        setSaving(false);
      }
    },
    [api, entityLabel, fetchRows, getItemId, notification]
  );

  // ==========================================
  // Delete
  // ==========================================

  const deleteItem = useCallback(
    async (itemOrId) => {
      try {
        setSaving(true);
        setError(null);

        const itemId =
          typeof getItemId === "function" ? getItemId(itemOrId) : itemOrId;

        if (!itemId) {
          throw new Error(`${entityLabel} ID is missing.`);
        }

        await api.remove(itemId);
        await fetchRows();

        notification.showSuccess(`${entityLabel} deleted successfully.`);

        return { success: true };
      } catch (err) {
        console.error(`Failed to delete ${entityLabel}:`, err);
        setError(err);

        notification.showError(
          getErrorMessage(err, `Failed to delete ${entityLabel}.`)
        );

        return { success: false, error: err };
      } finally {
        setSaving(false);
      }
    },
    [api, entityLabel, fetchRows, getItemId, notification]
  );

  // ==========================================
  // Custom Action
  // ==========================================

  const runAction = useCallback(
    async ({
      item,
      action,
      successMessage,
      errorMessage,
      getId = getItemId,
    }) => {
      try {
        setSaving(true);
        setError(null);

        const itemId =
          typeof getId === "function" ? getId(item) : item;

        if (!itemId) {
          throw new Error(`${entityLabel} ID is missing.`);
        }

        await action(itemId);
        await fetchRows();

        notification.showSuccess(
          successMessage || `${entityLabel} updated successfully.`
        );

        return { success: true };
      } catch (err) {
        console.error(`Failed to update ${entityLabel}:`, err);
        setError(err);

        notification.showError(
          getErrorMessage(err, errorMessage || `Failed to update ${entityLabel}.`)
        );

        return { success: false, error: err };
      } finally {
        setSaving(false);
      }
    },
    [entityLabel, fetchRows, getItemId, notification]
  );

  // ==========================================
  // Initial Load
  // ==========================================

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  // ==========================================
  // KPI Calculation
  // ==========================================

  const kpis = useMemo(() => {
    if (typeof deriveKpis === "function") {
      return deriveKpis({
        rows,
        filters,
        pagination,
      });
    }

    return {
      total: pagination.totalRows,
    };
  }, [deriveKpis, filters, pagination, rows]);

  // ==========================================
  // Return API
  // ==========================================

  return {
    rows,
    filteredRows: rows,
    kpis,

    loading,
    saving,
    error,

    filters,
    setFilters,

    pagination,
    handlePageChange,
    handleRowsPerPageChange,

    fetchRows,
    refreshRows: fetchRows,

    createItem,
    updateItem,
    deleteItem,
    runAction,
  };
}