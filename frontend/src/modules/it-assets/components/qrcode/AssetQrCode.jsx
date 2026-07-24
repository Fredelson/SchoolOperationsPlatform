// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// IT Asset QR Code
// ============================================================
//
// Purpose:
// Generates a reusable QR code that opens the authenticated
// IT Asset Details page.
//
// Security:
// - The QR code contains only the asset details URL.
// - It does not contain employee names, serial numbers,
//   locations, assignments, or other sensitive information.
// - Authentication and authorization are enforced after scan.
// ============================================================

import { Box, Typography } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";

/**
 * Builds the authenticated IT Asset Details URL.
 *
 * The current application origin automatically supports:
 * - Local development
 * - Staging
 * - Production
 */
const buildAssetDetailsUrl = (assetId) => {
  const normalizedAssetId = String(assetId || "").trim();

  if (!normalizedAssetId) {
    return "";
  }

  if (typeof window === "undefined") {
    return `/#/it-assets/${normalizedAssetId}`;
  }

  const baseUrl = import.meta.env.VITE_APP_BASE_URL || "";
  return `${window.location.origin}${baseUrl}/#/it-assets/${encodeURIComponent(normalizedAssetId)}`;
};

/**
 * Reusable IT Asset QR code.
 */
export default function AssetQrCode({
  assetId,
  value,
  size = 82,
  level = "M",
  includeMargin = false,
  fgColor = "#000000",
  bgColor = "#ffffff",
  sx = {},
}) {
  /*
   * A custom value may be supplied for testing.
   * In normal use, assetId generates the details-page URL.
   */
  const qrValue = String(value || buildAssetDetailsUrl(assetId)).trim();

  if (!qrValue) {
    return (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 700 }}
      >
        QR code unavailable
      </Typography>
    );
  }

  return (
    <Box
      aria-label={`QR code for asset ${assetId || ""}`}
      title={qrValue}
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        bgcolor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
        "& svg": {
          display: "block",
          width: "100%",
          height: "100%",
        },
        ...sx,
      }}
    >
      <QRCodeSVG
        value={qrValue}
        size={size}
        level={level}
        includeMargin={includeMargin}
        bgColor={bgColor}
        fgColor={fgColor}
      />
    </Box>
  );
}

export { buildAssetDetailsUrl };
