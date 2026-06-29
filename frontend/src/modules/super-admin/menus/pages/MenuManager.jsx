// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Menu Manager Page
// Phase 3 Super Admin UI Foundation
// ============================================
//
// Description:
// This page will allow Super Admin to manage
// sidebar/menu items for the whole platform.
//
// Responsibilities:
// - Display platform menu items
// - Control menu visibility
// - Control menu order
// - Connect menus to modules
// - Connect menus to permissions
//
// Future Enhancements:
// - Drag and drop menu ordering
// - Parent/child menu grouping
// - Icon selector
// - Role-based menu preview
//
// ============================================

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";

import usePageTitle from "@platform/hooks/usePageTitle";

// ============================================
// Temporary Menu Data
// Later this will come from backend database
// ============================================

const menuItems = [
  {
    label: "Dashboard",
    module: "SuperAdmin",
    path: "/super-admin/dashboard",
    status: "Visible",
    order: 1,
  },
  {
    label: "Module Manager",
    module: "SuperAdmin",
    path: "/super-admin/modules",
    status: "Visible",
    order: 2,
  },
  {
    label: "Menu Manager",
    module: "SuperAdmin",
    path: "/super-admin/menus",
    status: "Visible",
    order: 3,
  },
];

// ============================================
// Menu Manager Component
// ============================================

export default function MenuManager() {
  usePageTitle("AUS | Menu Manager");

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Menu Manager
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage sidebar menus, routes, order, visibility, and permissions.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Add Menu
        </Button>
      </Box>

      {/* Menu List */}
      <Stack spacing={2}>
        {menuItems.map((item) => (
          <Card
            key={item.path}
            sx={{
              borderRadius: 4,
              border: "1px solid #e5e7eb",
              boxShadow: "0 14px 35px rgba(15, 23, 42, 0.06)",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              {/* Left Section */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 3,
                    bgcolor: "#ecfdf5",
                    color: "#047857",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <MenuOpenOutlinedIcon />
                </Box>

                <Box>
                  <Typography fontWeight={900}>{item.label}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {item.path}
                  </Typography>
                </Box>
              </Box>

              {/* Right Section */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip size="small" label={`Order ${item.order}`} />

                <Chip
                  size="small"
                  label={item.module}
                  color="success"
                  variant="outlined"
                />

                <Chip
                  size="small"
                  label={item.status}
                  color={item.status === "Visible" ? "success" : "default"}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
