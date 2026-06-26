// ============================================
// ARAB UNITY SCHOOL
// User Import Routes
// CSV + Excel Import + Template Downloads
// ============================================

const express = require("express");
const multer = require("multer");

const {
  importUsersFromCSV,
  importUsersFromExcel,
  downloadUserImportTemplate,
  downloadUserImportCSVTemplate,
} = require("../../controllers/users/userImportController");

const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

// ============================================
// Temporary Upload Folder
// Files are stored temporarily and deleted
// after processing
// ============================================

const upload = multer({
  dest: "uploads/imports/",
});

// ============================================
// POST /api/admin/users/import-csv
// Import users from CSV file
//
// CSV Columns:
// FullName
// EmployeeId
// SchoolEmail
// Role
// Department
// Subject
// ============================================

router.post(
  "/users/import-csv",
  protect,
  upload.single("file"),
  importUsersFromCSV
);

// ============================================
// POST /api/admin/users/import-excel
// Import users from Excel file
//
// Excel Columns:
// FullName
// EmployeeId
// SchoolEmail
// Role
// Department
// Subject
// ============================================

router.post(
  "/users/import-excel",
  protect,
  upload.single("file"),
  importUsersFromExcel
);

// ============================================
// GET /api/admin/users/download-csv-template
// Download CSV template
// ============================================

router.get(
  "/users/download-csv-template",
  protect,
  downloadUserImportCSVTemplate
);

// ============================================
// GET /api/admin/users/download-excel-template
// Download Excel template
// ============================================

router.get(
  "/users/download-excel-template",
  protect,
  downloadUserImportTemplate
);

module.exports = router;