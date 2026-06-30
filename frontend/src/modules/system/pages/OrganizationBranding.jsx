// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Organization & Branding Page
// ============================================

import { useEffect, useState } from "react";
import { Alert, Box, Card, CardContent, Stack, Typography } from "@mui/material";

import useBranding from "../hooks/useBranding";
import { updateSystemBranding } from "../services/brandingService";

import SchoolProfileCard from "../components/branding/SchoolProfileCard";
import PlatformColorsCard from "../components/branding/PlatformColorsCard";
import BackgroundBuilderCard from "../components/branding/BackgroundBuilderCard";
import LoginBrandingCard from "../components/branding/LoginBrandingCard";
import BrandingActions from "../components/branding/BrandingActions";
import { AppPageHeader } from "../../../platform/ui";
import BrandingMediaCard from "../components/branding/BrandingMediaCard";
import usePageTitle from "@platform/hooks/usePageTitle";

export default function OrganizationBranding() {
  const { branding, refreshBranding } = useBranding();
  usePageTitle("Organization & Branding");

  const [form, setForm] = useState({
    school: {
      schoolName: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      timeZone: "Asia/Dubai",
      currencyCode: "AED",
    },
    branding: {
      primaryColor: "#1E3A8A",
      secondaryColor: "#2563EB",
      accentColor: "#16A34A",
      loginCardColor: "#FFFFFF",

      sidebarColor: "#061B52",
      sidebarBackgroundType: "solid",
      sidebarGradientStart: "#002B5B",
      sidebarGradientMiddle: "",
      sidebarGradientEnd: "#061B52",
      sidebarGradientDirection: "180deg",
      sidebarGradientPosition: "center",

      topbarColor: "#071B4D",
      topbarBackgroundType: "solid",
      topbarGradientStart: "#007A3D",
      topbarGradientMiddle: "",
      topbarGradientEnd: "#002B5B",
      topbarGradientDirection: "90deg",
      topbarGradientPosition: "center",

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

  useEffect(() => {
    if (!branding) return;

    setForm({
      school: {
        schoolName: branding.school?.schoolName || "",
        address: branding.school?.address || "",
        phone: branding.school?.phone || "",
        email: branding.school?.email || "",
        website: branding.school?.website || "",
        timeZone: branding.school?.timeZone || "Asia/Dubai",
        currencyCode: branding.school?.currencyCode || "AED",
      },
      branding: {
        primaryColor: branding.branding?.primaryColor || "#1E3A8A",
        secondaryColor: branding.branding?.secondaryColor || "#2563EB",
        accentColor: branding.branding?.accentColor || "#16A34A",
        loginCardColor: branding.branding?.loginCardColor || "#FFFFFF",

        sidebarColor: branding.branding?.sidebarColor || "#061B52",
        sidebarBackgroundType:
          branding.branding?.sidebarBackgroundType || "solid",
        sidebarGradientStart:
          branding.branding?.sidebarGradientStart || "#002B5B",
        sidebarGradientMiddle:
          branding.branding?.sidebarGradientMiddle || "",
        sidebarGradientEnd:
          branding.branding?.sidebarGradientEnd || "#061B52",
        sidebarGradientDirection:
          branding.branding?.sidebarGradientDirection || "180deg",
        sidebarGradientPosition:
          branding.branding?.sidebarGradientPosition || "center",

        topbarColor: branding.branding?.topbarColor || "#071B4D",
        topbarBackgroundType:
          branding.branding?.topbarBackgroundType || "solid",
        topbarGradientStart:
          branding.branding?.topbarGradientStart || "#007A3D",
        topbarGradientMiddle:
          branding.branding?.topbarGradientMiddle || "",
        topbarGradientEnd:
          branding.branding?.topbarGradientEnd || "#002B5B",
        topbarGradientDirection:
          branding.branding?.topbarGradientDirection || "90deg",
        topbarGradientPosition:
          branding.branding?.topbarGradientPosition || "center",

        loginTitle: branding.branding?.loginTitle || "",
        loginSubtitle: branding.branding?.loginSubtitle || "",
        footerText: branding.branding?.footerText || "",
        supportEmail: branding.branding?.supportEmail || "",
        supportPhone: branding.branding?.supportPhone || "",
      },
    });
  }, [branding]);

  const updateField = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateBrandingField = (field, value) => {
    updateField("branding", field, value);
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

  const inputGrid = {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      lg: "repeat(3, 1fr)",
    },
    gap: 2,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <AppPageHeader
        title="Organization & Branding"
        subtitle="Manage school identity, platform colors, backgrounds, logos, and login branding."
      />

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

      <Stack spacing={3}>
        <SchoolProfileCard
          form={form}
          updateField={updateField}
          inputGrid={inputGrid}
        />

        <PlatformColorsCard
          form={form}
          updateBrandingField={updateBrandingField}
          inputGrid={inputGrid}
        />

        <Card>
          <CardContent>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                gap: 3,
              }}
            >
              <BackgroundBuilderCard
                title="Sidebar Background"
                description="Controls the platform sidebar background."
                typeField="sidebarBackgroundType"
                colorField="sidebarColor"
                startField="sidebarGradientStart"
                middleField="sidebarGradientMiddle"
                endField="sidebarGradientEnd"
                directionField="sidebarGradientDirection"
                positionField="sidebarGradientPosition"
                form={form}
                updateBrandingField={updateBrandingField}
              />

              <BackgroundBuilderCard
                title="Topbar Background"
                description="Controls the platform topbar background."
                typeField="topbarBackgroundType"
                colorField="topbarColor"
                startField="topbarGradientStart"
                middleField="topbarGradientMiddle"
                endField="topbarGradientEnd"
                directionField="topbarGradientDirection"
                positionField="topbarGradientPosition"
                form={form}
                updateBrandingField={updateBrandingField}
              />
            </Box>
          </CardContent>
        </Card>

        <BrandingMediaCard
          branding={branding}
          refreshBranding={refreshBranding}
        />

        <LoginBrandingCard
          form={form}
          updateBrandingField={updateBrandingField}
          inputGrid={inputGrid}
        />

        <BrandingActions saving={saving} onSave={handleSave} />
      </Stack>
    </Box>
  );
}