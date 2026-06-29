// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget Manager Page
// Phase 3 Super Admin UI Foundation
// ============================================
//
// Description:
// This page allows Super Admin to manage
// dashboard widgets across the whole platform.
//
// Responsibilities:
// - Display registered widgets
// - Connect widgets to modules
// - Control widget visibility
// - Prepare dashboard builder foundation
//
// Future Enhancements:
// - Drag and drop dashboard builder
// - Role-based widget visibility
// - Widget size and layout control
// - Widget preview by role
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
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";

import usePageTitle from "@platform/hooks/usePageTitle";

// ============================================
// Temporary Widget Data
// Later this will come from backend database
// ============================================

const widgets = [
  {
    name: "System Health",
    module: "SuperAdmin",
    status: "Active",
  },
  {
    name: "Printing Queue",
    module: "Printing",
    status: "Active",
  },
  {
    name: "Inventory Summary",
    module: "Printing",
    status: "Active",
  },
];

// ============================================
// Widget Manager Component
// ============================================

export default function WidgetManager() {
  usePageTitle("AUS | Widget Manager");

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
            Widget Manager
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage dashboard widgets, visibility, and future dashboard builder rules.
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
          Add Widget
        </Button>
      </Box>

      {/* Widget List */}
      <Stack spacing={2}>
        {widgets.map((item) => (
          <Card
            key={`${item.module}-${item.name}`}
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
                  <WidgetsOutlinedIcon />
                </Box>

                <Box>
                  <Typography fontWeight={900}>{item.name}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Module: {item.module}
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
