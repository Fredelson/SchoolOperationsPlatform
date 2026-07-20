// backend/modules/users/validators/userImportValidator.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * User Import Validator
 * ============================================================
 *
 * Purpose:
 * Validates uploaded staff/user import files and CSV/Excel row structure.
 *
 * Rules:
 * - No database logic here.
 * - No HTTP response logic here.
 * - No import insert logic here.
 * ============================================================
 */

const path = require("path");
const { MAIN_ROLE_KEYS, isMainRole, SPECIALIZED_ROLE_MESSAGE } = require("../../../shared/constants/mainRoles");

/**
 * Required import columns.
 */
const REQUIRED_COLUMNS = [
  "EmployeeId",
  "FullName",
  "SchoolEmail",
  "Role",
];

const OPTIONAL_COLUMNS = [
  "AssignmentKey",
  "ScopeType",
  "ScopeName",
  "Department",
  "Subject",
];

/**
 * Allowed import file extensions.
 */
const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

/**
 * Maximum rows allowed per import.
 */
const MAX_IMPORT_ROWS = 1000;

/**
 * Validate uploaded file.
 */
function validateImportFile(file) {
  if (!file) {
    return "Import file is required.";
  }

  const extension = path.extname(file.originalname || "").toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "Invalid file type. Please upload Excel or CSV file only.";
  }

  return null;
}

/**
 * Validate workbook/CSV columns.
 */
function getRowField(row, fieldName) {
  const target = String(fieldName || "").toLowerCase();
  const keys = Object.keys(row || {});

  for (const key of keys) {
    if (String(key || "").toLowerCase() === target) {
      return row[key];
    }
  }

  return undefined;
}

function validateColumns(row) {
  const missingColumns = [];

  REQUIRED_COLUMNS.forEach((column) => {
    if (!Object.prototype.hasOwnProperty.call(row, column) && getRowField(row, column) === undefined) {
      missingColumns.push(column);
    }
  });

  return missingColumns;
}

function validateOptionalColumns(row) {
  const warnings = [];

  OPTIONAL_COLUMNS.forEach((column) => {
    const value = getRowField(row, column);
    if (value && String(value).trim()) {
    }
  });

  return warnings;
}

/**
 * Validate total rows.
 */
function validateRowCount(rows) {
  if (!rows || rows.length === 0) {
    return "Import file has no data rows.";
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    return `Import file has too many rows. Maximum allowed is ${MAX_IMPORT_ROWS}.`;
  }

  return null;
}

const ASSIGNMENT_KEY_MAP = {
  hod: "HOD",
  hos: "HOS",
  homeroomteacher: "HOMEROOM_TEACHER",
  "yearleader": "YEAR_LEADER",
  "year leader": "YEAR_LEADER",
  deputyhead: "DEPUTY_HEAD",
  "deputy head": "DEPUTY_HEAD",
  headofoperations: "HEAD_OF_OPERATIONS",
  "head of operations": "HEAD_OF_OPERATIONS",
  nurse: "NURSE",
  teachingassistant: "TEACHING_ASSISTANT",
  "teaching assistant": "TEACHING_ASSISTANT",
  itcoordinator: "IT_COORDINATOR",
  "it coordinator": "IT_COORDINATOR",
  printingcoordinator: "PRINTING_COORDINATOR",
  "printing coordinator": "PRINTING_COORDINATOR",
};

function normalizeAssignmentKey(key) {
  const compact = String(key || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  return ASSIGNMENT_KEY_MAP[compact] || String(key || "").trim();
}

/**
 * Normalize role values from import file to platform RoleKey values.
 */
function normalizeRoleKey(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("-", "")
    .replaceAll("_", "");

  if (value === "admin") return "Admin";
  if (value === "teacher") return "Teacher";
  if (value === "printingadmin") return "PrintingAdmin";
  if (value === "platformadmin") return "PlatformAdmin";
  if (value === "superadmin") return "SuperAdmin";
  return String(role || "").trim();
}

function validateMainRole(role) {
  const specialized = new Set(["hod", "hos", "secretary", "librarian", "libraryadmin", "itadmin", "yearleader", "homeroomteacher", "deputyhead", "headofoperations", "nurse", "teachingassistant"]);
  const compact = String(role || "").toLowerCase().replace(/[\s_-]/g, "");
  if (specialized.has(compact)) return SPECIALIZED_ROLE_MESSAGE;
  if (!isMainRole(role)) return `Role not found: ${role}`;
  return null;
}

/**
 * Normalize one import row.
 */
function normalizeRow(row) {
  return {
    employeeId: String(getRowField(row, "EmployeeId") || "").trim(),
    fullName: String(getRowField(row, "FullName") || "").trim(),
    schoolEmail: String(getRowField(row, "SchoolEmail") || "").trim().toLowerCase(),
    role: normalizeRoleKey(getRowField(row, "Role")),
    assignmentKey: normalizeAssignmentKey(getRowField(row, "AssignmentKey")),
    scopeType: String(getRowField(row, "ScopeType") || "").trim(),
    scopeName: String(getRowField(row, "ScopeName") || "").trim(),
    department: String(getRowField(row, "Department") || "").trim(),
    subject: String(getRowField(row, "Subject") || "").trim(),
  };
}

/**
 * Validate required row values.
 */
function validateRequiredFields(row) {
  const errors = [];

  if (!row.employeeId) {
    errors.push("EmployeeId is required.");
  }

  if (!row.fullName) {
    errors.push("FullName is required.");
  }

  if (!row.schoolEmail) {
    errors.push("SchoolEmail is required.");
  }

  if (!row.role) {
    errors.push("Role is required.");
  }

  return errors;
}

/**
 * Basic school email validation.
 */
function validateEmail(email) {
  if (!email) {
    return "SchoolEmail is required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "SchoolEmail format is invalid.";
  }

  return null;
}

module.exports = {
  REQUIRED_COLUMNS,
  OPTIONAL_COLUMNS,
  MAX_IMPORT_ROWS,
  validateImportFile,
  validateColumns,
  validateOptionalColumns,
  validateRowCount,
  normalizeRoleKey,
  normalizeAssignmentKey,
  normalizeRow,
  validateMainRole,
  validateRequiredFields,
  validateEmail,
};
