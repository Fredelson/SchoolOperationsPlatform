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
  validateOptionalColumns,
  validateRowCount,
  normalizeRow,
  normalizeAssignmentKey,
  validateRequiredFields,
  validateEmail,
  validateMainRole,
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
function buildPreviewRow(stagingRow, changes = [], assignmentInfo = null) {
  const validationStatus = String(stagingRow.ValidationStatus || "").trim();
  let action = "Insert";

  if (validationStatus === "Update") {
    action = "Update";
  } else if (validationStatus === "Ignored") {
    action = "Ignored";
  }

  return {
    stagingId: stagingRow.StaffImportStagingId,
    employeeId: stagingRow.EmployeeId,
    fullName: stagingRow.FullName,
    schoolEmail: stagingRow.SchoolEmail,
    role: stagingRow.DerivedRoleKey,
    assignmentKey: stagingRow.AssignmentKey,
    scopeType: stagingRow.ScopeType,
    scopeName: stagingRow.ScopeName,
    department: stagingRow.DepartmentName,
    subject: stagingRow.SubjectName,
    validationStatus,
    validationMessage: stagingRow.ValidationMessage,
    importStatus: stagingRow.ImportStatus,
    importMessage: stagingRow.ImportMessage,
    action,
    changes: changes.length > 0 ? changes : null,
    assignmentInfo,
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

    validateOptionalColumns(rawRows[0]);

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
    let updateRows = 0;
    let ignoredRows = 0;

    const previewData = [];

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
      let updateChanges = [];
      let validationStatus = "Valid";

      if (normalized.role) {
        const roleError = validateMainRole(normalized.role);
        if (roleError) validationErrors.push(roleError);
        role = await userImportRepository.findRoleByKey(normalized.role);

        if (!role && !roleError) {
          validationErrors.push(`Role not found: ${normalized.role}`);
        }
      }

      if (normalized.employeeId || normalized.schoolEmail) {
        duplicateUser = await userImportRepository.findDuplicateUser(
          normalized.employeeId,
          normalized.schoolEmail
        );

        if (duplicateUser) {
          if (validationErrors.length === 0 && role) {
            const existingFullName = String(duplicateUser.FullName || "").trim();
            const importFullName = String(normalized.fullName || "").trim();
            const existingEmail = String(duplicateUser.SchoolEmail || "").trim().toLowerCase();
            const importEmail = String(normalized.schoolEmail || "").trim().toLowerCase();
            const existingRoleKey = String(duplicateUser.LegacyRole || "").trim().toLowerCase();
            const importRoleKey = String(normalized.role || "").trim().toLowerCase();

            if (
              existingFullName !== importFullName ||
              existingEmail !== importEmail ||
              existingRoleKey !== importRoleKey
            ) {
              validationStatus = "Update";
              updateRows++;

              if (existingFullName !== importFullName) {
                updateChanges.push({ field: "FullName", oldValue: existingFullName, newValue: importFullName });
              }
              if (existingEmail !== importEmail) {
                updateChanges.push({ field: "SchoolEmail", oldValue: existingEmail, newValue: importEmail });
              }
              if (existingRoleKey !== importRoleKey) {
                updateChanges.push({ field: "Role", oldValue: existingRoleKey, newValue: importRoleKey });
              }
            } else {
              validationStatus = "Ignored";
              ignoredRows++;
            }
            duplicateRows++;
          } else {
            validationErrors.push(
              `Duplicate user found: ${duplicateUser.EmployeeId || duplicateUser.SchoolEmail}`
            );
            duplicateRows++;
          }
        }
      }

      let assignmentKey = normalized.assignmentKey || null;
      let scopeType = normalized.scopeType || null;
      let scopeName = normalized.scopeName || null;
      let departmentName = normalized.department || null;
      let subjectName = normalized.subject || null;
      let resolvedDepartmentId = null;
      let resolvedSubjectId = null;
      let resolvedYearGroupId = null;
      let resolvedScopeEntityId = null;

      if (assignmentKey) {
        const assignmentType = await userImportRepository.findAssignmentTypeByKey(assignmentKey);

        if (!assignmentType) {
          validationErrors.push(`Assignment not found: ${assignmentKey}`);
        } else {
          const isHod = String(assignmentKey).toLowerCase() === "hod";

          if (isHod) {
            if (!departmentName) {
              validationErrors.push("HOD assignment requires Department.");
            }
            if (!subjectName) {
              validationErrors.push("HOD assignment requires Subject.");
            }
          }

          if (departmentName) {
            const dept = await userImportRepository.findDepartmentByName(departmentName);
            if (!dept) {
              validationErrors.push(`Department not found: ${departmentName}`);
            } else {
              resolvedDepartmentId = dept.DepartmentId;
            }
          }

          if (subjectName) {
            const sub = await userImportRepository.findSubjectByName(subjectName);
            if (!sub) {
              validationErrors.push(`Subject not found: ${subjectName}`);
            } else {
              resolvedSubjectId = sub.SubjectId;
            }
          }

          if (scopeType && scopeName) {
            const validScopeTypes = ["Department", "Subject", "YearGroup", "Class", "Room", "Location", "School"];
            if (!validScopeTypes.includes(scopeType)) {
              validationErrors.push(`Invalid ScopeType: ${scopeType}`);
            } else {
              if (scopeType === "Department") {
                const dept = await userImportRepository.findDepartmentByName(scopeName);
                if (!dept) {
                  validationErrors.push(`Department not found: ${scopeName}`);
                } else {
                  resolvedScopeEntityId = dept.DepartmentId;
                  if (!resolvedDepartmentId) resolvedDepartmentId = dept.DepartmentId;
                }
              } else if (scopeType === "Subject") {
                const sub = await userImportRepository.findSubjectByName(scopeName);
                if (!sub) {
                  validationErrors.push(`Subject not found: ${scopeName}`);
                } else {
                  resolvedScopeEntityId = sub.SubjectId;
                  if (!resolvedSubjectId) resolvedSubjectId = sub.SubjectId;
                }
              } else if (scopeType === "YearGroup") {
                const yg = await userImportRepository.findYearLevelByName(scopeName);
                if (!yg) {
                  validationErrors.push(`YearGroup not found: ${scopeName}`);
                } else {
                  resolvedScopeEntityId = yg.YearLevelId;
                  resolvedYearGroupId = yg.YearLevelId;
                }
              }
            }
          }
        }
      }

      if (validationStatus === "Update" && validationErrors.length > 0) {
        validationStatus = "Invalid";
        updateRows--;
        duplicateRows--;
      }

      if (
        validationStatus !== "Invalid" &&
        duplicateUser &&
        validationErrors.length === 0 &&
        assignmentKey
      ) {
        const existingAssignments = await userImportRepository.findUserAssignments(
          duplicateUser.UserId
        );

        const existingAssignment = existingAssignments[0] || null;
        const existingAssignmentKey = existingAssignment
          ? String(existingAssignment.AssignmentKey || "").trim().toLowerCase().replace(/[\s_-]/g, "")
          : null;
        const importedAssignmentKey = String(assignmentKey).trim().toLowerCase().replace(/[\s_-]/g, "");

        const assignmentChanged =
          existingAssignmentKey !== importedAssignmentKey ||
          (existingAssignment?.DepartmentId || null) !== (resolvedDepartmentId || null) ||
          (existingAssignment?.SubjectId || null) !== (resolvedSubjectId || null) ||
          (existingAssignment?.YearLevelId || null) !== (resolvedYearGroupId || null);

        console.log("[IMPORT PREVIEW] Assignment check:", {
          employeeId: normalized.employeeId,
          existingAssignmentKey,
          importedAssignmentKey,
          existingDept: existingAssignment?.DepartmentId,
          resolvedDept: resolvedDepartmentId,
          existingSubject: existingAssignment?.SubjectId,
          resolvedSubject: resolvedSubjectId,
          existingYear: existingAssignment?.YearLevelId,
          resolvedYear: resolvedYearGroupId,
          assignmentChanged,
        });

        if (assignmentChanged) {
          if (validationStatus === "Ignored") {
            validationStatus = "Update";
            updateRows++;
            ignoredRows--;
          }

          updateChanges.push({
            field: "Assignment",
            oldValue: existingAssignmentKey || "None",
            newValue: importedAssignmentKey,
          });
        }
      }

      if (validationStatus === "Valid") {
        validRows++;
      } else if (validationStatus === "Invalid") {
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

      const stagingId = await userImportRepository.insertStagingRow({
        batchId,
        employeeId: normalized.employeeId,
        fullName: normalized.fullName,
        schoolEmail: normalized.schoolEmail,
        derivedRoleKey: normalized.role,
        matchedUserId: duplicateUser?.UserId || null,
        validationStatus,
        validationMessage:
          validationErrors.length > 0
            ? validationErrors.join(" | ")
            : validationStatus === "Update"
              ? "User will be updated."
              : validationStatus === "Ignored"
                ? "No changes detected."
                : "Ready to import.",
        importStatus: "Pending",
        importMessage: null,
        assignmentKey: assignmentKey,
        scopeType: scopeType,
        scopeName: scopeName,
        departmentName: departmentName,
        subjectName: subjectName,
      });

      previewData.push({
        sourceRowNumber,
        stagingId,
        validationStatus,
        updateChanges,
        rawRow: rawRows[index],
        duplicateUser,
        resolvedDepartmentId,
        resolvedSubjectId,
        resolvedYearGroupId,
        resolvedScopeEntityId,
      });
    }

    await userImportRepository.updateBatchValidationSummary(batchId, {
      validRows,
      invalidRows,
      duplicateRows,
      updateRows,
      ignoredRows,
      status: invalidRows > 0 ? "ValidatedWithErrors" : "Validated",
      remarks:
        invalidRows > 0
          ? "Import preview completed with validation errors."
          : "Import preview completed successfully.",
    });

    return {
      batchId,
      summary: {
        totalRows: rawRows.length,
        validRows,
        invalidRows,
        duplicateRows,
        updateRows,
        ignoredRows,
      },
      preview: previewData.map((item) =>
        buildPreviewRow(
          {
            StaffImportStagingId: item.stagingId,
            EmployeeId: item.rawRow.EmployeeId || item.rawRow.employeeId || "",
            FullName: item.rawRow.FullName || item.rawRow.fullName || "",
            SchoolEmail: item.rawRow.SchoolEmail || item.rawRow.schoolEmail || "",
            DerivedRoleKey: item.rawRow.Role || item.rawRow.role || "",
            AssignmentKey: item.rawRow.AssignmentKey || item.rawRow.assignmentKey || null,
            ScopeType: item.rawRow.ScopeType || item.rawRow.scopeType || null,
            ScopeName: item.rawRow.ScopeName || item.rawRow.scopeName || null,
            DepartmentName: item.rawRow.Department || item.rawRow.department || null,
            SubjectName: item.rawRow.Subject || item.rawRow.subject || null,
            ValidationStatus: item.validationStatus,
            ValidationMessage:
              item.validationStatus === "Update"
                ? "User will be updated."
                : item.validationStatus === "Ignored"
                  ? "No changes detected."
                  : "Ready to import.",
            ImportStatus: "Pending",
            ImportMessage: null,
            MatchedUserId: item.duplicateUser?.UserId || null,
          },
          item.updateChanges,
          item.resolvedDepartmentId || item.resolvedSubjectId || item.resolvedYearGroupId ? {
            departmentId: item.resolvedDepartmentId,
            subjectId: item.resolvedSubjectId,
            yearGroupId: item.resolvedYearGroupId,
            scopeEntityId: item.resolvedScopeEntityId,
          } : null
        ),
      ),
    };
  } finally {
    deleteTempFile(file?.path);
  }
}

/**
 * Commit valid preview rows into dbo.Users.
 */
async function commitUserImport(batchId, currentUser) {
  console.log("[IMPORT COMMIT] Starting commit for batchId:", batchId);
  
  if (!batchId) {
    const error = new Error("Import batch ID is required.");
    error.statusCode = 400;
    throw error;
  }

  const stagingRows = await userImportRepository.getStagingRowsByBatch(
    Number(batchId)
  );

  console.log("[IMPORT COMMIT] Fetched staging rows:", stagingRows.length);
  if (stagingRows.length > 0) {
    console.log("[IMPORT COMMIT] First row sample:", {
      stagingId: stagingRows[0].StaffImportStagingId,
      validationStatus: stagingRows[0].ValidationStatus,
      importStatus: stagingRows[0].ImportStatus,
      assignmentKey: stagingRows[0].AssignmentKey,
    });
  }

  if (!stagingRows || stagingRows.length === 0) {
    const error = new Error("No staging rows found for this batch.");
    error.statusCode = 404;
    throw error;
  }

  let importedRows = 0;
  let updatedRows = 0;
  let skippedRows = 0;
  const errors = [];

  for (const row of stagingRows) {
    try {
      console.log("[IMPORT COMMIT] Processing row:", row.StaffImportStagingId, "ValidationStatus:", row.ValidationStatus, "ImportStatus:", row.ImportStatus, "AssignmentKey:", row.AssignmentKey);
      
      if (row.ValidationStatus !== "Valid" && row.ValidationStatus !== "Update") {
        skippedRows++;
        console.log("[IMPORT COMMIT] Skipping - not Valid/Update");
        await userImportRepository.markStagingFailed(
          row.StaffImportStagingId,
          "Skipped because row is not valid."
        );
        continue;
      }

      if (row.ImportStatus === "Imported") {
        skippedRows++;
        console.log("[IMPORT COMMIT] Skipping - already imported");
        continue;
      }

      const isUpdate = row.ValidationStatus === "Update";
      console.log("[IMPORT COMMIT] isUpdate:", isUpdate);

      if (isUpdate) {
        console.log("[IMPORT UPDATE] Processing update for:", row.EmployeeId, row.SchoolEmail);

        const existingUser = await userImportRepository.findDuplicateUser(
          row.EmployeeId,
          row.SchoolEmail
        );

        if (!existingUser) {
          skippedRows++;
          await userImportRepository.markStagingFailed(
            row.StaffImportStagingId,
            "Update skipped: user no longer exists."
          );
          continue;
        }

        console.log("[IMPORT UPDATE] Found existing user:", existingUser.UserId, existingUser.FullName);

        const role = await userImportRepository.findRoleByKey(row.DerivedRoleKey);

        if (!role) {
          skippedRows++;
          await userImportRepository.markStagingFailed(
            row.StaffImportStagingId,
            `Role not found: ${row.DerivedRoleKey}`
          );
          continue;
        }

        await userImportRepository.updateUserFromImport({
          userId: existingUser.UserId,
          fullName: row.FullName,
          schoolEmail: row.SchoolEmail,
          roleId: role.RoleId,
          legacyRole: role.RoleKey,
        });

        if (row.AssignmentKey) {
          console.log("[IMPORT UPDATE] >>> ENTERED assignment block for:", row.EmployeeId, "AssignmentKey:", row.AssignmentKey);
          const assignmentType = await userImportRepository.findAssignmentTypeByKey(row.AssignmentKey);
          console.log("[IMPORT UPDATE] >>> AssignmentType result:", assignmentType);

          if (assignmentType) {
            console.log("[IMPORT UPDATE] >>> Assignment type found, proceeding with update");
            const existingAssignments = await userImportRepository.findUserAssignments(existingUser.UserId);
            console.log("[IMPORT UPDATE] >>> Existing assignments:", existingAssignments);

            await userImportRepository.deleteUserAssignments(existingUser.UserId);
            console.log("[IMPORT UPDATE] >>> Deleted old assignments");

            let departmentId = null;
            let subjectId = null;
            let yearGroupId = null;
            let scopeEntityId = null;
            let scopeType = null;

            if (row.DepartmentName) {
              const dept = await userImportRepository.findDepartmentByName(row.DepartmentName);
              if (dept) {
                departmentId = dept.DepartmentId;
                scopeEntityId = dept.DepartmentId;
                scopeType = "Department";
              }
            }

            if (row.SubjectName) {
              const sub = await userImportRepository.findSubjectByName(row.SubjectName);
              if (sub) {
                subjectId = sub.SubjectId;
                if (!scopeEntityId) {
                  scopeEntityId = sub.SubjectId;
                  scopeType = "Subject";
                }
              }
            }

            if (row.ScopeType === "YearGroup" && row.ScopeName) {
              const yg = await userImportRepository.findYearLevelByName(row.ScopeName);
              if (yg) {
                yearGroupId = yg.YearLevelId;
                scopeEntityId = yg.YearLevelId;
                scopeType = "YearGroup";
              }
            }

            console.log("[IMPORT UPDATE] >>> Creating assignment:", { userId: existingUser.UserId, assignmentTypeId: assignmentType.AssignmentTypeId, departmentId, subjectId, yearGroupId });

            const assignmentId = await userImportRepository.createUserAssignment({
              userId: existingUser.UserId,
              assignmentTypeId: assignmentType.AssignmentTypeId,
              isPrimary: true,
              departmentId,
              subjectId,
              yearGroupId,
            });

            console.log("[IMPORT UPDATE] >>> Created assignment:", assignmentId);

            if (scopeType && scopeEntityId) {
              const scopeValue =
                scopeType === "Department" ? row.DepartmentName :
                scopeType === "Subject" ? row.SubjectName :
                row.ScopeName;

              await userImportRepository.createUserAssignmentScope({
                userAssignmentId: assignmentId,
                scopeType,
                scopeValue,
                scopeEntityId,
              });
              console.log("[IMPORT UPDATE] >>> Created scope:", scopeType, scopeValue, scopeEntityId);
            }
          } else {
            console.log("[IMPORT UPDATE] >>> Assignment type NOT FOUND for key:", row.AssignmentKey);
          }
        } else {
          console.log("[IMPORT UPDATE] >>> NO AssignmentKey for row:", row.EmployeeId);
        }

        await userImportRepository.markStagingImported(
          row.StaffImportStagingId,
          existingUser.UserId
        );

        updatedRows++;
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

      const roleError = validateMainRole(row.DerivedRoleKey);
      if (roleError) {
        skippedRows++;
        await userImportRepository.markStagingFailed(row.StaffImportStagingId, roleError);
        errors.push({ employeeId: row.EmployeeId, message: roleError });
        continue;
      }

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

      if (row.AssignmentKey) {
        const assignmentType = await userImportRepository.findAssignmentTypeByKey(row.AssignmentKey);

        if (assignmentType) {
          let departmentId = null;
          let subjectId = null;
          let yearGroupId = null;
          let scopeEntityId = null;
          let scopeType = null;

          if (row.DepartmentName) {
            const dept = await userImportRepository.findDepartmentByName(row.DepartmentName);
            if (dept) {
              departmentId = dept.DepartmentId;
              scopeEntityId = dept.DepartmentId;
              scopeType = "Department";
            }
          }

          if (row.SubjectName) {
            const sub = await userImportRepository.findSubjectByName(row.SubjectName);
            if (sub) {
              subjectId = sub.SubjectId;
              if (!scopeEntityId) {
                scopeEntityId = sub.SubjectId;
                scopeType = "Subject";
              }
            }
          }

          if (row.ScopeType === "YearGroup" && row.ScopeName) {
            const yg = await userImportRepository.findYearLevelByName(row.ScopeName);
            if (yg) {
              yearGroupId = yg.YearLevelId;
              scopeEntityId = yg.YearLevelId;
              scopeType = "YearGroup";
            }
          }

          const assignmentId = await userImportRepository.createUserAssignment({
            userId,
            assignmentTypeId: assignmentType.AssignmentTypeId,
            isPrimary: true,
            departmentId,
            subjectId,
            yearGroupId,
          });

          if (scopeType && scopeEntityId) {
            const scopeValue =
              scopeType === "Department" ? row.DepartmentName :
              scopeType === "Subject" ? row.SubjectName :
              row.ScopeName;

            await userImportRepository.createUserAssignmentScope({
              userAssignmentId: assignmentId,
              scopeType,
              scopeValue,
              scopeEntityId,
            });
          }
        }
      }

      await userImportRepository.markStagingImported(
        row.StaffImportStagingId,
        userId
      );

      importedRows++;
    } catch (error) {
      console.log("[IMPORT COMMIT] Error processing row:", row.StaffImportStagingId, error.message);
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

  console.log("[IMPORT COMMIT] Finished loop. importedRows:", importedRows, "updatedRows:", updatedRows, "skippedRows:", skippedRows, "errors:", errors.length);

  await userImportRepository.updateBatchImportSummary(Number(batchId), {
    importedRows,
    updatedRows,
    status: errors.length > 0 ? "ImportedWithErrors" : "Imported",
    remarks:
      errors.length > 0
        ? "Import completed with some skipped or failed rows."
        : "Import completed successfully.",
  });

  console.log("[IMPORT COMMIT] Returning result:", { batchId: Number(batchId), importedRows, updatedRows, skippedRows, errors: errors.length });

  return {
    batchId: Number(batchId),
    importedRows,
    updatedRows,
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
