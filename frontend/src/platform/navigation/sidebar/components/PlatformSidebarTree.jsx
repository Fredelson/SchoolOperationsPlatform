import { useLocation } from "react-router-dom";

import { Box, List } from "@mui/material";

import PlatformSidebarItem from "./PlatformSidebarItem";
import PlatformSidebarSection from "./PlatformSidebarSection";
import { useSidebarState } from "../hooks/useSidebarState";
import { getSidebarItemKey } from "../utils/sidebarHelpers";

const DELETED_EXACT_ROUTES = new Set([
  "/super-admin/navigation-manager",
  "/super-admin/permissions",
  "/super-admin/role-permissions",
  "/super-admin/user-permission-overrides",
  "/super-admin/access-levels",
  "/super-admin/buttons",
  "/super-admin/widgets",
  "/super-admin/feature-flags",
  "/super-admin/assignment-types",
  "/super-admin/user-assignments",
  "/super-admin/printing",
  "/super-admin/it-assets",
  "/it-assets",
]);

function isDeletedRoute(item = {}) {
  const raw = item.path || item.route || "";
  if (!raw) return false;
  const path = String(raw).toLowerCase();
  return DELETED_EXACT_ROUTES.has(path);
}

export default function PlatformSidebarTree({
  sections = [],
  onNavigate,
  defaultOpenAll = false,
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
        const items = (section.items || []).filter((item) => !isDeletedRoute(item));

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
