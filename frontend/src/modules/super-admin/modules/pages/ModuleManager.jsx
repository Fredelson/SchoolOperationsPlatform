// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Manager
// Phase 3 Super Admin UI Foundation
// ============================================

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";

import usePageTitle from "@platform/hooks/usePageTitle";

const modules = [
  { name: "Printing", status: "Active", flag: "ON" },
  { name: "IT Tickets", status: "Inactive", flag: "OFF" },
  { name: "Assets", status: "Inactive", flag: "OFF" },
  { name: "Observations", status: "Active", flag: "ON" },
];

export default function ModuleManager() {
  usePageTitle("AUS | Module Manager");

  return (
    <Box>
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
            Module Manager
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Enable, disable, and control platform modules.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
        >
          Add Module
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        {modules.map((module) => (
          <Grid item xs={12} sm={6} md={3} key={module.name}>
            <Card
              sx={{
                borderRadius: 4,
                border: "1px solid #e5e7eb",
                boxShadow: "0 14px 35px rgba(15, 23, 42, 0.06)",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: "#ecfdf5",
                    color: "#047857",
                    display: "grid",
                    placeItems: "center",
                    mb: 2,
                  }}
                >
                  <AppsOutlinedIcon />
                </Box>

                <Typography fontWeight={900}>
                  {module.name}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  <Chip
                    size="small"
                    label={module.status}
                    color={module.status === "Active" ? "success" : "default"}
                  />

                  <Chip
                    size="small"
                    label={module.flag}
                    color={module.flag === "ON" ? "success" : "warning"}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
