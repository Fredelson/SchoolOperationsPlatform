// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Feature Flags Page
// Phase 3 Super Admin UI Foundation
// ============================================
//
// Description:
// This page allows Super Admin to enable or
// disable platform features/modules from the UI.
//
// Responsibilities:
// - Display feature flags
// - Show enabled/disabled state
// - Prepare toggle controls
// - Connect future module visibility rules
//
// Future Enhancements:
// - Backend toggle update
// - Audit log tracking
// - Role-based feature preview
// - Module dependency warnings
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

import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";

import usePageTitle from "@platform/hooks/usePageTitle";

// ============================================
// Temporary Feature Flag Data
// Later this will come from backend database
// ============================================

const featureFlags = [
  {
    name: "Printing",
    description: "Photocopy request, approval, printing, and inventory module.",
    enabled: true,
  },
  {
    name: "IT Tickets",
    description: "IT support ticketing and request management module.",
    enabled: false,
  },
  {
    name: "Assets",
    description: "IT asset tracking, ownership, and asset history module.",
    enabled: false,
  },
  {
    name: "Observations",
    description: "Classroom observation and school monitoring module.",
    enabled: true,
  },
];

// ============================================
// Feature Flags Component
// ============================================

export default function FeatureFlags() {
  usePageTitle("AUS | Feature Flags");

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Feature Flags
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Enable or disable platform features without changing code.
        </Typography>
      </Box>

      {/* Feature Flag List */}
      <Stack spacing={2}>
        {featureFlags.map((item) => (
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
                  <FlagOutlinedIcon />
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

                <Switch checked={item.enabled} disabled />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
