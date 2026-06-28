// ============================================
// ARAB UNITY SCHOOL
// Platform Theme Palette
// ============================================

const DEFAULT_COLORS = {
  primary: "#1E3A8A",
  secondary: "#2563EB",
  accent: "#16A34A",
  sidebar: "#061B52",
  topbar: "#071B4D",
  loginCard: "#FFFFFF",
  background: "#F8FAFC",
  paper: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  divider: "#E8EDF3",
};

const buildBackground = ({
  type = "solid",
  solidColor,
  start,
  middle,
  end,
  direction,
  position,
}) => {
  if (type === "linear") {
    return middle
      ? `linear-gradient(${direction || "90deg"}, ${start}, ${middle}, ${end})`
      : `linear-gradient(${direction || "90deg"}, ${start}, ${end})`;
  }

  if (type === "radial") {
    return middle
      ? `radial-gradient(circle at ${position || "center"}, ${start}, ${middle}, ${end})`
      : `radial-gradient(circle at ${position || "center"}, ${start}, ${end})`;
  }

  if (type === "conic") {
    return middle
      ? `conic-gradient(from ${direction || "0deg"} at ${position || "center"}, ${start}, ${middle}, ${end}, ${start})`
      : `conic-gradient(from ${direction || "0deg"} at ${position || "center"}, ${start}, ${end}, ${start})`;
  }

  return solidColor;
};

export function buildPalette(branding = {}) {
  const sidebarBackgroundType =
    branding.sidebarBackgroundType || "solid";

  const topbarBackgroundType =
    branding.topbarBackgroundType || "solid";

  const sidebarStart =
    branding.sidebarGradientStart || branding.sidebarColor || DEFAULT_COLORS.sidebar;

  const sidebarMiddle =
    branding.sidebarGradientMiddle || null;

  const sidebarEnd =
    branding.sidebarGradientEnd || DEFAULT_COLORS.sidebar;

  const topbarStart =
    branding.topbarGradientStart || branding.topbarColor || DEFAULT_COLORS.topbar;

  const topbarMiddle =
    branding.topbarGradientMiddle || null;

  const topbarEnd =
    branding.topbarGradientEnd || DEFAULT_COLORS.topbar;

  const sidebarBackground = buildBackground({
    type: sidebarBackgroundType,
    solidColor: branding.sidebarColor || DEFAULT_COLORS.sidebar,
    start: sidebarStart,
    middle: sidebarMiddle,
    end: sidebarEnd,
    direction: branding.sidebarGradientDirection || "180deg",
    position: branding.sidebarGradientPosition || "center",
  });

  const topbarBackground = buildBackground({
    type: topbarBackgroundType,
    solidColor: branding.topbarColor || DEFAULT_COLORS.topbar,
    start: topbarStart,
    middle: topbarMiddle,
    end: topbarEnd,
    direction: branding.topbarGradientDirection || "90deg",
    position: branding.topbarGradientPosition || "center",
  });

  return {
    primary: {
      main: branding.primaryColor || DEFAULT_COLORS.primary,
      dark: branding.sidebarColor || DEFAULT_COLORS.sidebar,
      contrastText: DEFAULT_COLORS.paper,
    },

    secondary: {
      main: branding.secondaryColor || DEFAULT_COLORS.secondary,
      contrastText: DEFAULT_COLORS.paper,
    },

    success: {
      main: branding.accentColor || DEFAULT_COLORS.accent,
      dark: branding.accentColor || DEFAULT_COLORS.accent,
      contrastText: DEFAULT_COLORS.paper,
    },

    background: {
      default: DEFAULT_COLORS.background,
      paper: branding.loginCardColor || DEFAULT_COLORS.paper,
    },

    text: {
      primary: DEFAULT_COLORS.textPrimary,
      secondary: DEFAULT_COLORS.textSecondary,
    },

    divider: DEFAULT_COLORS.divider,

    platform: {
      accent: branding.accentColor || DEFAULT_COLORS.accent,
      loginCard: branding.loginCardColor || DEFAULT_COLORS.loginCard,

      sidebar: branding.sidebarColor || DEFAULT_COLORS.sidebar,
      topbar: branding.topbarColor || DEFAULT_COLORS.topbar,

      sidebarBackgroundType,
      topbarBackgroundType,

      sidebarGradientStart: sidebarStart,
      sidebarGradientMiddle: sidebarMiddle,
      sidebarGradientEnd: sidebarEnd,
      sidebarGradientDirection: branding.sidebarGradientDirection || "180deg",
      sidebarGradientPosition: branding.sidebarGradientPosition || "center",

      topbarGradientStart: topbarStart,
      topbarGradientMiddle: topbarMiddle,
      topbarGradientEnd: topbarEnd,
      topbarGradientDirection: branding.topbarGradientDirection || "90deg",
      topbarGradientPosition: branding.topbarGradientPosition || "center",

      sidebarBackground,
      topbarBackground,
    },
  };
}