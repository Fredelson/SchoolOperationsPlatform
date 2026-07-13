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

import { useEffect, useState } from "react";

import { Box, Collapse, List } from "@mui/material";
import { useLocation } from "react-router-dom";

import PlatformSidebarItem from "./PlatformSidebarItem";
import PlatformSidebarSection from "./PlatformSidebarSection";
import { useSidebarState } from "../hooks/useSidebarState";
import {
  buildExpandedOpenSections,
  getSidebarItemKey,
} from "../utils/sidebarHelpers";

export default function PlatformSidebarTree({
  sections = [],
  onNavigate,
  defaultOpenAll = true,
  showHierarchy = true,
}) {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({});

  const { openMenus, toggleMenu } = useSidebarState(
    sections,
    location.pathname,
    { defaultOpenAll }
  );

  useEffect(() => {
    setOpenSections((current) => ({
      ...(defaultOpenAll ? buildExpandedOpenSections(sections) : {}),
      ...current,
    }));
  }, [defaultOpenAll, sections]);

  const toggleSection = (title) => {
    setOpenSections((current) => ({
      ...current,
      [title]: !current[title],
    }));
  };

  return (
    <Box sx={{ px: 2.5, pt: 2, pb: 2 }}>
      {sections.map((section) => {
        const sectionTitle = section.title || "Main";
        const isOpen = Boolean(openSections[sectionTitle]);

        return (
          <Box key={sectionTitle} sx={{ mb: 1.4 }}>
            <PlatformSidebarSection
              title={sectionTitle}
              open={isOpen}
              showHierarchy={showHierarchy}
              onToggle={() => toggleSection(sectionTitle)}
            />

            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List disablePadding>
                {section.items?.map((item) => (
                  <PlatformSidebarItem
                    key={getSidebarItemKey(item)}
                    item={item}
                    openMenus={openMenus}
                    toggleMenu={toggleMenu}
                    onNavigate={onNavigate}
                    showHierarchy={showHierarchy}
                  />
                ))}
              </List>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}
