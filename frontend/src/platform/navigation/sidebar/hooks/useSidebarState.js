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
  buildExpandedOpenMenus,
  buildInitialOpenMenus,
  getSidebarItemKey,
} from "../utils/sidebarHelpers";

export function useSidebarState(sections = [], pathname = "", options = {}) {
  const [openMenus, setOpenMenus] = useState({});
  const defaultOpenAll = Boolean(options.defaultOpenAll);

  useEffect(() => {
    setOpenMenus((current) => {
      const initialOpenMenus = defaultOpenAll
        ? buildExpandedOpenMenus(sections)
        : buildInitialOpenMenus(sections, pathname);

      if (defaultOpenAll) {
        return {
          ...initialOpenMenus,
          ...current,
        };
      }

      return {
        ...current,
        ...initialOpenMenus,
      };
    });
  }, [defaultOpenAll, sections, pathname]);

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
