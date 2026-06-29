// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Roles Manager Page
// Phase 3 Super Admin UI Foundation
// ============================================
//
// Description:
// This page allows Super Admin to manage
// platform roles and access levels.
//
// Responsibilities:
// - Display system roles
// - Show role descriptions
// - Show active/inactive state
// - Prepare role permission assignment
//
// Future Enhancements:
// - Add/Edit/Delete roles
// - Assign permissions to roles
// - Clone role permissions
// - Role-based dashboard preview
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
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

import usePageTitle from "@platform/hooks/usePageTitle";

// ============================================
// Temporary Role Data
// Later this will come from backend database
// ============================================

const roles = [
  {
    name: "Super Admin",
    key: "SuperAdmin",
    description: "Full system access and platform control.",
    status: "Active",
  },
  {
    name: "Printing Admin",
    key: "PrintingAdmin",
    description: "Manages printing queue, inventory, and completed jobs.",
    status: "Active",
  },
  {
    name: "Teacher",
    key: "Teacher",
    description: "Creates and tracks own photocopy requests.",
    status: "Active",
  },
];

// ============================================
// Roles Manager Component
// ============================================

export default function RolesManager() {
  usePageTitle("AUS | Roles Manager");

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
            Roles Manager
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage roles, access levels, and future permission assignments.
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
          Add Role
        </Button>
      </Box>

      {/* Roles List */}
      <Stack spacing={2}>
        {roles.map((role) => (
          <Card
            key={role.key}
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
                  <ShieldOutlinedIcon />
                </Box>

                <Box>
                  <Typography fontWeight={900}>{role.name}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {role.description}
                  </Typography>
                </Box>
              </Box>

              {/* Right Section */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip size="small" label={role.key} variant="outlined" />

                <Chip
                  size="small"
                  label={role.status}
                  color={role.status === "Active" ? "success" : "default"}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
