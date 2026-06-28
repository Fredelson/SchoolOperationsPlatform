// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Branding Mapper
// ============================================

const { BRANDING_DEFAULTS } = require("../constants/brandingDefaults");

const mapBrandingResponse = (row) => {
  return {
    school: {
      schoolId: row.SchoolId,
      schoolCode: row.SchoolCode || BRANDING_DEFAULTS.schoolCode,
      schoolName: row.SchoolName || BRANDING_DEFAULTS.schoolName,
      address: row.Address || null,
      phone: row.Phone || null,
      email: row.Email || null,
      website: row.Website || null,
      timeZone: row.TimeZone || BRANDING_DEFAULTS.timeZone,
      currencyCode: row.CurrencyCode || BRANDING_DEFAULTS.currencyCode,
    },

    branding: {
      brandingId: row.BrandingId || null,

      primaryColor: row.PrimaryColor || BRANDING_DEFAULTS.primaryColor,
      secondaryColor: row.SecondaryColor || BRANDING_DEFAULTS.secondaryColor,
      accentColor: row.AccentColor || BRANDING_DEFAULTS.accentColor,

      sidebarColor: row.SidebarColor || BRANDING_DEFAULTS.sidebarColor,
      topbarColor: row.TopbarColor || BRANDING_DEFAULTS.topbarColor,
      loginCardColor: row.LoginCardColor || BRANDING_DEFAULTS.loginCardColor,

      sidebarBackgroundType: row.SidebarBackgroundType || "solid",
      sidebarGradientStart: row.SidebarGradientStart || null,
      sidebarGradientMiddle: row.SidebarGradientMiddle || null,
      sidebarGradientEnd: row.SidebarGradientEnd || null,
      sidebarGradientDirection: row.SidebarGradientDirection || "180deg",
      sidebarGradientPosition: row.SidebarGradientPosition || "center",

      topbarBackgroundType: row.TopbarBackgroundType || "solid",
      topbarGradientStart: row.TopbarGradientStart || null,
      topbarGradientMiddle: row.TopbarGradientMiddle || null,
      topbarGradientEnd: row.TopbarGradientEnd || null,
      topbarGradientDirection: row.TopbarGradientDirection || "90deg",
      topbarGradientPosition: row.TopbarGradientPosition || "center",

      loginTitle: row.LoginTitle || row.SchoolName || BRANDING_DEFAULTS.loginTitle,
      loginSubtitle: row.LoginSubtitle || BRANDING_DEFAULTS.loginSubtitle,
      footerText: row.FooterText || BRANDING_DEFAULTS.footerText,

      supportEmail: row.SupportEmail || row.Email || null,
      supportPhone: row.SupportPhone || row.Phone || null,

      logoPath: row.LogoPath || null,
      smallLogoPath: row.SmallLogoPath || null,
      darkLogoPath: row.DarkLogoPath || null,
      faviconPath: row.FaviconPath || null,
      loginBackgroundPath: row.LoginBackgroundPath || null,
    },
  };
};

module.exports = {
  mapBrandingResponse,
};