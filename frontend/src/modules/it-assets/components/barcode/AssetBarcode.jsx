// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Reusable IT Asset Barcode
// ============================================================
//
// Purpose:
// Generates a responsive Code 128 barcode from an IT asset tag.
//
// Notes:
// - Barcode is generated dynamically in the frontend.
// - No barcode image or barcode value is stored in SQL Server.
// - AssetTag remains the source of truth.
// - Designed to scale inside responsive asset-label grids.
// ============================================================

import { Box, Typography, useTheme } from "@mui/material";
import Barcode from "react-barcode";

/**
 * Reusable IT Asset barcode component.
 *
 * @param {string} value
 * Value encoded in the barcode, normally AssetTag.
 *
 * @param {number} width
 * Width of each barcode bar used by react-barcode.
 *
 * @param {number} height
 * Base barcode height before responsive CSS scaling.
 *
 * @param {boolean} displayValue
 * Whether the encoded text appears below the barcode.
 *
 * @param {number} fontSize
 * Font size used when displayValue is enabled.
 *
 * @param {number} margin
 * Internal barcode margin.
 *
 * @param {object} sx
 * Optional MUI styling overrides.
 */
function AssetBarcode({
  value,
  width = 1,
  height = 50,
  displayValue = false,
  fontSize = 10,
  margin = 0,
  lineColor,
  background,
  sx = {},
}) {
  const theme = useTheme();
  const normalizedValue = String(value ?? "").trim();

  if (!normalizedValue) {
    return (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        Barcode unavailable
      </Typography>
    );
  }

  return (
    <Box
      role="img"
      aria-label={`Barcode for asset ${normalizedValue}`}
      title={normalizedValue}
      sx={{
        width: "100%",
        height: "100%",

        minWidth: 0,
        minHeight: 0,

        overflow: "hidden",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        lineHeight: 0,

        "& > div": {
          width: "100%",
          height: "100%",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          overflow: "hidden",
        },

        "& svg": {
          width: "100% !important",
          height: "100% !important",

          maxWidth: "100%",
          maxHeight: "100%",

          display: "block",
        },

        ...sx,
      }}
    >
      <Barcode
        value={normalizedValue}
        format="CODE128"
        width={width}
        height={height}
        displayValue={displayValue}
        fontSize={fontSize}
        margin={margin}
        background={background || theme.palette.common.white}
        lineColor={lineColor || theme.palette.common.black}
        renderer="svg"
      />
    </Box>
  );
}

export default AssetBarcode;
