// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Reusable IT Asset Label
// ============================================================
//
// Purpose:
// Renders one responsive IT asset label using nested CSS Grid.
//
// Structure:
// 1. Header
//    - School logo
//    - School name
//    - IT Asset heading
//
// 2. Main content
//    - Asset tag label
//    - Asset tag value
//    - Barcode
//    - QR code
//
// 3. Footer
//    - Property ownership statement
//
// Important:
// - The component does not use fixed label dimensions.
// - It automatically responds to its A4 grid cell.
// - Barcode and QR values are generated dynamically.
// - No barcode or QR data is stored in SQL Server.
// ============================================================

import { Box, Typography, useTheme } from "@mui/material";

import useBranding from "../../../system/hooks/useBranding";
import buildFileUrl from "../../../../platform/utils/buildFileUrl";

import AssetBarcode from "../barcode/AssetBarcode";
import AssetQrCode from "./AssetQrCode";

// ============================================================
// Helpers
// ============================================================

const getAssetValue = (asset, keys, fallback = "") => {
  for (const key of keys) {
    const value = asset?.[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return fallback;
};

// ============================================================
// Component
// ============================================================

export default function AssetLabel({
  asset,
  showQrCode = true,
  showBarcode = true,
  showLogo = true,
  showBorder = true,
  sx = {},
}) {
  const theme = useTheme();
  const { branding } = useBranding();

  const school = branding?.school || {};
  const brand = branding?.branding || {};

  const assetId = getAssetValue(asset, [
    "AssetId",
    "assetId",
    "Id",
    "id",
  ]);

  const assetTag = String(
    getAssetValue(
      asset,
      [
        "AssetTag",
        "assetTag",
        "AssetCode",
        "assetCode",
      ],
      "NO ASSET TAG"
    )
  ).toUpperCase();

  const schoolName = String(
    school.schoolName ||
      school.SchoolName ||
      "Arab Unity School"
  ).toUpperCase();

  const schoolCode =
    school.schoolCode ||
    school.SchoolCode ||
    "AUS";

  const logoUrl = buildFileUrl(
    brand.logoPath ||
      brand.smallLogoPath ||
      brand.darkLogoPath ||
      ""
  );

  const navy =
    theme.palette.platform?.sidebarBackground ||
    theme.palette.platform?.sidebar ||
    theme.palette.primary.dark ||
    "#061b52";

  const gold =
    theme.palette.warning?.main ||
    "#d6a928";

  return (
    <Box
      className="asset-tag-label"
      sx={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,

        boxSizing: "border-box",
        overflow: "hidden",

        containerType: "inline-size",

        display: "grid",
        gridTemplateRows:
          "minmax(0, 28%) minmax(0, 58%) minmax(0, 14%)",

        bgcolor: "#ffffff",
        color: "#07152f",

        border: showBorder
          ? "0.25mm solid #24324a"
          : "none",

        borderRadius: "1.8mm",

        breakInside: "avoid",
        pageBreakInside: "avoid",

        fontFamily:
          "Arial, Helvetica, sans-serif",

        ...sx,
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Box
        className="asset-label-header"
        sx={{
          minWidth: 0,
          minHeight: 0,

          display: "grid",
          gridTemplateColumns:
            "minmax(0, 22%) minmax(0, 78%)",

          alignItems: "center",

          px: "3.5cqw",
          py: "1.5cqw",

          bgcolor: "#ffffff",
        }}
      >
        {/* Logo */}

        <Box
          sx={{
            minWidth: 0,
            minHeight: 0,

            display: "grid",
            placeItems: "center",

            height: "100%",
          }}
        >
          <Box
            sx={{
              width: "min(78%, 12cqw)",
              aspectRatio: "1",

              borderRadius: "50%",

              display: "grid",
              placeItems: "center",

              overflow: "hidden",
              bgcolor: "#ffffff",
            }}
          >
            {showLogo && logoUrl ? (
              <Box
                component="img"
                src={logoUrl}
                alt={`${schoolName} logo`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            ) : (
              <Typography
                sx={{
                  color: navy,
                  fontSize:
                    "clamp(5px, 4cqw, 12px)",
                  lineHeight: 1,
                  fontWeight: 900,
                }}
              >
                {schoolCode}
              </Typography>
            )}
          </Box>
        </Box>

        {/* School name and IT Asset */}

        <Box
          sx={{
            minWidth: 0,
            minHeight: 0,

            height: "100%",

            display: "grid",
            gridTemplateRows:
              "minmax(0, 56%) minmax(0, 44%)",

            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              minWidth: 0,

              color: navy,

              fontSize:
                "clamp(6px, 5.2cqw, 23px)",

              lineHeight: 1,
              fontWeight: 900,

              letterSpacing: "0.08em",

              textAlign: "center",

              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {schoolName}
          </Typography>

          <Box
            sx={{
              minWidth: 0,

              display: "grid",
              gridTemplateColumns:
                "minmax(5px, 1fr) auto minmax(5px, 1fr)",

              alignItems: "center",
              gap: "2cqw",
            }}
          >
            <Box
              sx={{
                height: "0.35mm",
                bgcolor: gold,
              }}
            />

            <Typography
              sx={{
                color: navy,

                fontSize:
                  "clamp(5px, 3.2cqw, 15px)",

                lineHeight: 1,
                fontWeight: 900,

                letterSpacing: "0.12em",

                whiteSpace: "nowrap",
              }}
            >
              IT ASSET
            </Typography>

            <Box
              sx={{
                height: "0.35mm",
                bgcolor: gold,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <Box
        className="asset-label-content"
        sx={{
          minWidth: 0,
          minHeight: 0,

          display: "grid",

          gridTemplateColumns: showQrCode
            ? "minmax(0, 74%) minmax(0, 26%)"
            : "minmax(0, 100%)",

          alignItems: "stretch",

          px: "4cqw",
          py: "2.3cqw",

          borderTop: `0.35mm solid ${navy}`,
          borderBottom: `0.35mm solid ${navy}`,

          bgcolor: "#ffffff",
        }}
      >
        {/* Asset identity and barcode */}

        <Box
          sx={{
            minWidth: 0,
            minHeight: 0,

            display: "grid",

            gridTemplateRows: showBarcode
              ? "minmax(0, 16%) minmax(0, 34%) minmax(0, 50%)"
              : "minmax(0, 25%) minmax(0, 75%)",

            pr: showQrCode ? "2.5cqw" : 0,
          }}
        >
          <Typography
            sx={{
              minWidth: 0,

              alignSelf: "end",

              color: "#34435d",

              fontSize:
                "clamp(4px, 2.6cqw, 12px)",

              lineHeight: 1,
              fontWeight: 900,

              letterSpacing: "0.08em",

              whiteSpace: "nowrap",
            }}
          >
            ASSET TAG
          </Typography>

          <Typography
            sx={{
              minWidth: 0,
              minHeight: 0,

              alignSelf: "center",

              color: navy,

              fontSize:
                "clamp(7px, 5.7cqw, 28px)",

              lineHeight: 0.95,
              fontWeight: 900,

              letterSpacing: "0.015em",

              overflowWrap: "anywhere",
              wordBreak: "break-word",

              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {assetTag}
          </Typography>

          {showBarcode && (
            <Box
              sx={{
                minWidth: 0,
                minHeight: 0,

                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",

                overflow: "hidden",

                px: "1cqw",

                "& svg": {
                  width: "100% !important",
                  height: "100% !important",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  display: "block",
                },
              }}
            >
              <AssetBarcode
                value={assetTag}
                width={1}
                height={50}
                displayValue={false}
                margin={0}
                sx={{
                  width: "100%",
                  height: "100%",
                  justifyContent: "flex-start",
                }}
              />
            </Box>
          )}
        </Box>

        {/* QR code */}

        {showQrCode && (
          <Box
            sx={{
              minWidth: 0,
              minHeight: 0,

              display: "grid",
              placeItems: "center",

              p: "1.5cqw",
            }}
          >
            <Box
              sx={{
                width: "min(100%, 22cqw)",
                maxWidth: "100%",
                aspectRatio: "1",

                display: "grid",
                placeItems: "center",

                bgcolor: "#ffffff",

                "& svg": {
                  width: "100% !important",
                  height: "100% !important",
                  display: "block",
                },
              }}
            >
              <AssetQrCode
                assetId={assetId}
                size={120}
                level="M"
                includeMargin={false}
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <Box
        className="asset-label-footer"
        sx={{
          minWidth: 0,
          minHeight: 0,

          display: "grid",

          gridTemplateColumns:
            "minmax(5px, 1fr) auto minmax(0, max-content) auto minmax(5px, 1fr)",

          alignItems: "center",

          gap: "1.5cqw",

          px: "4cqw",

          bgcolor: navy,
          color: "#ffffff",
        }}
      >
        <Box
          sx={{
            height: "0.3mm",
            bgcolor: gold,
          }}
        />

        <Typography
          component="span"
          sx={{
            color: gold,

            fontSize:
              "clamp(4px, 2.8cqw, 13px)",

            lineHeight: 1,
            fontWeight: 900,
          }}
        >
          ★
        </Typography>

        <Typography
          sx={{
            minWidth: 0,

            color: "#ffffff",

            fontSize:
              "clamp(4px, 2.6cqw, 13px)",

            lineHeight: 1,
            fontWeight: 900,

            letterSpacing: "0.05em",

            textAlign: "center",

            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          PROPERTY OF {schoolName}
        </Typography>

        <Typography
          component="span"
          sx={{
            color: gold,

            fontSize:
              "clamp(4px, 2.8cqw, 13px)",

            lineHeight: 1,
            fontWeight: 900,
          }}
        >
          ★
        </Typography>

        <Box
          sx={{
            height: "0.3mm",
            bgcolor: gold,
          }}
        />
      </Box>
    </Box>
  );
}