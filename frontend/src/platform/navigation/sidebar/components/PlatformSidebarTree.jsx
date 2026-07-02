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

import { Box, List } from "@mui/material";
import { useLocation } from "react-router-dom";

import PlatformSidebarItem from "./PlatformSidebarItem";
import PlatformSidebarSection from "./PlatformSidebarSection";
import { useSidebarState } from "../hooks/useSidebarState";
import { getSidebarItemKey } from "../utils/sidebarHelpers";

export default function PlatformSidebarTree({ sections = [] }) {
  const location = useLocation();

  const { openMenus, toggleMenu } = useSidebarState(
    sections,
    location.pathname
  );

  return (
    <Box sx={{ px: 2.5, pt: 2, pb: 2 }}>
      {sections.map((section) => (
        <Box key={section.title} sx={{ mb: 2.4 }}>
          <PlatformSidebarSection title={section.title} />

          <List disablePadding>
            {section.items?.map((item) => (
              <PlatformSidebarItem
                key={getSidebarItemKey(item)}
                item={item}
                openMenus={openMenus}
                toggleMenu={toggleMenu}
              />
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
}