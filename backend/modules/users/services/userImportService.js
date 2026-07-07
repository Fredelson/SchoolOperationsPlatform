// backend/modules/users/services/userImportService.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * User Import Service
 * ============================================================
 *
 * Purpose:
 * Handles staff/user import business logic.
 *
 * Workflow:
 * 1. Upload Excel/CSV
 * 2. Validate file
 * 3. Parse rows
 * 4. Validate each row
 * 5. Save preview into StaffImportStaging
 * 6. Commit only valid rows into Users
 *
 * Rules:
 * - No HTTP response logic here.
 * - No raw SQL here.
 * - No route logic here.
 * ============================================================
 */

const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const csv = require("csv-parser");

const userImportRepository = require("../repositories/userImportRepository");
const { hashPassword } = require("../../../shared/security/password");

const {
  validateImportFile,
  validateColumns,
  validateRowCount,
  normalizeRow,
  validateRequiredFields,
  validateEmail,
} = require("../validators/userImportValidator");

/**
 * Safely delete uploaded temp file.
 */
function deleteTempFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Resolve current user id from authenticated request user.
 */
function getCurrentUserId(currentUser) {
  return currentUser?.id || currentUser?.UserId || currentUser?.userId || null;
}

/**
 * Read uploaded Excel file.
 */
function readExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  return xlsx.utils.sheet_to_json(worksheet, {
    defval: "",
  });
}

/**
 * Read uploaded CSV file.
 */
function readCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

/**
 * Read uploaded import file based on extension.
 */
async function readImportFile(file) {
  const extension = path.extname(file.originalname || "").toLowerCase();

  if (extension === ".csv") {
    return readCsvFile(file.path);
  }

  return readExcelFile(file.path);
}

/**
 * Build row preview payload for frontend.
 */
function buildPreviewRow(stagingRow) {
  return {
    stagingId: stagingRow.StaffImportStagingId,
    employeeId: stagingRow.EmployeeId,
    fullName: stagingRow.FullName,
    schoolEmail: stagingRow.SchoolEmail,
    role: stagingRow.DerivedRoleKey,
    validationStatus: stagingRow.ValidationStatus,
    validationMessage: stagingRow.ValidationMessage,
    importStatus: stagingRow.ImportStatus,
    importMessage: stagingRow.ImportMessage,
  };
}

/**
 * Preview user import.
 */
async function previewUserImport(file, currentUser) {
  const fileError = validateImportFile(file);

  if (fileError) {
    const error = new Error(fileError);
    error.statusCode = 400;
    throw error;
  }

  let rawRows = [];

  try {
    rawRows = await readImportFile(file);

    const rowCountError = validateRowCount(rawRows);

    if (rowCountError) {
      const error = new Error(rowCountError);
      error.statusCode = 400;
      throw error;
    }

    const missingColumns = validateColumns(rawRows[0]);

    if (missingColumns.length > 0) {
      const error = new Error(
        `Missing required columns: ${missingColumns.join(", ")}`
      );
      error.statusCode = 400;
      throw error;
    }

    const batchId = await userImportRepository.createBatch({
      batchName: `Staff Import - ${new Date().toISOString()}`,
      originalFileName: file.originalname,
      uploadedBy: getCurrentUserId(currentUser),
      totalRows: rawRows.length,
      status: "Previewed",
      remarks: "Import file uploaded and preview generated.",
    });

    let validRows = 0;
    let invalidRows = 0;
    let duplicateRows = 0;

    for (let index = 0; index < rawRows.length; index++) {
      const sourceRowNumber = index + 2;
      const normalized = normalizeRow(rawRows[index]);

      const validationErrors = [];

      validationErrors.push(...validateRequiredFields(normalized));

      const emailError = validateEmail(normalized.schoolEmail);
      if (emailError) {
        validationErrors.push(emailError);
      }

      let role = null;
      let duplicateUser = null;

      if (normalized.role) {
        role = await userImportRepository.findRoleByKey(normalized.role);

        if (!role) {
          validationErrors.push(`Role not found: ${normalized.role}`);
        }
      }

      if (normalized.employeeId || normalized.schoolEmail) {
        duplicateUser = await userImportRepository.findDuplicateUser(
          normalized.employeeId,
          normalized.schoolEmail
        );

        if (duplicateUser) {
          validationErrors.push(
            `Duplicate user found: ${duplicateUser.EmployeeId || duplicateUser.SchoolEmail}`
          );
          duplicateRows++;
        }
      }

      const validationStatus =
        validationErrors.length === 0 ? "Valid" : "Invalid";

      if (validationStatus === "Valid") {
        validRows++;
      } else {
        invalidRows++;

        await userImportRepository.logImportError({
          batchId,
          sourceSheet: "Users",
          sourceRow: sourceRowNumber,
          rawData: JSON.stringify(rawRows[index]),
          errorType: "Validation",
          errorMessage: validationErrors.join(" | "),
        });
      }

      await userImportRepository.insertStagingRow({
        batchId,
        employeeId: normalized.employeeId,
        fullName: normalized.fullName,
        schoolEmail: normalized.schoolEmail,
        derivedRoleKey: normalized.role,
        matchedUserId: duplicateUser?.UserId || null,
        validationStatus,
        validationMessage:
          validationErrors.length > 0 ? validationErrors.join(" | ") : "Ready to import.",
        importStatus: "Pending",
        importMessage: null,
      });
    }

    await userImportRepository.updateBatchValidationSummary(batchId, {
      validRows,
      invalidRows,
      duplicateRows,
      status: invalidRows > 0 ? "ValidatedWithErrors" : "Validated",
      remarks:
        invalidRows > 0
          ? "Import preview completed with validation errors."
          : "Import preview completed successfully.",
    });

    const stagingRows = await userImportRepository.getStagingRowsByBatch(batchId);

    return {
      batchId,
      summary: {
        totalRows: rawRows.length,
        validRows,
        invalidRows,
        duplicateRows,
      },
      preview: stagingRows.map(buildPreviewRow),
    };
  } finally {
    deleteTempFile(file?.path);
  }
}

/**
 * Commit valid preview rows into dbo.Users.
 */
async function commitUserImport(batchId, currentUser) {
  if (!batchId) {
    const error = new Error("Import batch ID is required.");
    error.statusCode = 400;
    throw error;
  }

  const stagingRows = await userImportRepository.getStagingRowsByBatch(
    Number(batchId)
  );

  if (!stagingRows || stagingRows.length === 0) {
    const error = new Error("No staging rows found for this batch.");
    error.statusCode = 404;
    throw error;
  }

  let importedRows = 0;
  let skippedRows = 0;
  const errors = [];

  for (const row of stagingRows) {
    try {
      if (row.ValidationStatus !== "Valid") {
        skippedRows++;
        await userImportRepository.markStagingFailed(
          row.StaffImportStagingId,
          "Skipped because row is not valid."
        );
        continue;
      }

      if (row.ImportStatus === "Imported") {
        skippedRows++;
        continue;
      }

      const duplicateUser = await userImportRepository.findDuplicateUser(
        row.EmployeeId,
        row.SchoolEmail
      );

      if (duplicateUser) {
        skippedRows++;
        const message = "Skipped because user already exists.";

        await userImportRepository.markStagingFailed(
          row.StaffImportStagingId,
          message
        );

        errors.push({
          employeeId: row.EmployeeId,
          message,
        });

        continue;
      }

      const role = await userImportRepository.findRoleByKey(row.DerivedRoleKey);

      if (!role) {
        skippedRows++;
        const message = `Role not found: ${row.DerivedRoleKey}`;

        await userImportRepository.markStagingFailed(
          row.StaffImportStagingId,
          message
        );

        errors.push({
          employeeId: row.EmployeeId,
          message,
        });

        continue;
      }

      const passwordHash = await hashPassword(row.EmployeeId);

      const userId = await userImportRepository.createUserFromImport({
        employeeId: row.EmployeeId,
        fullName: row.FullName,
        schoolEmail: row.SchoolEmail,
        passwordHash,
        roleId: role.RoleId,
        legacyRole: role.RoleKey,
        schoolId: null,
      });

      await userImportRepository.markStagingImported(
        row.StaffImportStagingId,
        userId
      );

      importedRows++;
    } catch (error) {
      skippedRows++;

      await userImportRepository.markStagingFailed(
        row.StaffImportStagingId,
        error.message
      );

      await userImportRepository.logImportError({
        batchId: Number(batchId),
        sourceSheet: "Users",
        sourceRow: null,
        rawData: JSON.stringify(row),
        errorType: "Commit",
        errorMessage: error.message,
      });

      errors.push({
        employeeId: row.EmployeeId,
        message: error.message,
      });
    }
  }

  await userImportRepository.updateBatchImportSummary(Number(batchId), {
    importedRows,
    status: errors.length > 0 ? "ImportedWithErrors" : "Imported",
    remarks:
      errors.length > 0
        ? "Import completed with some skipped or failed rows."
        : "Import completed successfully.",
  });

  return {
    batchId: Number(batchId),
    importedRows,
    skippedRows,
    errors,
  };
}

/**
 * Get import history.
 */
async function getImportHistory() {
  const history = await userImportRepository.getImportHistory();

  return {
    count: history.length,
    history: history.map((item) => ({
      batchId: item.StaffImportBatchId,
      batchName: item.BatchName,
      originalFileName: item.OriginalFileName,
      uploadedBy: item.UploadedBy,
      totalRows: item.TotalRows,
      validRows: item.ValidRows,
      invalidRows: item.InvalidRows,
      duplicateRows: item.DuplicateRows,
      importedRows: item.ImportedRows,
      status: item.Status,
      remarks: item.Remarks,
      createdAt: item.CreatedAt,
      validatedAt: item.ValidatedAt,
      importedAt: item.ImportedAt,
    })),
  };
}

module.exports = {
  previewUserImport,
  commitUserImport,
  getImportHistory,
};