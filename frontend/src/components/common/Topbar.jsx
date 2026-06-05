// ============================================
// ARAB UNITY SCHOOL
// Reusable Topbar
// Full-width topbar controlled by DashboardLayout
// ============================================

import {
  Box,
  TextField,
  Avatar,
  Badge,
  IconButton,
  Typography,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LightModeIcon from "@mui/icons-material/LightMode";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function Topbar({
  userName = "Ahmed Khan",
  role = "Teacher",
}) {
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

        {/* Search */}
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
        <IconButton>
          <LightModeIcon />
        </IconButton>

        <IconButton>
          <Badge badgeContent={8} color="error">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 44, height: 44 }} />

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
      </Box>
    </Box>
  );
}