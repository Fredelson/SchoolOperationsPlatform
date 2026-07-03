/* =========================================================
   useFeatureFlagManager Hook
   Purpose:
   Handles Feature Flag Manager state, loading, filters,
   dialogs, CRUD actions, pagination, and notifications.
========================================================= */

import { useEffect, useState } from "react";

import {
  getFeatureFlags,
  getFeatureFlagById,
  createFeatureFlag,
  updateFeatureFlag,
  deleteFeatureFlag,
  getFeatureFlagLookups,
} from "../services/featureFlagService";

export const useFeatureFlagManager = () => {
  const [featureFlags, setFeatureFlags] = useState([]);
  const [lookups, setLookups] = useState({
    modules: [],
    visibilityStatuses: [],
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [search, setSearch] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [visibilityStatusId, setVisibilityStatusId] = useState("");
  const [isEnabled, setIsEnabled] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFeatureFlag, setSelectedFeatureFlag] = useState(null);

  const loadFeatureFlags = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getFeatureFlags({
        search,
        moduleId: moduleId || undefined,
        visibilityStatusId: visibilityStatusId || undefined,
        isEnabled: isEnabled === "" ? undefined : isEnabled,
        page,
        limit,
      });

      setFeatureFlags(result.items || []);
      setPagination(result.pagination || {});
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to load feature flags.";

      setError(message);
      setNotification({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const data = await getFeatureFlagLookups();

      setLookups({
        modules: data?.modules || [],
        visibilityStatuses: data?.visibilityStatuses || [],
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to load feature flag lookups.";

      setNotification({ type: "error", message });
    }
  };

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    loadFeatureFlags();
  }, [search, moduleId, visibilityStatusId, isEnabled, page, limit]);

  const openCreateDialog = () => {
    setSelectedFeatureFlag(null);
    setDialogOpen(true);
  };

  const openEditDialog = async (row) => {
    try {
      const id = row?.FeatureFlagId ?? row?.featureFlagId ?? row?.id;
      const data = await getFeatureFlagById(id);

      setSelectedFeatureFlag(data);
      setDialogOpen(true);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to load feature flag.";

      setNotification({ type: "error", message });
    }
  };

  const openViewDialog = async (row) => {
    try {
      const id = row?.FeatureFlagId ?? row?.featureFlagId ?? row?.id;
      const data = await getFeatureFlagById(id);

      setSelectedFeatureFlag(data);
      setViewDialogOpen(true);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to load feature flag.";

      setNotification({ type: "error", message });
    }
  };

  const openDeleteDialog = (row) => {
    setSelectedFeatureFlag(row);
    setConfirmOpen(true);
  };

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      setError(null);

      let response;

      if (selectedFeatureFlag?.FeatureFlagId) {
        response = await updateFeatureFlag(
          selectedFeatureFlag.FeatureFlagId,
          payload
        );

        setNotification({
          type: "success",
          message: response.message || "Feature flag updated successfully.",
        });
      } else {
        response = await createFeatureFlag(payload);

        setNotification({
          type: "success",
          message: response.message || "Feature flag created successfully.",
        });
      }

      setDialogOpen(false);
      setSelectedFeatureFlag(null);

      await loadFeatureFlags();

      return { success: true, data: response };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to save feature flag.";

      setNotification({ type: "error", message });

      return { success: false, message, error };
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const id =
        selectedFeatureFlag?.FeatureFlagId ??
        selectedFeatureFlag?.featureFlagId ??
        selectedFeatureFlag?.id;

      if (!id) {
        throw new Error("Feature Flag ID is required for delete.");
      }

      setSaving(true);

      const response = await deleteFeatureFlag(id);

      setNotification({
        type: "success",
        message: response.message || "Feature flag deleted successfully.",
      });

      setConfirmOpen(false);
      setSelectedFeatureFlag(null);

      await loadFeatureFlags();

      return { success: true, data: response };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to delete feature flag.";

      setNotification({ type: "error", message });

      return { success: false, message, error };
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setModuleId("");
    setVisibilityStatusId("");
    setIsEnabled("");
    setPage(1);
  };

  const clearNotification = () => {
    setNotification(null);
  };

  return {
    featureFlags,
    lookups,

    loading,
    saving,
    error,
    notification,

    search,
    setSearch,
    moduleId,
    setModuleId,
    visibilityStatusId,
    setVisibilityStatusId,
    isEnabled,
    setIsEnabled,

    page,
    setPage,
    limit,
    setLimit,
    pagination,

    dialogOpen,
    setDialogOpen,
    viewDialogOpen,
    setViewDialogOpen,
    confirmOpen,
    setConfirmOpen,

    selectedFeatureFlag,

    openCreateDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,

    handleSave,
    handleDelete,
    resetFilters,
    clearNotification,

    reload: loadFeatureFlags,
  };
};