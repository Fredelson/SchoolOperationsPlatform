// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Guard
// Phase 2 Frontend Foundation
// ============================================
//
// Purpose:
// Protect full pages/routes based on module access.
//
// Example:
//
// <ModuleGuard module="Printing">

// </ModuleGuard>
//
// ============================================

import { Box, CircularProgress, Typography, Button } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../context/PermissionContext";

export default function ModuleGuard({
  children,
  module,
  fallback = null,
}) {
  const navigate = useNavigate();

  const {
    loading,
    canAccessModule,
    hasRole,
  } = usePermissions();

  // Super Admin always has access
  const isSuperAdmin = hasRole("SuperAdmin");

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const allowed = isSuperAdmin || canAccessModule(module);

  if (!allowed) {
    if (fallback) return fallback;

    return (
      <Box
        sx={{
          minHeight: "65vh",
          display: "grid",
          placeItems: "center",
          px: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: 420,
            textAlign: "center",
            bgcolor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 4,
            p: 4,
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
          }}
        >
          <LockOutlinedIcon
            sx={{
              fontSize: 48,
              color: "#0f766e",
              mb: 1.5,
            }}
          />

          <Typography variant="h6" fontWeight={800}>
            Access Restricted
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mt: 1,
              mb: 3,
            }}
          >
            You do not have permission to access this module.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  return children;
}
