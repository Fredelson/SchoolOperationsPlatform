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
import PlatformSidebarSection from "./PlatformSidebarSection";
import { useSidebarState } from "../hooks/useSidebarState";
import { getSidebarItemKey } from "../utils/sidebarHelpers";

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

  return (
    <Box sx={{ px: 1.5, pt: 1.5, pb: 3 }}>
      {sections.map((section, sectionIndex) => {
        const items = section.items || [];

        if (!items.length) return null;

        return (
          <Box
            key={section.title || `sidebar-section-${sectionIndex}`}
            sx={{
              mb: sectionIndex === sections.length - 1 ? 0 : 2.25,
            }}
          >
            <PlatformSidebarSection title={section.title || "Main"} />
            <List disablePadding sx={{ pt: 0.6 }}>
              {items.map((item, index) => (
                <PlatformSidebarItem
                  key={getSidebarItemKey(item)}
                  item={item}
                  isLastChild={index === items.length - 1}
                  openMenus={openMenus}
                  toggleMenu={toggleMenu}
                  onNavigate={onNavigate}
                  showHierarchy={showHierarchy}
                />
              ))}
            </List>
          </Box>
        );
      })}
    </Box>
  );
}
