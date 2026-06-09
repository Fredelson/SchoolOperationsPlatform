// ============================================
// ARAB UNITY SCHOOL
// Reusable Topbar
// Connected to AuthContext
// Shows logged-in user name, role, and logout menu
// ============================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  TextField,
  Avatar,
  Badge,
  IconButton,
  Typography,
  InputAdornment,
  Menu,
  MenuItem,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LightModeIcon from "@mui/icons-material/LightMode";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Auth context
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const navigate = useNavigate();

  // Get logged-in user and logout function
  const { user, logout } = useAuth();

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);

  // Open profile dropdown menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close profile dropdown menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Logout user and redirect to login page
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fallback values if user is not loaded yet
  const userName = user?.fullName || "Unknown User";
  const role = user?.role || "Guest";

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "80px",
        bgcolor: "#fff",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        boxSizing: "border-box",
        zIndex: 2000,
      }}
    >
      {/* Left Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        {/* Logo and School Name */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg,#FF8A00,#2563EB)",
              fontWeight: 700,
            }}
          >
            AUS
          </Avatar>

          <Box>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                color: "#0F172A",
                lineHeight: 1.1,
              }}
            >
              ARAB UNITY SCHOOL
            </Typography>

            <Typography sx={{ fontSize: 13, color: "#64748B" }}>
              Photocopy Management System
            </Typography>
          </Box>
        </Box>

        {/* Search Bar */}
        <TextField
          size="small"
          placeholder="Search requests, documents, attachments..."
          sx={{ width: 420 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Right Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Theme icon - future feature */}
        <IconButton>
          <LightModeIcon />
        </IconButton>

        {/* Notification icon - future feature */}
        <IconButton>
          <Badge badgeContent={8} color="error">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>

        {/* User Profile */}
        <Box
          onClick={handleMenuOpen}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
        >
          <Avatar sx={{ width: 44, height: 44 }}>
            {userName.charAt(0)}
          </Avatar>

          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
              {userName}
            </Typography>

            <Typography sx={{ fontSize: 12, color: "#2563EB" }}>
              {role}
            </Typography>
          </Box>

          <KeyboardArrowDownIcon />
        </Box>

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem disabled>{userName}</MenuItem>
          <MenuItem disabled>{role}</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}