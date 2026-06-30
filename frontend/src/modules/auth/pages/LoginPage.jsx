// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Login Page
// ============================================
//
// Purpose:
// Handles authentication and role-based redirect.
// Uses platform branding and MUI theme colors.
// ============================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  useTheme,
  alpha,
} from "@mui/material";

import { useAuth } from "../../../context/AuthContext";
import useBranding from "../../../modules/system/hooks/useBranding";
import buildFileUrl from "../../../platform/utils/buildFileUrl";

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const { login } = useAuth();
  const { branding } = useBranding();

  const school = branding?.school || {};
  const brand = branding?.branding || {};

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ============================================
  // Redirect User Based On Role
  // ============================================

  const redirectByRole = (role) => {
    switch (role) {
      case "Teacher":
      case "TeachingAssistant":
        navigate("/teacher/dashboard");
        break;

      case "HOD":
        navigate("/hod/dashboard");
        break;

      case "HOS":
      case "Secretary":
        navigate("/hos/dashboard");
        break;

      case "PrintingAdmin":
      case "Admin":
        navigate("/printing/dashboard");
        break;

      case "SuperAdmin":
        navigate("/super-admin/dashboard");
        break;

      default:
        navigate("/login");
        break;
    }
  };

  // ============================================
  // Login Handler
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const loggedUser = await login(employeeId.trim(), password.trim());
      redirectByRole(loggedUser.role);
    } catch (err) {
      console.error(err);
      setError("Invalid employee ID or password");
    }
  };

  // ============================================
  // UI
  // ============================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        backgroundImage: brand.loginBackgroundPath
          ? `url(${buildFileUrl(brand.loginBackgroundPath)})`
          : theme.palette.background.default,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: 500,
          maxWidth: "100%",
          borderRadius: 4,
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[8],
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          {brand.logoPath && (
            <Box
              component="img"
              src={buildFileUrl(brand.logoPath)}
              alt={school.schoolName || "School Logo"}
              sx={{
                width: 90,
                height: 90,
                objectFit: "contain",
                mb: 2,
              }}
            />
          )}

          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 900,
              color: theme.palette.primary.main,
              lineHeight: 1.15,
            }}
          >
            {brand.loginTitle || school.schoolName || "Arab Unity School"}
          </Typography>

          <Typography
            sx={{
              fontSize: 18,
              color: theme.palette.text.secondary,
              mb: 3,
            }}
          >
            {brand.loginSubtitle || "Operations Platform"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                height: 55,
                fontSize: 18,
                fontWeight: 800,
                borderRadius: theme.shape.borderRadius,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,

                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                  boxShadow: `0 8px 20px ${alpha(
                    theme.palette.primary.main,
                    0.28
                  )}`,
                },
              }}
            >
              LOGIN
            </Button>
          </Box>

          <Typography
            sx={{
              mt: 3,
              textAlign: "center",
              fontSize: 13,
              color: theme.palette.text.secondary,
            }}
          >
            {brand.footerText || "Arab Unity School Operations Platform"}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
