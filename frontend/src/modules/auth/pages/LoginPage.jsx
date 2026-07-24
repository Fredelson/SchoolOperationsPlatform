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

  const {
    login,
    logout,
    user,
    completeRequiredPasswordChange,
  } = useAuth();
  const { branding } = useBranding();

  const school = branding?.school || {};
  const brand = branding?.branding || {};

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [passwordChangeUser, setPasswordChangeUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const requiresPasswordChange = Boolean(
    passwordChangeUser || user?.mustChangePassword
  );

  // ============================================
  // Redirect User Based On Role
  // ============================================

  const redirectToWorkspace = (defaultWorkspaceRoute) => {
    if (defaultWorkspaceRoute?.startsWith("/")) {
      navigate(defaultWorkspaceRoute, { replace: true });
      return;
    }

    // Fallback to profile when workspace landing route is missing or invalid.
    navigate("/profile", { replace: true });
  };

  // ============================================
  // Login Handler
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const loggedUser = await login(identifier.trim(), password);
      if (loggedUser.mustChangePassword) {
        setPasswordChangeUser(loggedUser);
        setPassword("");
        return;
      }
      redirectToWorkspace(loggedUser.defaultWorkspaceRoute);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message||err.message||"Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequiredPasswordChange = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New password confirmation does not match.");
      return;
    }

    const validPassword = newPassword.length >= 8;

    if (!validPassword) {
      setError("Your first password must be at least 8 characters.");
      return;
    }

    try {
      setSubmitting(true);
      const refreshedUser = await completeRequiredPasswordChange({
        newPassword,
      });
      setPasswordChangeUser(null);
      setNewPassword("");
      setConfirmPassword("");
      redirectToWorkspace(refreshedUser.defaultWorkspaceRoute);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message||err.message||"Unable to change password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseAnotherAccount = () => {
    logout();
    setPasswordChangeUser(null);
    setNewPassword("");
    setConfirmPassword("");
    setIdentifier("");
    setPassword("");
    setError("");
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
              fontSize: 20,
              fontWeight: 900,
              color: theme.palette.primary.main,
              lineHeight: 1.15,
            }}
          >
            {requiresPasswordChange
              ? "Change Your Password"
              : brand.loginTitle || school.schoolName || "Arab Unity School"}
          </Typography>

          <Typography
            sx={{
              fontSize: 18,
              color: theme.palette.text.secondary,
              mb: 3,
            }}
          >
            {requiresPasswordChange
              ? "Required before your first workspace access"
              : brand.loginSubtitle || "Operations Platform"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {requiresPasswordChange ? (
            <Box component="form" onSubmit={handleRequiredPasswordChange}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                You must replace your temporary password before continuing.
              </Alert>

              <TextField
                fullWidth
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                helperText="At least 8 characters."
                margin="normal"
              />

              <TextField
                fullWidth
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                margin="normal"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={
                  submitting ||
                  !newPassword ||
                  !confirmPassword
                }
                sx={{
                  mt: 3,
                  height: 55,
                  fontSize: 17,
                  fontWeight: 800,
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                {submitting ? "CHANGING..." : "CHANGE PASSWORD"}
              </Button>

              <Button
                fullWidth
                onClick={handleUseAnotherAccount}
                disabled={submitting}
                sx={{ mt: 1 }}
              >
                Use another account
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="ID Number or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                margin="normal"
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                margin="normal"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={submitting || !identifier.trim() || !password}
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
                {submitting ? "SIGNING IN..." : "LOGIN"}
              </Button>
            </Box>
          )}

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
