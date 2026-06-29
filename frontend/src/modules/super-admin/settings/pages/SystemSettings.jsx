// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// System Settings Page
// Phase 3 Super Admin UI Foundation
// ============================================
//
// Description:
// This page allows Super Admin to manage
// platform-wide system configuration.
//
// Responsibilities:
// - Display general system settings
// - Prepare editable configuration rows
// - Prepare backup/security settings
// - Centralize platform behavior controls
//
// Future Enhancements:
// - Backend settings API
// - Save setting updates
// - Email notification rules
// - Backup and restore controls
// - Security policy settings
//
// ============================================

import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import usePageTitle from "@platform/hooks/usePageTitle";

// ============================================
// Temporary Settings Data
// Later this will come from backend database
// ============================================

const settings = [
  {
    name: "Email Notifications",
    description: "Send email notifications for approvals, rejections, and completed jobs.",
    enabled: true,
  },
  {
    name: "Audit Logging",
    description: "Track important user actions and system events.",
    enabled: true,
  },
  {
    name: "Maintenance Mode",
    description: "Temporarily disable user access while system maintenance is active.",
    enabled: false,
  },
];

// ============================================
// System Settings Component
// ============================================

export default function SystemSettings() {
  usePageTitle("AUS | System Settings");

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          System Settings
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Manage global platform configuration and system behavior.
        </Typography>
      </Box>

      {/* Settings List */}
      <Stack spacing={2}>
        {settings.map((item) => (
          <Card
            key={item.name}
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
                    bgcolor: item.enabled ? "#ecfdf5" : "#f1f5f9",
                    color: item.enabled ? "#047857" : "#64748b",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <SettingsOutlinedIcon />
                </Box>

                <Box>
                  <Typography fontWeight={900}>{item.name}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </Box>

              {/* Right Section */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Chip
                  size="small"
                  label={item.enabled ? "Enabled" : "Disabled"}
                  color={item.enabled ? "success" : "default"}
                />

                {/* Disabled for now because backend save is not connected yet */}
                <Switch checked={item.enabled} disabled />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
