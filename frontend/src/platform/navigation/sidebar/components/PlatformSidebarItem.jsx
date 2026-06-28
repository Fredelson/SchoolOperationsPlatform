// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Platform Sidebar Item
// ============================================
//
// Purpose:
// Renders one sidebar item.
// Supports normal links, nested dropdowns, active state,
// coming soon badges, and future permission metadata.
// ============================================

import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from "@mui/material";

import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import { NavLink, useLocation } from "react-router-dom";

import PlatformSidebarBadge from "./PlatformSidebarBadge";
import {
  getSidebarItemKey,
  isSidebarItemActive,
} from "../utils/sidebarHelpers";

export default function PlatformSidebarItem({
  item,
  level = 0,
  openMenus = {},
  toggleMenu,
}) {
  const theme = useTheme();
  const location = useLocation();

  const platform = theme.palette.platform || {};
  const sidebarText = theme.palette.primary.contrastText;
  const accent = platform.accent || theme.palette.success.main;

  const itemKey = getSidebarItemKey(item);
  const hasChildren = Boolean(item?.children?.length);
  const isOpen = Boolean(openMenus[itemKey]);
  const isComingSoon = Boolean(item?.comingSoon);
  const isActive = isSidebarItemActive(item, location.pathname);

  const leftPadding = 2 + level * 2.2;

  if (hasChildren) {
    return (
      <Box key={itemKey}>
        <ListItemButton
          onClick={() => toggleMenu(item)}
          sx={{
            minHeight: 46,
            borderRadius: 2.8,
            mb: 0.45,
            px: 2,
            pl: leftPadding,
            color: isActive ? sidebarText : alpha(sidebarText, 0.78),
            bgcolor: isActive ? alpha(accent, 0.18) : "transparent",
            transition: theme.transitions.create(
              ["background-color", "color", "box-shadow"],
              { duration: theme.transitions.duration.short }
            ),
            "&:hover": {
              bgcolor: alpha(sidebarText, 0.08),
              color: sidebarText,
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: "inherit",
              minWidth: level === 0 ? 44 : 32,
              "& svg": {
                fontSize: level === 0 ? 21 : 9,
              },
            }}
          >
            {item.icon || <FiberManualRecordIcon />}
          </ListItemIcon>

          <ListItemText
            primary={item.label}
            slotProps={{
              primary: {
                sx: {
                  fontSize: level === 0 ? 14.5 : 13.3,
                  fontWeight: level === 0 ? 750 : 700,
                  whiteSpace: "nowrap",
                },
              },
            }}
          />

          {isComingSoon && <PlatformSidebarBadge label="Soon" />}

          {isOpen ? (
            <ExpandLessOutlinedIcon sx={{ fontSize: 20 }} />
          ) : (
            <ExpandMoreOutlinedIcon sx={{ fontSize: 20 }} />
          )}
        </ListItemButton>

        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List disablePadding>
            {item.children.map((child) => (
              <PlatformSidebarItem
                key={getSidebarItemKey(child)}
                item={child}
                level={level + 1}
                openMenus={openMenus}
                toggleMenu={toggleMenu}
              />
            ))}
          </List>
        </Collapse>
      </Box>
    );
  }

  return (
    <ListItemButton
      key={itemKey}
      component={isComingSoon ? "button" : NavLink}
      to={isComingSoon ? undefined : item.path}
      disabled={isComingSoon}
      sx={{
        minHeight: 46,
        borderRadius: 2.8,
        mb: 0.45,
        px: 2,
        pl: leftPadding,
        color: alpha(sidebarText, isComingSoon ? 0.42 : 0.78),
        transition: theme.transitions.create(
          ["background-color", "color", "box-shadow"],
          { duration: theme.transitions.duration.short }
        ),
        "&:hover": {
          bgcolor: isComingSoon ? "transparent" : alpha(sidebarText, 0.08),
          color: isComingSoon ? alpha(sidebarText, 0.42) : sidebarText,
        },
        "&.active": {
          bgcolor: accent,
          color: sidebarText,
          boxShadow: `0 10px 24px ${alpha(accent, 0.25)}`,
          "& .MuiListItemIcon-root": {
            color: sidebarText,
          },
          "&:hover": {
            bgcolor: accent,
          },
        },
        "&.Mui-disabled": {
          opacity: 1,
          color: alpha(sidebarText, 0.42),
        },
      }}
    >
      <ListItemIcon
        sx={{
          color: "inherit",
          minWidth: level === 0 ? 44 : 32,
          "& svg": {
            fontSize: level === 0 ? 21 : 9,
          },
        }}
      >
        {item.icon || <FiberManualRecordIcon />}
      </ListItemIcon>

      <ListItemText
        primary={item.label}
        slotProps={{
          primary: {
            sx: {
              fontSize: level === 0 ? 14.5 : 13.3,
              fontWeight: level === 0 ? 750 : 650,
              whiteSpace: "nowrap",
            },
          },
        }}
      />

      {isComingSoon && <PlatformSidebarBadge label="Soon" />}
    </ListItemButton>
  );
}