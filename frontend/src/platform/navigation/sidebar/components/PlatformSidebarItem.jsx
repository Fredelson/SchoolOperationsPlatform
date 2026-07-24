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
  const isViewOnly =
    !isComingSoon &&
    (item?.IsEnabled === false ||
      item?.isEnabled === false ||
      item?.ModuleIsEnabled === false ||
      item?.moduleIsEnabled === false);
  const isDisabled = isComingSoon;
  const isActive = isSidebarItemActive(item, location.pathname);

  const isRoot = level === 0;
  const isTopLevelGroup = isRoot && hasChildren;
  const rowInset = level * 2;
  const rowHeight = isTopLevelGroup ? 56 : isRoot ? 46 : hasChildren ? 43 : 39;
  const rowRadius = isRoot ? 2 : 1.5;
  const icon = item.icon || getSidebarIcon(item.iconKey, level);
  const branchLineColor = isActive
    ? alpha(accent, 0.66)
    : alpha(sidebarText, 0.16);
  const branchOffset = theme.spacing(-0.85);
  const branchWidth = theme.spacing(0.85);
  const branchStemLeft = theme.spacing(rowInset - 0.85);
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
    mb: isRoot ? 0.75 : 0.3,
    px: isRoot ? 1.35 : 1.15,
    borderRadius: rowRadius,
    border: "1px solid transparent",
  };
  const iconSx = {
    color: "inherit",
    minWidth: isRoot ? 43 : 29,
    "& svg": {
      fontSize: isRoot ? 21 : hasChildren ? 17 : 15,
    },
  };
  const rootIconSurfaceSx = isRoot
    ? {
        width: isTopLevelGroup ? 34 : 30,
        height: isTopLevelGroup ? 34 : 30,
        display: "grid",
        placeItems: "center",
        borderRadius: 1.5,
        color: isActive
          ? sidebarText
          : isTopLevelGroup
            ? accent
            : alpha(sidebarText, 0.8),
        bgcolor: isActive
          ? alpha(accent, 0.28)
          : isTopLevelGroup
            ? alpha(accent, 0.12)
            : alpha(sidebarText, 0.06),
        border: `1px solid ${
          isActive
            ? alpha(accent, 0.46)
            : isTopLevelGroup
              ? alpha(accent, 0.22)
              : alpha(sidebarText, 0.1)
        }`,
      }
    : {
        width: 19,
        height: 19,
        display: "grid",
        placeItems: "center",
        color: hasChildren ? alpha(sidebarText, 0.8) : alpha(sidebarText, 0.64),
      };
  const textSx = {
    fontSize: isTopLevelGroup
      ? 15.5
      : isRoot
        ? 14.25
        : hasChildren
          ? 13.75
          : 13.1,
    lineHeight: 1.25,
    fontWeight: isTopLevelGroup
      ? 800
      : isRoot
        ? 700
        : hasChildren
          ? 750
          : 550,
    letterSpacing: 0,
    whiteSpace: isTopLevelGroup ? "normal" : "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    ...(isTopLevelGroup
      ? {
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
        }
      : {}),
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
          onClick={isDisabled ? undefined : toggleMenu ? () => toggleMenu(item) : undefined}
          aria-expanded={isOpen}
          disabled={isDisabled}
          sx={{
            ...rowLayoutSx,
            cursor: isDisabled ? "not-allowed" : toggleMenu ? "pointer" : "default",
            color: isActive ? sidebarText : alpha(sidebarText, isRoot ? 0.96 : 0.82),
            bgcolor: isActive
              ? alpha(accent, isRoot ? 0.2 : 0.1)
              : isTopLevelGroup
                ? alpha(sidebarText, 0.075)
                : "transparent",
            borderColor: isActive
              ? alpha(accent, isRoot ? 0.42 : 0.24)
              : isTopLevelGroup
                ? alpha(sidebarText, 0.1)
                : "transparent",
            boxShadow: isActive
              ? `inset ${isRoot ? 4 : 3}px 0 0 ${accent}`
              : isTopLevelGroup
                ? `inset 2px 0 0 ${alpha(accent, 0.68)}`
                : "none",
            transition: theme.transitions.create(
              ["background-color", "border-color", "color", "box-shadow"],
              { duration: theme.transitions.duration.short }
            ),
            "&:hover": {
              bgcolor: isActive
                ? alpha(accent, isRoot ? 0.25 : 0.14)
                : alpha(sidebarText, isTopLevelGroup ? 0.11 : 0.07),
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
            sx={{ minWidth: 0 }}
            primary={item.label}
            slotProps={{
              primary: {
                sx: textSx,
              },
            }}
          />

          {isViewOnly && <PlatformSidebarBadge label="View" />}
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
      component={isDisabled ? "button" : NavLink}
      to={isDisabled ? undefined : item.path}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onNavigate}
      sx={{
        ...rowLayoutSx,
        cursor: isDisabled ? "not-allowed" : undefined,
        color: alpha(
          sidebarText,
          isDisabled ? 0.42 : isViewOnly ? 0.75 : isRoot ? 0.9 : 0.7
        ),
        bgcolor: isRoot
          ? alpha(sidebarText, isTopLevelGroup ? 0.06 : 0.04)
          : "transparent",
        borderColor: isRoot
          ? alpha(sidebarText, isTopLevelGroup ? 0.085 : 0.06)
          : "transparent",
        transition: theme.transitions.create(
          ["background-color", "border-color", "color", "box-shadow"],
          { duration: theme.transitions.duration.short }
        ),
        "&:hover": {
          bgcolor: isDisabled
            ? rowLayoutSx.bgcolor
            : isComingSoon
              ? isRoot
                ? alpha(sidebarText, isTopLevelGroup ? 0.06 : 0.04)
                : "transparent"
              : alpha(sidebarText, isViewOnly ? 0.08 : isTopLevelGroup ? 0.11 : 0.07),
          color: isDisabled
            ? alpha(sidebarText, 0.42)
            : isComingSoon
              ? alpha(sidebarText, 0.42)
              : sidebarText,
        },
        "&.active": {
          bgcolor: isRoot ? accent : alpha(accent, 0.16),
          color: sidebarText,
          borderColor: isRoot
            ? alpha(sidebarText, 0.16)
            : alpha(accent, 0.35),
          boxShadow: isRoot
            ? `0 8px 22px ${alpha(accent, 0.24)}`
            : `inset 3px 0 0 ${accent}`,
          "& .MuiListItemIcon-root": {
            color: sidebarText,
          },
          "&:hover": {
            bgcolor: isRoot ? accent : alpha(accent, 0.2),
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
            sx={{ minWidth: 0 }}
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
