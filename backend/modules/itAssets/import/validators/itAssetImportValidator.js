/**
 * ============================================================
 * IT Asset Import Validator
 * ============================================================
 * Purpose:
 * - Validate uploaded file type.
 * - Validate required Excel/CSV headers.
 * - Normalize raw import rows before staging.
 *
 * Final approved template:
 * AssetCode
 * Category
 * Brand
 * Model
 * Department
 * Location
 * Room
 * Status
 * Condition
 * PurchaseDate
 * EmployeeCode
 * Remarks
 * ============================================================
 */

const path = require("path");

/**
 * Required headers based on database requirements.
 * ITAssets requires:
 * - AssetTag
 * - ITAssetCategoryId
 * - ITAssetStatusId
 */
const REQUIRED_HEADERS = ["AssetCode", "Category", "Status"];

/**
 * Approved template headers.
 */
const APPROVED_HEADERS = [
  "AssetCode",
  "Category",
  "Brand",
  "Model",
  "Department",
  "Location",
  "Room",
  "Status",
  "Condition",
  "PurchaseDate",
  "EmployeeCode",
  "Remarks",
];

/**
 * Allowed upload extensions.
 */
const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

/**
 * Normalize a value for safe comparison/import.
 */
function normalizeValue(value) {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();

  return text.length === 0 ? null : text;
}

/**
 * Validate uploaded file.
 */
function validateUploadedFile(file) {
  const errors = [];

  if (!file) {
    errors.push("No file was uploaded.");
    return errors;
  }

  const extension = path.extname(file.originalname || "").toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    errors.push("Invalid file type. Only Excel and CSV files are allowed.");
  }

  return errors;
}

/**
 * Validate headers from parsed file.
 */
function validateHeaders(headers = []) {
  const normalizedHeaders = headers.map((h) => String(h || "").trim());
  const errors = [];

  REQUIRED_HEADERS.forEach((header) => {
    if (!normalizedHeaders.includes(header)) {
      errors.push(`Missing required column: ${header}`);
    }
  });

  return errors;
}

/**
 * Convert raw parser row into final staging format.
 */
function normalizeImportRow(row, sourceSheet, sourceRow) {
  return {
    assetTag: normalizeValue(row.AssetCode),
    categoryName: normalizeValue(row.Category),
    brandName: normalizeValue(row.Brand),
    modelName: normalizeValue(row.Model),
    departmentName: normalizeValue(row.Department),
    locationName: normalizeValue(row.Location),
    roomName: normalizeValue(row.Room),
    statusName: normalizeValue(row.Status),
    conditionName: normalizeValue(row.Condition),
    purchaseDate: normalizeValue(row.PurchaseDate),
    employeeCode: normalizeValue(row.EmployeeCode),
    remarks: normalizeValue(row.Remarks),
    sourceSheet: normalizeValue(sourceSheet),
    sourceRow,
  };
}

module.exports = {
  REQUIRED_HEADERS,
  APPROVED_HEADERS,
  validateUploadedFile,
  validateHeaders,
  normalizeImportRow,
  normalizeValue,
};