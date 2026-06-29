// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useModuleManager
// ============================================
//
// Purpose:
// Handles Module Manager state, API loading,
// filters, dialogs, and CRUD actions.
// ============================================

import { useCallback, useEffect, useMemo, useState } from "react";

import { moduleApi } from "../api/moduleApi";

// ============================================
// Default Form State
// ============================================

const DEFAULT_FORM = {
  moduleKey: "",
  moduleName: "",
  description: "",
  icon: "",
  baseRoute: "",
  sortOrder: 0,
  visibilityStatusId: 1,
};

// ============================================
// Hook
// ============================================

export function useModuleManager() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  // ============================================
  // Load Modules
  // ============================================

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);

      const result = await moduleApi.getAll();

      setModules(result?.data || []);
    } catch (error) {
      console.error("Failed to load modules:", error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // ============================================
  // Filtering
  // ============================================

  const filteredModules = useMemo(() => {
    const text = searchText.trim().toLowerCase();

    return modules.filter((item) => {
      const matchesSearch =
        !text ||
        item.moduleName?.toLowerCase().includes(text) ||
        item.moduleKey?.toLowerCase().includes(text) ||
        item.baseRoute?.toLowerCase().includes(text);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);

      const matchesVisibility =
        visibilityFilter === "all" ||
        String(item.visibilityStatusId) === String(visibilityFilter);

      return matchesSearch && matchesStatus && matchesVisibility;
    });
  }, [modules, searchText, statusFilter, visibilityFilter]);

  // ============================================
  // KPI Summary
  // ============================================

  const kpis = useMemo(() => {
    return {
      total: modules.length,
      active: modules.filter((item) => item.isActive).length,
      inactive: modules.filter((item) => !item.isActive).length,
      visible: modules.filter((item) => Number(item.visibilityStatusId) === 1)
        .length,
    };
  }, [modules]);

  // ============================================
  // Form Dialog
  // ============================================

  const openCreateDialog = () => {
    setEditingModule(null);
    setFormData(DEFAULT_FORM);
    setFormOpen(true);
  };

  const openEditDialog = (moduleItem) => {
    setEditingModule(moduleItem);

    setFormData({
      moduleKey: moduleItem.moduleKey || "",
      moduleName: moduleItem.moduleName || "",
      description: moduleItem.description || "",
      icon: moduleItem.icon || "",
      baseRoute: moduleItem.baseRoute || "",
      sortOrder: moduleItem.sortOrder || 0,
      visibilityStatusId: moduleItem.visibilityStatusId || 1,
    });

    setFormOpen(true);
  };

  const closeFormDialog = () => {
    setFormOpen(false);
    setEditingModule(null);
    setFormData(DEFAULT_FORM);
  };

  const handleFormChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveModule = async () => {
    try {
      setSaving(true);

      if (editingModule) {
        await moduleApi.update(editingModule.moduleId, formData);
      } else {
        await moduleApi.create(formData);
      }

      closeFormDialog();
      await fetchModules();
    } catch (error) {
      console.error("Failed to save module:", error);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // Status Toggle
  // ============================================

  const toggleModuleStatus = async (moduleItem) => {
    try {
      setSaving(true);

      if (moduleItem.isActive) {
        await moduleApi.deactivate(moduleItem.moduleId);
      } else {
        await moduleApi.activate(moduleItem.moduleId);
      }

      await fetchModules();
    } catch (error) {
      console.error("Failed to update module status:", error);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // Delete Dialog
  // ============================================

  const openDeleteDialog = (moduleItem) => {
    setSelectedModule(moduleItem);
    setDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setSelectedModule(null);
    setDeleteOpen(false);
  };

  const deleteModule = async () => {
    if (!selectedModule) return;

    try {
      setSaving(true);

      await moduleApi.remove(selectedModule.moduleId);

      closeDeleteDialog();
      await fetchModules();
    } catch (error) {
      console.error("Failed to delete module:", error);
    } finally {
      setSaving(false);
    }
  };

  return {
    modules,
    filteredModules,
    loading,
    saving,

    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    visibilityFilter,
    setVisibilityFilter,

    kpis,

    formOpen,
    editingModule,
    formData,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    handleFormChange,
    saveModule,

    deleteOpen,
    selectedModule,
    openDeleteDialog,
    closeDeleteDialog,
    deleteModule,

    toggleModuleStatus,
    refreshModules: fetchModules,
  };
}