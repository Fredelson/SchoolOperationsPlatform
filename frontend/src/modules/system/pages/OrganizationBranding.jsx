// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Organization & Branding Page
// ============================================
//
// Purpose:
// Allows Super Admin to manage school profile,
// platform colors, login text, and branding.
// ============================================

import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Alert,
  useTheme,
} from "@mui/material";

import useBranding from "../hooks/useBranding";
import {
  updateSystemBranding,
} from "../services/brandingService";

// ============================================
// Component
// ============================================

export default function OrganizationBranding() {
  const theme = useTheme();
  const { branding, refreshBranding } = useBranding();

  const [form, setForm] = useState({
    school: {
      schoolName: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      timeZone: "",
      currencyCode: "",
    },
    branding: {
      primaryColor: "",
      secondaryColor: "",
      accentColor: "",
      sidebarColor: "",
      topbarColor: "",
      loginCardColor: "",
      loginTitle: "",
      loginSubtitle: "",
      footerText: "",
      supportEmail: "",
      supportPhone: "",
    },
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================
  // Load current branding into form
  // ============================================

  useEffect(() => {
    if (!branding) return;

    setForm({
      school: {
        schoolName: branding.school?.schoolName || "",
        address: branding.school?.address || "",
        phone: branding.school?.phone || "",
        email: branding.school?.email || "",
        website: branding.school?.website || "",
        timeZone: branding.school?.timeZone || "",
        currencyCode: branding.school?.currencyCode || "",
      },
      branding: {
        primaryColor: branding.branding?.primaryColor || "",
        secondaryColor: branding.branding?.secondaryColor || "",
        accentColor: branding.branding?.accentColor || "",
        sidebarColor: branding.branding?.sidebarColor || "",
        topbarColor: branding.branding?.topbarColor || "",
        loginCardColor: branding.branding?.loginCardColor || "",
        loginTitle: branding.branding?.loginTitle || "",
        loginSubtitle: branding.branding?.loginSubtitle || "",
        footerText: branding.branding?.footerText || "",
        supportEmail: branding.branding?.supportEmail || "",
        supportPhone: branding.branding?.supportPhone || "",
      },
    });
  }, [branding]);

  // ============================================
  // Helpers
  // ============================================

  const updateField = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      await updateSystemBranding(form);
      await refreshBranding();

      setMessage("Organization and branding updated successfully.");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to update organization and branding."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // UI
  // ============================================

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Organization & Branding
        </Typography>

        <Typography color="text.secondary">
          Manage school identity, platform colors, and login branding.
        </Typography>
      </Stack>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* LEFT: FORM */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* Organization */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={900}>
                  Organization Information
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="School Name"
                      value={form.school.schoolName}
                      onChange={(e) =>
                        updateField("school", "schoolName", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={form.school.website}
                      onChange={(e) =>
                        updateField("school", "website", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={form.school.address}
                      onChange={(e) =>
                        updateField("school", "address", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={form.school.phone}
                      onChange={(e) =>
                        updateField("school", "phone", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={form.school.email}
                      onChange={(e) =>
                        updateField("school", "email", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Time Zone"
                      value={form.school.timeZone}
                      onChange={(e) =>
                        updateField("school", "timeZone", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Currency"
                      value={form.school.currencyCode}
                      onChange={(e) =>
                        updateField("school", "currencyCode", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={900}>
                  Platform Colors
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  {[
                    ["primaryColor", "Primary Color"],
                    ["secondaryColor", "Secondary Color"],
                    ["accentColor", "Accent Color"],
                    ["sidebarColor", "Sidebar Color"],
                    ["topbarColor", "Topbar Color"],
                    ["loginCardColor", "Login Card Color"],
                  ].map(([field, label]) => (
                    <Grid item xs={12} sm={6} md={4} key={field}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <Box
                          component="input"
                          type="color"
                          value={form.branding[field] || "#000000"}
                          onChange={(e) =>
                            updateField("branding", field, e.target.value)
                          }
                          sx={{
                            width: 56,
                            height: 56,
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            bgcolor: "transparent",
                          }}
                        />

                        <TextField
                          fullWidth
                          label={label}
                          value={form.branding[field] || ""}
                          onChange={(e) =>
                            updateField("branding", field, e.target.value)
                          }
                          placeholder="#000000"
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Login */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={900}>
                  Login Branding
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Login Title"
                      value={form.branding.loginTitle}
                      onChange={(e) =>
                        updateField("branding", "loginTitle", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Login Subtitle"
                      value={form.branding.loginSubtitle}
                      onChange={(e) =>
                        updateField("branding", "loginSubtitle", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Footer Text"
                      value={form.branding.footerText}
                      onChange={(e) =>
                        updateField("branding", "footerText", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Support Email"
                      value={form.branding.supportEmail}
                      onChange={(e) =>
                        updateField("branding", "supportEmail", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Support Phone"
                      value={form.branding.supportPhone}
                      onChange={(e) =>
                        updateField("branding", "supportPhone", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
              disabled={saving}
              sx={{ alignSelf: "flex-start", px: 4 }}
            >
              {saving ? "Saving..." : "Save Branding"}
            </Button>
          </Stack>
        </Grid>

        {/* RIGHT: LIVE PREVIEW */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ position: "sticky", top: 110 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={900}>
                Live Preview
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    height: 56,
                    bgcolor: form.branding.topbarColor,
                    color: theme.palette.primary.contrastText,
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    fontWeight: 900,
                  }}
                >
                  Topbar
                </Box>

                <Box sx={{ display: "flex", minHeight: 180 }}>
                  <Box
                    sx={{
                      width: 110,
                      bgcolor: form.branding.sidebarColor,
                      color: theme.palette.primary.contrastText,
                      p: 2,
                      fontWeight: 800,
                    }}
                  >
                    Sidebar
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: theme.palette.background.default,
                    }}
                  >
                    <Card
                      sx={{
                        p: 2,
                        bgcolor: form.branding.loginCardColor,
                      }}
                    >
                      <Typography
                        fontWeight={900}
                        sx={{ color: form.branding.primaryColor }}
                      >
                        {form.branding.loginTitle || "Login Title"}
                      </Typography>

                      <Typography
                        sx={{ color: form.branding.secondaryColor }}
                      >
                        {form.branding.loginSubtitle || "Login Subtitle"}
                      </Typography>

                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          mt: 2,
                          bgcolor: form.branding.primaryColor,
                        }}
                      >
                        Login Button
                      </Button>
                    </Card>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}