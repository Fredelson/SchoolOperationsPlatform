// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Reusable Topbar
// ============================================
//
// Purpose:
// Displays platform branding, search,
// notifications, and user profile actions.
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
  Divider,
  useTheme,
  alpha,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LightModeIcon from "@mui/icons-material/LightMode";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

import { useAuth } from "../../context/AuthContext";
import useBranding from "../../modules/system/hooks/useBranding";

// ============================================
// Layout Constants
// ============================================

const TOPBAR_HEIGHT = 86;

// ============================================
// Component
// ============================================

export default function Topbar({ onMenuClick }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { branding } = useBranding();

  const school = branding?.school || {};
  const brand = branding?.branding || {};

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const userName = user?.fullName || user?.FullName || "Unknown User";
  const role = user?.displayRole || user?.role || user?.Role || "Guest";

  const platformTitle =
    brand.loginTitle || school.schoolName || "Operations Platform";

  const platformSubtitle =
    brand.loginSubtitle || "Operations Platform";

  const logoPath =
    brand.logoPath || brand.smallLogoPath || brand.darkLogoPath || null;

  const initials = userName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // ============================================
  // Navigation Helpers
  // ============================================

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  const goToDashboard = () => {
    const roleValue = role.toLowerCase();

    if (roleValue.includes("teacher")) navigate("/teacher/dashboard");
    else if (roleValue.includes("hod")) navigate("/hod/dashboard");
    else if (roleValue.includes("hos")) navigate("/hos/dashboard");
    else if (roleValue.includes("printing")) navigate("/printing/dashboard");
    else if (roleValue.includes("super")) navigate("/super-admin/dashboard");
    else navigate("/login");
  };

  const goToProfile = () => {
    handleMenuClose();

    const roleValue = role.toLowerCase();

    if (roleValue.includes("teacher")) navigate("/teacher/profile");
    else if (roleValue.includes("hod")) navigate("/hod/profile");
    else if (roleValue.includes("hos")) navigate("/hos/profile");
    else if (roleValue.includes("printing")) navigate("/printing/profile");
    else if (roleValue.includes("super")) navigate("/super-admin/profile");
    else navigate("/login");
  };

  // ============================================
  // Theme Values
  // ============================================

  const topbarBg = theme.palette.platform?.topbar || theme.palette.primary.dark;
  const topbarText = theme.palette.primary.contrastText;
  const accent = theme.palette.platform?.accent || theme.palette.success.main;

  // ============================================
  // UI
  // ============================================

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: TOPBAR_HEIGHT,
        bgcolor: topbarBg,
        color: topbarText,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, md: 3 },
        zIndex: 2000,
        boxShadow: theme.shadows[4],
      }}
    >
      {/* Left Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          onClick={onMenuClick}
          sx={{
            display: { xs: "flex", md: "none" },
            color: topbarText,
            "&:hover": {
              bgcolor: alpha(topbarText, 0.08),
              color: accent,
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo and Title */}
        <Box
          onClick={goToDashboard}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
            borderRadius: 3,
            px: 1,
            py: 0.7,
            transition: theme.transitions.create(["background-color"], {
              duration: theme.transitions.duration.short,
            }),
            "&:hover": {
              bgcolor: alpha(topbarText, 0.06),
            },
          }}
        >
          <Box
            sx={{
              width: 76,
              height: 76,
              bgcolor: theme.palette.background.paper,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0.5,
              flexShrink: 0,
              border: `1px solid ${alpha(topbarText, 0.12)}`,
            }}
          >
            {logoPath ? (
              <Box
                component="img"
                src={logoPath}
                alt={school.schoolName || "School Logo"}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: theme.palette.primary.main,
                }}
              >
                {school.schoolCode || "AUS"}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography
              sx={{
                fontSize: { sm: 21, md: 23 },
                fontWeight: 900,
                color: accent,
                lineHeight: 1.05,
                letterSpacing: "0.4px",
              }}
            >
              {platformTitle}
            </Typography>

            <Typography
              sx={{
                mt: 0.4,
                fontSize: { sm: 13, md: 15 },
                color: topbarText,
                fontWeight: 600,
              }}
            >
              {platformSubtitle}
            </Typography>
          </Box>
        </Box>

        {/* Search Bar */}
        <TextField
          size="small"
          placeholder="Search..."
          sx={{
            width: 420,
            ml: { md: 4 },
            display: { xs: "none", md: "block" },

            "& .MuiOutlinedInput-root": {
              height: 46,
              borderRadius: 3,
              color: topbarText,
              bgcolor: alpha(topbarText, 0.08),

              "& fieldset": {
                borderColor: alpha(topbarText, 0.14),
              },

              "&:hover fieldset": {
                borderColor: accent,
              },

              "&.Mui-focused fieldset": {
                borderColor: accent,
                borderWidth: "1.5px",
              },
            },

            "& input::placeholder": {
              color: alpha(topbarText, 0.75),
              opacity: 1,
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: topbarText }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Right Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <IconButton
          sx={{
            color: topbarText,
            "&:hover": {
              bgcolor: alpha(topbarText, 0.08),
              color: accent,
            },
          }}
        >
          <LightModeIcon />
        </IconButton>

        <IconButton
          sx={{
            color: topbarText,
            "&:hover": {
              bgcolor: alpha(topbarText, 0.08),
              color: accent,
            },
          }}
        >
          <Badge badgeContent={8} color="success">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>

        {/* Profile */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            cursor: "pointer",
            borderRadius: 3,
            px: 1,
            py: 0.8,
            "&:hover": {
              bgcolor: alpha(topbarText, 0.08),
            },
          }}
        >
          <Avatar
            sx={{
              width: 54,
              height: 54,
              bgcolor: theme.palette.background.paper,
              color: theme.palette.primary.main,
              fontWeight: 900,
              fontSize: 20,
              border: `2px solid ${accent}`,
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: accent,
              }}
            >
              {userName}
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                color: topbarText,
                fontWeight: 600,
              }}
            >
              {role}
            </Typography>
          </Box>

          <KeyboardArrowDownIcon
            sx={{ display: { xs: "none", md: "block" } }}
          />
        </Box>

        {/* Profile Menu */}
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography fontWeight={800}>{userName}</Typography>

            <Typography
              fontSize={13}
              sx={{ color: theme.palette.primary.main }}
            >
              {role}
            </Typography>
          </Box>

          <Divider />

          <MenuItem onClick={goToProfile}>
            <PersonIcon
              sx={{ mr: 1.5, color: theme.palette.primary.main }}
            />
            My Profile
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/settings");
            }}
          >
            <SettingsIcon
              sx={{ mr: 1.5, color: theme.palette.primary.main }}
            />
            Settings
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <LogoutIcon sx={{ mr: 1.5 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
