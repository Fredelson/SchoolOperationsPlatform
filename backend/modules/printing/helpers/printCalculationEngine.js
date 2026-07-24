// ============================================================
// Arab Unity School Operations Platform
// Print Calculation Engine
// ============================================================
//
// Purpose:
// Provides one reusable source of truth for print calculations:
// - Total pages
// - Sheets per copy
// - Total sheets
// - Single-sided / double-sided logic
// - Copies calculation
//
// Notes:
// Actual file page extraction will later call this engine after
// uploads analyze PDF, DOCX, PPTX, or other supported files.
//
// ============================================================

const PRINT_SIDES = Object.freeze({
  SINGLE: "Single-Sided",
  DOUBLE: "Double-Sided",
  DOUBLE_LONG_EDGE: "Double-sided Long Edge",
  DOUBLE_SHORT_EDGE: "Double-sided Short Edge",
});

const PAPER_SIZES = Object.freeze({
  A4: "A4",
  A3: "A3",
});

const PRINT_TYPES = Object.freeze({
  BLACK_WHITE: "Black & White",
  COLOR: "Color",
});

/**
 * Checks if the selected print side should use duplex calculation.
 */
const isDoubleSided = (printSide) => {
  const value = String(printSide || "").trim().toLowerCase();

  return [
    "double-sided",
    "double-sided long edge",
    "double-sided short edge",
    "back-to-back",
    "double",
    "duplex",
  ].includes(value);
};

/**
 * Calculates sheets needed for one copy.
 */
const calculateSheetsPerCopy = ({
  totalPages,
  printSide,
  pagesPerSheet = 1,
}) => {
  const pages = Number(totalPages || 0);
  const imposedPages = Math.max(1, Number(pagesPerSheet) || 1);

  if (pages <= 0) {
    return 0;
  }

  const printedSides = Math.ceil(pages / imposedPages);

  if (isDoubleSided(printSide)) {
    return Math.ceil(printedSides / 2);
  }

  return printedSides;
};

/**
 * Calculates total sheets for all copies.
 */
const calculateTotalSheets = ({
  totalPages,
  copies,
  printSide,
  pagesPerSheet = 1,
}) => {
  const safeCopies = Number(copies || 0);
  const sheetsPerCopy = calculateSheetsPerCopy({
    totalPages,
    printSide,
    pagesPerSheet,
  });

  return sheetsPerCopy * safeCopies;
};

const countSelectedPages = (pageCount, pageSelection, customPageRange) => {
  const maximum = Math.max(0, Number(pageCount) || 0);

  if (maximum === 0) return 0;
  if (String(pageSelection || "").toLowerCase() !== "custom pages") {
    return maximum;
  }

  const selected = new Set();
  const parts = String(customPageRange || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startValue, endValue] = part.split("-", 2).map(Number);

      if (!Number.isInteger(startValue) || !Number.isInteger(endValue)) {
        continue;
      }

      const start = Math.max(1, Math.min(startValue, endValue));
      const end = Math.min(maximum, Math.max(startValue, endValue));

      for (let page = start; page <= end; page += 1) {
        selected.add(page);
      }
    } else {
      const page = Number(part);

      if (Number.isInteger(page) && page >= 1 && page <= maximum) {
        selected.add(page);
      }
    }
  }

  if (!selected.size) {
    const error = new Error(
      "Custom page range must contain at least one valid page."
    );
    error.statusCode = 400;
    throw error;
  }

  return selected.size;
};

const calculateAttachment = ({
  pageCount,
  copies,
  printType,
  pagesPerSheet,
  pageSelection,
  customPageRange,
  paperSize,
  printColor,
}) => {
  const selectedPages = countSelectedPages(
    pageCount,
    pageSelection,
    customPageRange
  );
  const safeCopies = Math.max(1, Number(copies) || 1);
  const safePagesPerSheet = Number(pagesPerSheet) || 1;
  if (![1, 2, 4].includes(safePagesPerSheet)) {
    const error = new Error("Pages per sheet must be 1, 2, or 4.");
    error.statusCode = 400;
    throw error;
  }
  const sheetsPerSet = calculateSheetsPerCopy({
    totalPages: selectedPages,
    printSide: printType,
    pagesPerSheet: safePagesPerSheet,
  });

  return {
    pageCount: Math.max(1, Number(pageCount) || 1),
    selectedPages,
    copies: safeCopies,
    pagesPerSheet: safePagesPerSheet,
    sheetsPerSet,
    totalSheets: sheetsPerSet * safeCopies,
    paperSize: PAPER_SIZES[paperSize] || paperSize || PAPER_SIZES.A4,
    printType: printType || PRINT_SIDES.SINGLE,
    printColor: printColor || PRINT_TYPES.BLACK_WHITE,
  };
};

/**
 * Builds a full print calculation summary.
 */
const buildPrintCalculationSummary = ({
  totalPages,
  copies,
  printSide,
  pagesPerSheet,
  paperSize,
  printType,
}) => {
  const sheetsPerCopy = calculateSheetsPerCopy({
    totalPages,
    printSide,
    pagesPerSheet,
  });

  const totalSheets = calculateTotalSheets({
    totalPages,
    copies,
    printSide,
    pagesPerSheet,
  });

  return {
    totalPages: Number(totalPages || 0),
    copies: Number(copies || 0),
    printSide: printSide || PRINT_SIDES.SINGLE,
    pagesPerSheet: Math.max(1, Number(pagesPerSheet) || 1),
    paperSize: paperSize || PAPER_SIZES.A4,
    printType: printType || PRINT_TYPES.BLACK_WHITE,
    sheetsPerCopy,
    totalSheets,
  };
};

module.exports = {
  PRINT_SIDES,
  PAPER_SIZES,
  PRINT_TYPES,
  isDoubleSided,
  countSelectedPages,
  calculateAttachment,
  calculateSheetsPerCopy,
  calculateTotalSheets,
  buildPrintCalculationSummary,
};
