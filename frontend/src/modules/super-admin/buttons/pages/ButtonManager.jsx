// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Manager Page
// Phase 3 Super Admin UI Foundation
// ============================================
//
// Description:
// This page allows Super Admin to manage
// action buttons across the whole platform.
//
// Responsibilities:
// - Display registered buttons/actions
// - Connect buttons to modules
// - Connect buttons to permissions
// - Control button visibility
// - Prepare future UI-based permission control
//
// Future Enhancements:
// - Add/Edit/Delete buttons from UI
// - Assign buttons to roles
// - Button order control
// - Button preview by role
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
import TouchAppOutlinedIcon from "@mui/icons-material/TouchAppOutlined";

import usePageTitle from "@platform/hooks/usePageTitle";

// ============================================
// Temporary Button Data
// Later this will come from backend database
// ============================================

const actionButtons = [
  {
    name: "Create User",
    module: "Users",
    permission: "Users.Create",
    status: "Active",
  },
  {
    name: "Edit User",
    module: "Users",
    permission: "Users.Edit",
    status: "Active",
  },
  {
    name: "Delete User",
    module: "Users",
    permission: "Users.Delete",
    status: "Active",
  },
];

// ============================================
// Button Manager Component
// ============================================

export default function ButtonManager() {
  usePageTitle("AUS | Button Manager");

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
            Button Manager
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage action buttons, permissions, and visibility rules.
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
          Add Button
        </Button>
      </Box>

      {/* Button Action List */}
      <Stack spacing={2}>
        {actionButtons.map((item) => (
          <Card
            key={item.permission}
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
                  <TouchAppOutlinedIcon />
                </Box>

                <Box>
                  <Typography fontWeight={900}>{item.name}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {item.permission}
                  </Typography>
                </Box>
              </Box>

              {/* Right Section */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  size="small"
                  label={item.module}
                  color="success"
                  variant="outlined"
                />

                <Chip
                  size="small"
                  label={item.status}
                  color={item.status === "Active" ? "success" : "default"}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
