// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// A4 Asset Label Grid
// ============================================================
//
// Purpose:
// - Arrange IT asset labels on exact A4 pages.
// - Support multiple A4 pages.
// - Support ten layouts:
//   - 1 × 1 = 1 label (whole-page)
//   - 1 × 2 = 2 labels
//   - 2 × 2 = 4 labels
//   - 2 × 3 = 6 labels
//   - 3 × 2 = 6 labels
//   - 3 × 3 = 9 labels
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

import { Box, useTheme } from "@mui/material";

import AssetLabel from "./AssetLabel";

// ============================================================
// Constants
// ============================================================

// Shared by the label grid and its existing printer toolbar.
 
export const ASSET_LABEL_LAYOUTS = {
  "1x1": {
    key: "1x1",
    label: "1 × 1",
    columns: 1,
    rows: 1,
    capacity: 1,
  },

  "1x2": {
    key: "1x2",
    label: "1 × 2",
    columns: 1,
    rows: 2,
    capacity: 2,
  },

  "2x2": {
    key: "2x2",
    label: "2 × 2",
    columns: 2,
    rows: 2,
    capacity: 4,
  },

  "2x3": {
    key: "2x3",
    label: "2 × 3",
    columns: 2,
    rows: 3,
    capacity: 6,
  },

  "3x2": {
    key: "3x2",
    label: "3 × 2",
    columns: 3,
    rows: 2,
    capacity: 6,
  },

  "3x3": {
    key: "3x3",
    label: "3 × 3",
    columns: 3,
    rows: 3,
    capacity: 9,
  },

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
  const theme = useTheme();
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

            bgcolor: "common.white",

            boxShadow: theme.shadows[3],

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
