// ============================================
// Platform Theme Palette
// ============================================
//
// Purpose:
// Builds MUI colors and platform gradients
// from database branding.
// ============================================

const DEFAULT_COLORS = {
  primary: "#1E3A8A",
  secondary: "#2563EB",
  accent: "#16A34A",

  sidebar: "#061B52",
  topbar: "#071B4D",

  sidebarGradientStart: "#002B5B",
  sidebarGradientEnd: "#061B52",
  sidebarGradientDirection: "180deg",

  topbarGradientStart: "#007A3D",
  topbarGradientEnd: "#002B5B",
  topbarGradientDirection: "90deg",

  loginCard: "#FFFFFF",
  background: "#F8FAFC",
  paper: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  divider: "#E8EDF3",
};

// ============================================================
// Build CSS Linear Gradient
// ============================================================

const buildGradient = (direction, start, end) => {
  return `linear-gradient(${direction}, ${start}, ${end})`;
};

// ============================================================
// Build MUI Palette
// ============================================================

export function buildPalette(branding = {}) {
  const sidebarGradientStart =
    branding.sidebarGradientStart || DEFAULT_COLORS.sidebarGradientStart;

  const sidebarGradientEnd =
    branding.sidebarGradientEnd || DEFAULT_COLORS.sidebarGradientEnd;

  const sidebarGradientDirection =
    branding.sidebarGradientDirection || DEFAULT_COLORS.sidebarGradientDirection;

  const topbarGradientStart =
    branding.topbarGradientStart || DEFAULT_COLORS.topbarGradientStart;

  const topbarGradientEnd =
    branding.topbarGradientEnd || DEFAULT_COLORS.topbarGradientEnd;

  const topbarGradientDirection =
    branding.topbarGradientDirection || DEFAULT_COLORS.topbarGradientDirection;

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
      sidebar: branding.sidebarColor || DEFAULT_COLORS.sidebar,
      topbar: branding.topbarColor || DEFAULT_COLORS.topbar,
      accent: branding.accentColor || DEFAULT_COLORS.accent,
      loginCard: branding.loginCardColor || DEFAULT_COLORS.loginCard,

      useSidebarGradient: Boolean(branding.useSidebarGradient),
      sidebarGradientStart,
      sidebarGradientEnd,
      sidebarGradientDirection,
      sidebarGradient: buildGradient(
        sidebarGradientDirection,
        sidebarGradientStart,
        sidebarGradientEnd
      ),

      useTopbarGradient: Boolean(branding.useTopbarGradient),
      topbarGradientStart,
      topbarGradientEnd,
      topbarGradientDirection,
      topbarGradient: buildGradient(
        topbarGradientDirection,
        topbarGradientStart,
        topbarGradientEnd
      ),
    },
  };
}