// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Platform Topbar
// ============================================
//
// Purpose:
// Shared responsive topbar for platform layouts.
// Supports branding, gradients, search, actions,
// mobile menu, and user identity.
// ============================================

import {
  Avatar,
  Badge,
  Box,
  IconButton,
  InputBase,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";

import { useAuth } from "../../context/AuthContext";
import useBranding from "../../modules/system/hooks/useBranding";
import buildFileUrl from "../utils/buildFileUrl";

// ============================================
// Role Context
// ============================================

const getTopbarContext = (role) => {
  switch (role) {
    case "SuperAdmin":
      return {
        title: "Dashboard",
        subtitle: "Platform Control Center",
      };

    case "PlatformAdmin":
      return {
        title: "Platform Admin",
        subtitle: "Operations Control Center",
      };

    case "PrintingAdmin":
      return {
        title: "Printing Management",
        subtitle: "Operations Control Center",
      };

    default:
      return {
        title: "Dashboard",
        subtitle: "Operations Platform",
      };
  }
};

// ============================================
// Component
// ============================================

export default function PlatformTopbar({ height = 78, onMenuClick }) {
  const theme = useTheme();

  const { user } = useAuth();
  const { branding } = useBranding();

  const school = branding?.school || {};
  const brand = branding?.branding || {};

  const role = user?.role || user?.Role;
  const context = getTopbarContext(role);

  const displayName = user?.fullName || user?.FullName || "User";
  const displayRole = user?.displayRole || user?.DisplayRole || role || "User";
  const initial = displayName?.charAt(0)?.toUpperCase() || "U";

  const logoPath = buildFileUrl(
    brand.logoPath ||
      brand.smallLogoPath ||
      brand.darkLogoPath ||
      ""
  );

  // ============================================
  // Theme Values
  // ============================================

  const platform = theme.palette.platform || {};

 const topbarBackground =
  platform.topbarBackground || platform.topbar || theme.palette.primary.dark;

  const topbarText = theme.palette.primary.contrastText;
  const accent = platform.accent || theme.palette.success.main;

  // ============================================
  // UI
  // ============================================

  return (
    <Box
      sx={{
        height,
        px: { xs: 2, md: 4 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: { xs: 1, md: 2 },
        color: topbarText,
        background: topbarBackground,
        borderBottom: `1px solid ${alpha(topbarText, 0.1)}`,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        overflow: "hidden",
      }}
    >
      {/* ===================================== */}
      {/* LEFT: MENU, LOGO, TITLE */}
      {/* ===================================== */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.5, md: 2.5 },
          minWidth: 0,
          flexShrink: 1,
        }}
      >
        <IconButton
          onClick={onMenuClick}
          sx={{
            color: topbarText,
            display: { xs: "inline-flex", lg: "none" },
            flexShrink: 0,
            "&:hover": {
              bgcolor: alpha(topbarText, 0.1),
            },
          }}
        >
          <MenuOutlinedIcon />
        </IconButton>

        <Box
          sx={{
            width: { xs: 64, sm: 76, md: 88 },
            height: { xs: 48, sm: 54, md: 60 },
            bgcolor: theme.palette.background.paper,
            borderRadius: 3,
            p: 0.7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: `1px solid ${alpha(topbarText, 0.16)}`,
            boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, 0.12)}`,
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
                fontWeight: 900,
                color: theme.palette.primary.main,
                fontSize: { xs: 13, md: 16 },
              }}
            >
              {school.schoolCode || "AUS"}
            </Typography>
          )}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: 16, sm: 19, md: 22 },
              lineHeight: 1.05,
              color: accent,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {context.title}
          </Typography>

          <Typography
            sx={{
              mt: 0.35,
              fontSize: { xs: 11, sm: 12.5, md: 14 },
              fontWeight: 700,
              color: alpha(topbarText, 0.82),
              display: { xs: "none", sm: "block" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {context.subtitle}
          </Typography>
        </Box>
      </Box>

      {/* ===================================== */}
      {/* CENTER: SEARCH */}
      {/* ===================================== */}

      <Box
        sx={{
          width: { md: 320, xl: 460 },
          height: 46,
          px: 2,
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          gap: 1.2,
          borderRadius: 999,
          bgcolor: alpha(topbarText, 0.1),
          border: `1px solid ${alpha(topbarText, 0.24)}`,
          backdropFilter: "blur(10px)",
          flexShrink: 1,
        }}
      >
        <SearchOutlinedIcon sx={{ color: alpha(topbarText, 0.9) }} />

        <InputBase
          fullWidth
          placeholder="Search anything..."
          sx={{
            color: topbarText,
            fontSize: 14,
            "& input::placeholder": {
              color: alpha(topbarText, 0.72),
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* ===================================== */}
      {/* RIGHT: ACTIONS + USER */}
      {/* ===================================== */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 0.3, sm: 0.7, md: 1 },
          flexShrink: 0,
        }}
      >
        <IconButton
          sx={{
            color: topbarText,
            "&:hover": { bgcolor: alpha(topbarText, 0.1) },
          }}
        >
          <Badge badgeContent={12} color="error">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>

        <IconButton
          sx={{
            color: topbarText,
            display: { xs: "none", sm: "inline-flex" },
            "&:hover": { bgcolor: alpha(topbarText, 0.1) },
          }}
        >
          <Badge badgeContent={5} color="error">
            <MailOutlineOutlinedIcon />
          </Badge>
        </IconButton>

        <IconButton
          sx={{
            color: topbarText,
            display: { xs: "none", md: "inline-flex" },
            "&:hover": { bgcolor: alpha(topbarText, 0.1) },
          }}
        >
          <SettingsOutlinedIcon />
        </IconButton>

        <IconButton
          sx={{
            color: topbarText,
            display: { xs: "none", md: "inline-flex" },
            "&:hover": { bgcolor: alpha(topbarText, 0.1) },
          }}
        >
          <HelpOutlineOutlinedIcon />
        </IconButton>

        <Box
          sx={{
            ml: { xs: 0.3, md: 1 },
            pl: { xs: 0, md: 1.6 },
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderLeft: {
              xs: "none",
              md: `1px solid ${alpha(topbarText, 0.2)}`,
            },
          }}
        >
          <Avatar
            sx={{
              width: { xs: 40, md: 46 },
              height: { xs: 40, md: 46 },
              bgcolor: theme.palette.background.paper,
              color: theme.palette.primary.main,
              fontWeight: 900,
              border: `2px solid ${accent}`,
            }}
          >
            {initial}
          </Avatar>

          <Box sx={{ display: { xs: "none", lg: "block" } }}>
            <Typography sx={{ fontWeight: 900, fontSize: 13.5 }}>
              {displayName}
            </Typography>

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: alpha(topbarText, 0.75),
              }}
            >
              {displayRole}
            </Typography>
          </Box>

          <KeyboardArrowDownOutlinedIcon
            sx={{
              opacity: 0.85,
              display: { xs: "none", sm: "block" },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}