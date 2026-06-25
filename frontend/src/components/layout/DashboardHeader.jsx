// ============================================
// ARAB UNITY SCHOOL
// Super Admin Dashboard Header
//
// Purpose:
// Displays the dashboard page title,
// subtitle, and refresh action.
//
// Reusable:
// Yes. Can be reused by future admin dashboards.
//
// Future Backend:
// Refresh button will later reload dashboard API data.
// ============================================

// ============================================
// Imports
// ============================================

import { Box, Typography, Button } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

// ============================================
// Component
// ============================================

export default function DashboardHeader() {
  return (
    <Box
      sx={{
        mb: 1.25,
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        gap: 2,
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Page Title Area */}
      <Box>
        <Typography
          fontWeight={900}
          color="#0f172a"
          sx={{
            fontSize: { xs: "1.7rem", md: "2.2rem" },
            lineHeight: 1.15,
          }}
        >
          Super Admin Dashboard
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.2,
            fontSize: { xs: "0.9rem", md: "1rem" },
          }}
        >
          Manage users, permissions, modules, audit logs and platform operations.
        </Typography>
      </Box>

      {/* Refresh Button */}
      <Button
        variant="contained"
        startIcon={<RefreshOutlinedIcon />}
        sx={{
          px: 2.2,
          py: 1,
          borderRadius: 3,
          textTransform: "none",
          fontWeight: 800,
          bgcolor: "#0f5132",
          boxShadow: "0 8px 18px rgba(15, 81, 50, 0.25)",
          "&:hover": {
            bgcolor: "#0b3d26",
            boxShadow: "0 10px 22px rgba(15, 81, 50, 0.32)",
          },
        }}
      >
        Refresh
      </Button>
    </Box>
  );
}

// ============================================
// End Component
// ============================================