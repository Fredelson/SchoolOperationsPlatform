// ============================================
// ARAB UNITY SCHOOL
// User Import Controller
// CSV + Excel Import + Template Downloads
//
// Password = EmployeeId
// MustChangePassword = 1
// Department by name, not ID
// ============================================

const fs = require("fs");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const { hashPassword } = require("../../shared/security/password");
const { poolPromise, sql } = require("../../config/db");

// ============================================
// Allowed roles
// Must match database role values exactly
// ============================================

const allowedRoles = [
  "Teacher",
  "TeachingAssistant",
  "HOD",
  "HOS",
  "Secretary",
  "PrintingAdmin",
  "Admin",
  "SuperAdmin",
];

// ============================================
// Shared Import Function
// Used by both CSV and Excel import
// ============================================
const processUserImport = async (users, filePath = null) => {
  const pool = await poolPromise;

  let inserted = 0;
  let skipped = 0;
  const errors = [];

  for (const row of users) {
    try {
      const fullName = row.FullName?.toString().trim();
      const employeeId = row.EmployeeId?.toString().trim();
      const schoolEmail = row.SchoolEmail?.toString().trim();
      const role = row.Role?.toString().trim();
      const departmentName = row.Department?.toString().trim();
      const subject = row.Subject?.toString().trim() || null;

      // ============================================
      // Validate Required Fields
      // ============================================
      if (!fullName || !employeeId || !schoolEmail || !role) {
        skipped++;
        errors.push({
          employeeId: employeeId || "N/A",
          reason: "Missing FullName, EmployeeId, SchoolEmail, or Role.",
        });
        continue;
      }

      // ============================================
      // Validate Role
      // ============================================
      if (!allowedRoles.includes(role)) {
        skipped++;
        errors.push({
          employeeId,
          reason: `Invalid role: ${role}`,
        });
        continue;
      }

      // ============================================
      // Convert Department Name to DepartmentId
      // Department is optional for Admin / SuperAdmin / PrintingAdmin
      // ============================================
      let departmentId = null;

      if (departmentName) {
        const departmentResult = await pool
          .request()
          .input("DepartmentName", sql.VarChar, departmentName)
          .query(`
            SELECT DepartmentId
            FROM Departments
            WHERE DepartmentName = @DepartmentName
              AND IsActive = 1
          `);

        if (departmentResult.recordset.length === 0) {
          skipped++;
          errors.push({
            employeeId,
            reason: `Department not found: ${departmentName}`,
          });
          continue;
        }

        departmentId = departmentResult.recordset[0].DepartmentId;
      }

      // ============================================
      // Check Duplicate EmployeeId or SchoolEmail
      // ============================================
      const existing = await pool
        .request()
        .input("EmployeeId", sql.VarChar, employeeId)
        .input("SchoolEmail", sql.VarChar, schoolEmail)
        .query(`
          SELECT UserId
          FROM Users
          WHERE EmployeeId = @EmployeeId
             OR SchoolEmail = @SchoolEmail
        `);

      if (existing.recordset.length > 0) {
        skipped++;
        errors.push({
          employeeId,
          reason: "Duplicate EmployeeId or SchoolEmail.",
        });
        continue;
      }

      // ============================================
      // Auto Password = EmployeeId
      // User must change password after first login
      // ============================================
      const passwordHash = await hashPassword(employeeId);

      // ============================================
      // Insert User
      // ============================================
      await pool
        .request()
        .input("EmployeeId", sql.VarChar, employeeId)
        .input("FullName", sql.VarChar, fullName)
        .input("SchoolEmail", sql.VarChar, schoolEmail)
        .input("DepartmentId", sql.Int, departmentId)
        .input("Subject", sql.VarChar, subject)
        .input("Role", sql.VarChar, role)
        .input("PasswordHash", sql.VarChar, passwordHash)
        .query(`
          INSERT INTO Users (
            EmployeeId,
            FullName,
            SchoolEmail,
            DepartmentId,
            Subject,
            Role,
            PasswordHash,
            MustChangePassword,
            IsActive,
            CreatedAt
          )
          VALUES (
            @EmployeeId,
            @FullName,
            @SchoolEmail,
            @DepartmentId,
            @Subject,
            @Role,
            @PasswordHash,
            1,
            1,
            GETDATE()
          )
        `);

      inserted++;
    } catch (rowError) {
      skipped++;
      errors.push({
        employeeId: row.EmployeeId || "N/A",
        reason: rowError.message,
      });
    }
  }

  // ============================================
  // Delete Temporary Uploaded File
  // ============================================
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return {
    totalRows: users.length,
    inserted,
    skipped,
    errors,
  };
};

// ============================================
// CSV Import
// POST /api/admin/users/import-csv
// ============================================
exports.importUsersFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required." });
    }

    const users = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        users.push(row);
      })
      .on("end", async () => {
        try {
          const result = await processUserImport(users, req.file.path);

          return sendSuccess(
              res,
              "CSV import completed.",
              result
          );
        } catch (error) {
          console.error("CSV Processing Error:", error);

          if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }

          return sendError(
            res,
            "Failed to process CSV users.",
            500,
            {
              error: error.message,
            }
          );
        }
      });
  } catch (error) {
    console.error("CSV Import Error:", error);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: "Failed to import CSV users.",
      error: error.message,
    });
  }
};

// ============================================
// Excel Import
// POST /api/admin/users/import-excel
//
// Excel Columns:
// FullName, EmployeeId, SchoolEmail, Role, Department, Subject
// ============================================
exports.importUsersFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required." });
    }

    const workbook = xlsx.readFile(req.file.path);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const users = xlsx.utils.sheet_to_json(worksheet, {
      defval: "",
    });

    const result = await processUserImport(users, req.file.path);

    return res.json({
      message: "Excel import completed.",
      ...result,
    });
  } catch (error) {
    console.error("Excel Import Error:", error);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: "Failed to import Excel users.",
      error: error.message,
    });
  }
};

// ============================================
// Download CSV User Import Template
// GET /api/admin/users/download-csv-template
//
// CSV Columns:
// FullName, EmployeeId, SchoolEmail, Role, Department, Subject
// ============================================
exports.downloadUserImportCSVTemplate = async (req, res) => {
  try {
    const csvTemplate = [
      "FullName,EmployeeId,SchoolEmail,Role,Department,Subject",
      "John Smith,T001,john.smith@arabunityschool.ae,Teacher,Primary,",
      "Mary Jane,HOD001,mary.jane@arabunityschool.ae,HOD,Secondary,English",
    ].join("\n");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=UserImportTemplate.csv"
    );

    res.setHeader("Content-Type", "text/csv");

    return res.send(csvTemplate);
  } catch (error) {
    console.error("Download CSV Template Error:", error);

    return res.status(500).json({
      message: "Failed to download CSV template.",
      error: error.message,
    });
  }
};

// ============================================
// Download Excel User Import Template
// GET /api/admin/users/download-excel-template
//
// Template Sheets:
// 1. Users - main import sheet
// 2. Lists - reference values for Role, Department, Subject
// ============================================
exports.downloadUserImportTemplate = async (req, res) => {
  try {
    const pool = await poolPromise;

    // ============================================
    // Get Active Departments from Database
    // ============================================
    const deptResult = await pool.request().query(`
      SELECT DepartmentName
      FROM Departments
      WHERE IsActive = 1
      ORDER BY DepartmentName
    `);

    // ============================================
    // Get Active Subjects from Database
    // ============================================
    const subjectResult = await pool.request().query(`
      SELECT SubjectName
      FROM Subjects
      WHERE IsActive = 1
      ORDER BY SubjectName
    `);

    const departments = deptResult.recordset.map((d) => d.DepartmentName);
    const subjects = subjectResult.recordset.map((s) => s.SubjectName);

    // ============================================
    // Sample Rows for Users Sheet
    // ============================================
    const templateRows = [
      {
        FullName: "John Smith",
        EmployeeId: "T001",
        SchoolEmail: "john.smith@arabunityschool.ae",
        Role: "Teacher",
        Department: "Primary",
        Subject: "",
      },
      {
        FullName: "Mary Jane",
        EmployeeId: "HOD001",
        SchoolEmail: "mary.jane@arabunityschool.ae",
        Role: "HOD",
        Department: "Secondary",
        Subject: "English",
      },
    ];

    const workbook = xlsx.utils.book_new();

    // ============================================
    // Create Users Sheet
    // ============================================
    const usersSheet = xlsx.utils.json_to_sheet(templateRows, {
      header: [
        "FullName",
        "EmployeeId",
        "SchoolEmail",
        "Role",
        "Department",
        "Subject",
      ],
    });

    usersSheet["!cols"] = [
      { wch: 28 },
      { wch: 15 },
      { wch: 35 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
    ];

    xlsx.utils.book_append_sheet(workbook, usersSheet, "Users");

    // ============================================
    // Create Lists Sheet
    // Used as reference values for dropdowns/manual copy
    // ============================================
    const referenceRows = [];
    const maxRows = Math.max(
      allowedRoles.length,
      departments.length,
      subjects.length
    );

    for (let i = 0; i < maxRows; i++) {
      referenceRows.push({
        Roles: allowedRoles[i] || "",
        Departments: departments[i] || "",
        Subjects: subjects[i] || "",
      });
    }

    const listsSheet = xlsx.utils.json_to_sheet(referenceRows, {
      header: ["Roles", "Departments", "Subjects"],
    });

    listsSheet["!cols"] = [
      { wch: 18 },
      { wch: 22 },
      { wch: 22 },
    ];

    xlsx.utils.book_append_sheet(workbook, listsSheet, "Lists");

    // ============================================
    // Hide Lists Sheet
    // Note: xlsx creates reference sheet, but true dropdown
    // validation may require a more advanced Excel library later.
    // ============================================
    workbook.Workbook = {
      Sheets: [
        { name: "Users" },
        { name: "Lists", Hidden: 1 },
      ],
    };

    // ============================================
    // Send Excel File to Browser
    // ============================================
    const fileBuffer = xlsx.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=UserImportTemplate.xlsx"
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(fileBuffer);
  } catch (error) {
    console.error("Download Excel Template Error:", error);

    return res.status(500).json({
      message: "Failed to download Excel template.",
      error: error.message,
    });
  }
};
