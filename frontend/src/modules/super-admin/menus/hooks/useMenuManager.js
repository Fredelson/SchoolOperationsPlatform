// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useMenuManager Hook
// ============================================
//
// Purpose:
// Handles Menu Manager page state using the
// reusable platform CRUD manager.
//
// Architecture:
// MenuManager.jsx -> useMenuManager -> useCrudManager -> menuApi
// ============================================

import { useCallback } from "react";

import { menuApi } from "../api/menuApi";
import { useCrudManager } from "@platform/crud";

// ============================================
// Default Filters
// ============================================

const DEFAULT_FILTERS = {
  search: "",
  visibility: "all",
};

// ============================================
// Helpers
// ============================================

function normalizeKey(value) {
  return String(value ?? "").trim().toLowerCase();
}

function mapVisibilityToStatusKey(visibility) {
  if (visibility === "visible") return "enabled";
  if (visibility === "hidden") return "hidden";

  return "";
}

export function getMenuId(menu) {
  return menu?.menuId ?? menu?.MenuId;
}

export function isMenuVisible(menu) {
  const statusId = Number(menu?.visibilityStatusId ?? menu?.VisibilityStatusId);

  const statusKey = normalizeKey(
    menu?.visibilityStatusKey ?? menu?.VisibilityStatusKey
  );

  if (statusId === 1) return true;
  if (statusId === 2) return false;

  if (statusKey === "enabled") return true;
  if (statusKey === "hidden") return false;

  return false;
}

export function getMenuVisibilityKey(menu) {
  return isMenuVisible(menu) ? "enabled" : "hidden";
}

// ============================================
// Hook
// ============================================

export function useMenuManager() {
  const manager = useCrudManager({
    api: menuApi,
    rowsKey: "menus",
    defaultFilters: DEFAULT_FILTERS,

    labels: {
      entity: "Menu",
      entityPlural: "Menus",
    },

    getItemId: getMenuId,

    buildQueryParams: ({ filters, pagination }) => ({
      page: pagination.page + 1,
      pageSize: pagination.rowsPerPage,
      search: filters.search || "",
      visibilityStatusKey: mapVisibilityToStatusKey(filters.visibility),
    }),

    deriveKpis: ({ rows, pagination }) => {
      const totalMenus = pagination.totalRows;

      const visibleMenus = rows.filter((menu) => isMenuVisible(menu)).length;
      const hiddenMenus = rows.length - visibleMenus;

      const parentMenus = rows.filter(
        (menu) => !(menu?.parentMenuId ?? menu?.ParentMenuId)
      ).length;

      return {
        totalMenus,
        visibleMenus,
        hiddenMenus,
        parentMenus,
      };
    },
  });

  const showMenu = useCallback(
    async (menu) => {
      return manager.runAction({
        item: menu,
        action: menuApi.show,
        successMessage: "Menu shown successfully.",
        errorMessage: "Failed to show menu.",
      });
    },
    [manager]
  );

  const hideMenu = useCallback(
    async (menu) => {
      return manager.runAction({
        item: menu,
        action: menuApi.hide,
        successMessage: "Menu hidden successfully.",
        errorMessage: "Failed to hide menu.",
      });
    },
    [manager]
  );

  return {
    ...manager,

    menus: manager.rows,
    filteredMenus: manager.filteredRows,

    refreshMenus: manager.refreshRows,
    fetchMenus: manager.fetchRows,

    createMenu: manager.createItem,
    updateMenu: manager.updateItem,
    deleteMenu: manager.deleteItem,

    showMenu,
    hideMenu,

    isMenuVisible,
    getMenuVisibilityKey,
  };
}