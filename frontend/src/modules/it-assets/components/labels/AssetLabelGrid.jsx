// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// A4 Asset Label Grid
// ============================================================
//
// Purpose:
// - Arrange IT asset labels on exact A4 pages.
// - Support multiple A4 pages.
// - Support four layouts:
//   - 3 × 7 = 21 labels
//   - 3 × 8 = 24 labels
//   - 4 × 7 = 28 labels
//   - 4 × 8 = 32 labels
//
// A4 dimensions:
// - Width: 210 mm
// - Height: 297 mm
//
// Page margin:
// - 5 mm on all sides
//
// Important:
// - The label design remains identical for every layout.
// - Only the A4 grid cell dimensions change.
// ============================================================

import { Box } from "@mui/material";

import AssetLabel from "./AssetLabel";

// ============================================================
// Constants
// ============================================================

export const ASSET_LABEL_LAYOUTS = {
  "3x7": {
    key: "3x7",
    label: "3 × 7",
    columns: 3,
    rows: 7,
    capacity: 21,
  },

  "3x8": {
    key: "3x8",
    label: "3 × 8",
    columns: 3,
    rows: 8,
    capacity: 24,
  },

  "4x7": {
    key: "4x7",
    label: "4 × 7",
    columns: 4,
    rows: 7,
    capacity: 28,
  },

  "4x8": {
    key: "4x8",
    label: "4 × 8",
    columns: 4,
    rows: 8,
    capacity: 32,
  },
};

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 5;
const GRID_GAP_MM = 1;

// ============================================================
// Helpers
// ============================================================

const splitIntoPages = (assets, capacity) => {
  const pages = [];

  for (
    let index = 0;
    index < assets.length;
    index += capacity
  ) {
    pages.push(
      assets.slice(index, index + capacity)
    );
  }

  return pages;
};

const getAssetKey = (
  asset,
  pageIndex,
  itemIndex
) => {
  return (
    asset?.AssetId ??
    asset?.assetId ??
    asset?.AssetTag ??
    asset?.assetTag ??
    `${pageIndex}-${itemIndex}`
  );
};

// ============================================================
// Component
// ============================================================

export default function AssetLabelGrid({
  assets = [],
  layoutKey = "4x7",
  showQrCode = true,
  showBarcode = true,
  showLogo = true,
  showBorder = true,
}) {
  const layout =
    ASSET_LABEL_LAYOUTS[layoutKey] ||
    ASSET_LABEL_LAYOUTS["4x7"];

  const normalizedAssets = Array.isArray(assets)
    ? assets
    : [];

  const pages = splitIntoPages(
    normalizedAssets,
    layout.capacity
  );

  if (!pages.length) {
    return null;
  }

  /*
   * Exact grid-cell dimensions are calculated from:
   *
   * usable width:
   * 210 - (5 × 2)
   *
   * usable height:
   * 297 - (5 × 2)
   *
   * Grid gaps are also deducted.
   */

  const usableWidth =
    A4_WIDTH_MM - PAGE_MARGIN_MM * 2;

  const usableHeight =
    A4_HEIGHT_MM - PAGE_MARGIN_MM * 2;

  const totalHorizontalGap =
    GRID_GAP_MM * (layout.columns - 1);

  const totalVerticalGap =
    GRID_GAP_MM * (layout.rows - 1);

  const cellWidth =
    (usableWidth - totalHorizontalGap) /
    layout.columns;

  const cellHeight =
    (usableHeight - totalVerticalGap) /
    layout.rows;

  return (
    <Box
      className="asset-label-pages"
      sx={{
        width: `${A4_WIDTH_MM}mm`,

        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        gap: 3,

        "@media print": {
          gap: 0,
        },
      }}
    >
      {pages.map((pageAssets, pageIndex) => (
        <Box
          key={`asset-label-page-${pageIndex}`}
          className="asset-label-a4-sheet"
          data-layout={layout.key}
          data-page-number={pageIndex + 1}
          sx={{
            width: `${A4_WIDTH_MM}mm`,
            height: `${A4_HEIGHT_MM}mm`,

            minWidth: `${A4_WIDTH_MM}mm`,
            minHeight: `${A4_HEIGHT_MM}mm`,

            boxSizing: "border-box",

            p: `${PAGE_MARGIN_MM}mm`,

            display: "grid",

            gridTemplateColumns: `repeat(${layout.columns}, ${cellWidth}mm)`,
            gridTemplateRows: `repeat(${layout.rows}, ${cellHeight}mm)`,

            gap: `${GRID_GAP_MM}mm`,

            alignContent: "start",
            justifyContent: "start",

            overflow: "hidden",

            bgcolor: "#ffffff",

            boxShadow:
              "0 8px 28px rgba(15, 23, 42, 0.16)",

            "@media print": {
              boxShadow: "none",

              breakAfter:
                pageIndex <
                pages.length - 1
                  ? "page"
                  : "auto",

              pageBreakAfter:
                pageIndex <
                pages.length - 1
                  ? "always"
                  : "auto",
            },
          }}
        >
          {pageAssets.map(
            (asset, itemIndex) => (
              <AssetLabel
                key={getAssetKey(
                  asset,
                  pageIndex,
                  itemIndex
                )}
                asset={asset}
                showQrCode={showQrCode}
                showBarcode={showBarcode}
                showLogo={showLogo}
                showBorder={showBorder}
              />
            )
          )}
        </Box>
      ))}
    </Box>
  );
}