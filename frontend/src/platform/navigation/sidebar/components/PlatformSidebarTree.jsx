// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Platform Sidebar Tree
// ============================================
//
// Purpose:
// Renders the complete sidebar menu tree for any role.
// Supports nested children, active routes, and dropdown state.
// ============================================

import { useLocation } from "react-router-dom";

import { Box, List } from "@mui/material";

import PlatformSidebarItem from "./PlatformSidebarItem";
import { useSidebarState } from "../hooks/useSidebarState";
import {
  buildExpandedOpenMenus,
  getSidebarItemKey,
} from "../utils/sidebarHelpers";

export default function PlatformSidebarTree({
  sections = [],
  onNavigate,
  defaultOpenAll = true,
  showHierarchy = true,
}) {
  const location = useLocation();
  const { openMenus, toggleMenu } = useSidebarState(
    sections,
    location.pathname,
    { defaultOpenAll }
  );

  const allItems = sections.flatMap((section) => section.items || []);

  return (
    <Box sx={{ px: 1.5, pt: 1.5, pb: 3 }}>
      <List disablePadding sx={{ pt: 0.5 }}>
        {allItems.map((item, index) => (
          <PlatformSidebarItem
            key={getSidebarItemKey(item)}
            item={item}
            isLastChild={index === allItems.length - 1}
            openMenus={openMenus}
            toggleMenu={toggleMenu}
            onNavigate={onNavigate}
            showHierarchy={showHierarchy}
          />
        ))}
      </List>
    </Box>
  );
}
