// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useSidebarState Hook
// ============================================
//
// Purpose:
// Manages sidebar dropdown open/close state.
// Automatically opens parent menus for the active route.
// ============================================

import { useEffect, useState } from "react";

import {
  buildInitialOpenMenus,
  getSidebarItemKey,
} from "../utils/sidebarHelpers";

export function useSidebarState(sections = [], pathname = "") {
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    setOpenMenus((current) => ({
      ...current,
      ...buildInitialOpenMenus(sections, pathname),
    }));
  }, [sections, pathname]);

  const toggleMenu = (item) => {
    const key = getSidebarItemKey(item);

    setOpenMenus((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return {
    openMenus,
    toggleMenu,
  };
}