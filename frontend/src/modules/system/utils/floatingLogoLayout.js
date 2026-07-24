export const FLOATING_LOGO_DEFAULTS = {
  x: 1200,
  y: 96,
  size: 72,
};

export const FLOATING_LOGO_LIMITS = {
  minSize: 40,
  maxSize: 180,
};

const finiteNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const clampFloatingLogoValue = (value, min, max) =>
  Math.min(Math.max(Math.round(value), min), max);

export function normalizeFloatingLogoLayout(
  branding = {},
  viewportWidth = typeof window === "undefined" ? 1440 : window.innerWidth,
  viewportHeight = typeof window === "undefined" ? 900 : window.innerHeight
) {
  const maxSize = Math.max(
    FLOATING_LOGO_LIMITS.minSize,
    Math.min(
      FLOATING_LOGO_LIMITS.maxSize,
      viewportWidth,
      viewportHeight
    )
  );
  const size = clampFloatingLogoValue(
    finiteNumber(branding.floatingLogoSize, FLOATING_LOGO_DEFAULTS.size),
    FLOATING_LOGO_LIMITS.minSize,
    maxSize
  );
  const x = clampFloatingLogoValue(
    finiteNumber(branding.floatingLogoX, FLOATING_LOGO_DEFAULTS.x),
    0,
    Math.max(viewportWidth - size, 0)
  );
  const y = clampFloatingLogoValue(
    finiteNumber(branding.floatingLogoY, FLOATING_LOGO_DEFAULTS.y),
    0,
    Math.max(viewportHeight - size, 0)
  );

  return { x, y, size };
}
