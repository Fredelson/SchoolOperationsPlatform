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

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import { NavLink, useLocation } from "react-router-dom";

import PlatformSidebarBadge from "./PlatformSidebarBadge";
import { getSidebarIcon } from "../utils/sidebarIcons";
import {
  getSidebarItemKey,
  isSidebarItemActive,
} from "../utils/sidebarHelpers";

export default function PlatformSidebarItem({
  item,
  level = 0,
  openMenus = {},
  toggleMenu,
  onNavigate,
  showHierarchy = false,
  isLastChild = false,
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

  const isRoot = level === 0;
  const rowInset = level * 2.2;
  const rowHeight = isRoot ? 52 : hasChildren ? 44 : 40;
  const rowRadius = isRoot ? 2 : 1.5;
  const icon = item.icon || getSidebarIcon(item.iconKey, level);
  const branchLineColor = isActive
    ? alpha(accent, 0.72)
    : alpha(sidebarText, 0.18);
  const branchOffset = theme.spacing(-1.1);
  const branchWidth = theme.spacing(1.1);
  const branchStemLeft = theme.spacing(rowInset - 1.1);
  const hierarchyBranchSx = showHierarchy && level > 0
    ? {
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          left: branchOffset,
          top: "50%",
          width: branchWidth,
          borderTop: `1px solid ${branchLineColor}`,
        },
      }
    : {};
  const hierarchyStemSx = showHierarchy && level > 0
    ? {
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          left: branchStemLeft,
          top: -5,
          height: isLastChild ? rowHeight / 2 + 5 : "auto",
          bottom: isLastChild ? "auto" : -5,
          borderLeft: `1px solid ${branchLineColor}`,
        },
      }
    : {};
  const leafHierarchyStemSx = showHierarchy && level > 0
    ? {
        "&::after": {
          content: '""',
          position: "absolute",
          left: branchOffset,
          top: -5,
          bottom: isLastChild ? "50%" : -5,
          borderLeft: `1px solid ${branchLineColor}`,
        },
      }
    : {};
  const rowLayoutSx = {
    width: level > 0
      ? `calc(100% - ${theme.spacing(rowInset)})`
      : "100%",
    minHeight: rowHeight,
    ml: rowInset,
    mb: isRoot ? 0.65 : 0.35,
    px: isRoot ? 1.15 : 1.25,
    borderRadius: rowRadius,
    border: "1px solid transparent",
  };
  const iconSx = {
    color: "inherit",
    minWidth: isRoot ? 42 : 30,
    "& svg": {
      fontSize: isRoot ? 21 : hasChildren ? 17 : 14,
    },
  };
  const rootIconSurfaceSx = isRoot
    ? {
        width: 32,
        height: 32,
        display: "grid",
        placeItems: "center",
        borderRadius: 1.5,
        bgcolor: isActive ? alpha(accent, 0.22) : alpha(sidebarText, 0.07),
        border: `1px solid ${
          isActive ? alpha(accent, 0.3) : alpha(sidebarText, 0.08)
        }`,
      }
    : {
        width: 18,
        height: 18,
        display: "grid",
        placeItems: "center",
      };
  const textSx = {
    fontSize: isRoot ? 15.25 : hasChildren ? 13.75 : 13.25,
    lineHeight: 1.25,
    fontWeight: isRoot ? 800 : hasChildren ? 750 : 600,
    letterSpacing: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
  const chevron = (
    <Box
      aria-hidden="true"
      sx={{
        width: isRoot ? 28 : 24,
        height: isRoot ? 28 : 24,
        ml: 0.5,
        flex: `0 0 ${isRoot ? 28 : 24}px`,
        display: "grid",
        placeItems: "center",
        borderRadius: 1.5,
        bgcolor: alpha(sidebarText, isOpen ? 0.1 : 0.05),
      }}
    >
      <KeyboardArrowDownRoundedIcon
        sx={{
          fontSize: isRoot ? 19 : 17,
          transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
          transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.shortest,
          }),
        }}
      />
    </Box>
  );

  if (hasChildren) {
    return (
      <Box key={itemKey} sx={hierarchyStemSx}>
        <ListItemButton
          onClick={toggleMenu ? () => toggleMenu(item) : undefined}
          aria-expanded={isOpen}
          sx={{
            ...rowLayoutSx,
            cursor: toggleMenu ? "pointer" : "default",
            color: isActive ? sidebarText : alpha(sidebarText, isRoot ? 0.9 : 0.76),
            bgcolor: isActive
              ? alpha(accent, isRoot ? 0.16 : 0.1)
              : isRoot
                ? alpha(sidebarText, 0.035)
                : "transparent",
            borderColor: isActive
              ? alpha(accent, isRoot ? 0.32 : 0.2)
              : isRoot
                ? alpha(sidebarText, 0.06)
                : "transparent",
            boxShadow: isActive
              ? `inset ${isRoot ? 3 : 2}px 0 0 ${accent}`
              : "none",
            transition: theme.transitions.create(
              ["background-color", "border-color", "color", "box-shadow"],
              { duration: theme.transitions.duration.short }
            ),
            "&:hover": {
              bgcolor: isActive
                ? alpha(accent, isRoot ? 0.2 : 0.14)
                : alpha(sidebarText, isRoot ? 0.075 : 0.06),
              color: sidebarText,
            },
            ...hierarchyBranchSx,
          }}
        >
          {icon && (
            <ListItemIcon
              sx={iconSx}
            >
              <Box sx={rootIconSurfaceSx}>{icon}</Box>
            </ListItemIcon>
          )}

          <ListItemText
            primary={item.label}
            slotProps={{
              primary: {
                sx: textSx,
              },
            }}
          />

          {isComingSoon && <PlatformSidebarBadge label="Soon" />}
          {chevron}
        </ListItemButton>

        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ pb: isRoot ? 0.45 : 0.2 }}>
            {item.children.map((child, index) => (
              <PlatformSidebarItem
                key={getSidebarItemKey(child)}
                item={child}
                level={level + 1}
                isLastChild={index === item.children.length - 1}
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
  }

  return (
    <ListItemButton
      key={itemKey}
      component={isComingSoon ? "button" : NavLink}
      to={isComingSoon ? undefined : item.path}
      disabled={isComingSoon}
      onClick={isComingSoon ? undefined : onNavigate}
      sx={{
        ...rowLayoutSx,
        color: alpha(
          sidebarText,
          isComingSoon ? 0.4 : isRoot ? 0.88 : 0.72
        ),
        bgcolor: isRoot ? alpha(sidebarText, 0.025) : "transparent",
        borderColor: isRoot ? alpha(sidebarText, 0.05) : "transparent",
        transition: theme.transitions.create(
          ["background-color", "border-color", "color", "box-shadow"],
          { duration: theme.transitions.duration.short }
        ),
        "&:hover": {
          bgcolor: isComingSoon
            ? isRoot
              ? alpha(sidebarText, 0.025)
              : "transparent"
            : alpha(sidebarText, isRoot ? 0.075 : 0.06),
          color: isComingSoon ? alpha(sidebarText, 0.42) : sidebarText,
        },
        "&.active": {
          bgcolor: isRoot ? accent : alpha(sidebarText, 0.13),
          color: sidebarText,
          borderColor: isRoot
            ? alpha(sidebarText, 0.12)
            : alpha(accent, 0.32),
          boxShadow: isRoot
            ? `0 8px 20px ${alpha(accent, 0.22)}`
            : `inset 3px 0 0 ${accent}`,
          "& .MuiListItemIcon-root": {
            color: sidebarText,
          },
          "&:hover": {
            bgcolor: isRoot ? accent : alpha(sidebarText, 0.16),
          },
        },
        "&.Mui-disabled": {
          opacity: 1,
          color: alpha(sidebarText, 0.42),
        },
        ...hierarchyBranchSx,
        ...leafHierarchyStemSx,
      }}
    >
      {icon && (
        <ListItemIcon
          sx={iconSx}
        >
          <Box sx={rootIconSurfaceSx}>{icon}</Box>
        </ListItemIcon>
      )}

      <ListItemText
        primary={item.label}
        slotProps={{
          primary: {
            sx: textSx,
          },
        }}
      />

      {isComingSoon && <PlatformSidebarBadge label="Soon" />}
    </ListItemButton>
  );
}
