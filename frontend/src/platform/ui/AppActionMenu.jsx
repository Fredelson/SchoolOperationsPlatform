// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// App Action Menu
// ============================================
//
// Purpose:
// Reusable row action menu for tables.
//
// Used by:
// - Module Manager
// - Menu Manager
// - Button Manager
// - Widget Manager
// - Users
// - Roles
// - Assets
// - Inventory
// - Students
// - Staff
// ============================================

import { useState } from "react";

import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";

// ============================================
// Component
// ============================================

export default function AppActionMenu({
  items = [],
  iconSize = "small",
  tooltip = "Actions",
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (item) => {
    handleClose();

    if (!item.disabled && item.onClick) {
      item.onClick();
    }
  };

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          size={iconSize}
          onClick={handleOpen}
        >
          <MoreVertIcon fontSize={iconSize} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            minWidth: 140,
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          },
        }}
      >
        {items.map((item, index) => (
          <MenuItem
            key={index}
            disabled={item.disabled}
            onClick={() => handleClick(item)}
            sx={{
              color: item.color || "inherit",
            }}
          >
            {item.icon && (
              <ListItemIcon
                sx={{
                  color: item.color || "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
            )}

            <ListItemText>
              {item.label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}