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
  SINGLE: "Single-sided",
  DOUBLE: "Double-sided",
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
  return [
    PRINT_SIDES.DOUBLE,
    PRINT_SIDES.DOUBLE_LONG_EDGE,
    PRINT_SIDES.DOUBLE_SHORT_EDGE,
    "Double",
    "Duplex",
  ].includes(printSide);
};

/**
 * Calculates sheets needed for one copy.
 */
const calculateSheetsPerCopy = ({ totalPages, printSide }) => {
  const pages = Number(totalPages || 0);

  if (pages <= 0) {
    return 0;
  }

  if (isDoubleSided(printSide)) {
    return Math.ceil(pages / 2);
  }

  return pages;
};

/**
 * Calculates total sheets for all copies.
 */
const calculateTotalSheets = ({ totalPages, copies, printSide }) => {
  const safeCopies = Number(copies || 0);
  const sheetsPerCopy = calculateSheetsPerCopy({
    totalPages,
    printSide,
  });

  return sheetsPerCopy * safeCopies;
};

/**
 * Builds a full print calculation summary.
 */
const buildPrintCalculationSummary = ({
  totalPages,
  copies,
  printSide,
  paperSize,
  printType,
}) => {
  const sheetsPerCopy = calculateSheetsPerCopy({
    totalPages,
    printSide,
  });

  const totalSheets = calculateTotalSheets({
    totalPages,
    copies,
    printSide,
  });

  return {
    totalPages: Number(totalPages || 0),
    copies: Number(copies || 0),
    printSide: printSide || PRINT_SIDES.SINGLE,
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
  calculateSheetsPerCopy,
  calculateTotalSheets,
  buildPrintCalculationSummary,
};