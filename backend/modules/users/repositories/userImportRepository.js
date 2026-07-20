// backend/modules/users/repositories/userImportRepository.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Users Import Repository
 * ============================================================
 *
 * Purpose:
 * Handles database operations for staff/user import.
 *
 * Database Tables:
 * - StaffImportBatches
 * - StaffImportStaging
 * - ImportErrorLogs
 * - vw_StaffImportValidation
 * - Users
 * - Roles
 *
 * Rules:
 * - No HTTP logic here.
 * - No Excel parsing here.
 * - No password hashing here.
 * - No business decisions here.
 * ============================================================
 */

const {
  sql,
  executeQuery,
  firstOrNull,
  rows,
  insertedId,
} = require("../../../shared/database");

const { poolPromise } = require("../../../database");

/**
 * Create a new import batch.
 */
async function createBatch(data) {
  const result = await executeQuery(
    `
    INSERT INTO dbo.StaffImportBatches
    (
      BatchName,
      OriginalFileName,
      UploadedBy,
      TotalRows,
      ValidRows,
      InvalidRows,
      DuplicateRows,
      UpdateRows,
      IgnoredRows,
      ImportedRows,
      Status,
      Remarks,
      CreatedAt
    )
    OUTPUT INSERTED.StaffImportBatchId
    VALUES
    (
      @BatchName,
      @OriginalFileName,
      @UploadedBy,
      @TotalRows,
      0,
      0,
      0,
      0,
      0,
      0,
      @Status,
      @Remarks,
      GETDATE()
    );
    `,
    [
      { name: "BatchName", type: sql.NVarChar, value: data.batchName },
      { name: "OriginalFileName", type: sql.NVarChar, value: data.originalFileName || null },
      { name: "UploadedBy", type: sql.Int, value: data.uploadedBy || null },
      { name: "TotalRows", type: sql.Int, value: data.totalRows || 0 },
      { name: "Status", type: sql.NVarChar, value: data.status || "Previewed" },
      { name: "Remarks", type: sql.NVarChar, value: data.remarks || null },
    ]
  );

  return insertedId(result, "StaffImportBatchId");
}

/**
  * Insert one staging row.
  */
async function insertStagingRow(data) {
  const result = await executeQuery(
    `
    INSERT INTO dbo.StaffImportStaging
    (
      StaffImportBatchId,
      EmployeeId,
      FullName,
      SchoolEmail,
      DerivedRoleKey,
      MatchedUserId,
      ValidationStatus,
      ValidationMessage,
      ImportStatus,
      ImportMessage,
      AssignmentKey,
      ScopeType,
      ScopeName,
      DepartmentName,
      SubjectName,
      CreatedAt
    )
    OUTPUT INSERTED.StaffImportStagingId
    VALUES
    (
      @StaffImportBatchId,
      @EmployeeId,
      @FullName,
      @SchoolEmail,
      @DerivedRoleKey,
      @MatchedUserId,
      @ValidationStatus,
      @ValidationMessage,
      @ImportStatus,
      @ImportMessage,
      @AssignmentKey,
      @ScopeType,
      @ScopeName,
      @DepartmentName,
      @SubjectName,
      GETDATE()
    );
    `,
    [
      { name: "StaffImportBatchId", type: sql.Int, value: data.batchId },
      { name: "EmployeeId", type: sql.NVarChar, value: data.employeeId },
      { name: "FullName", type: sql.NVarChar, value: data.fullName },
      { name: "SchoolEmail", type: sql.NVarChar, value: data.schoolEmail },
      { name: "DerivedRoleKey", type: sql.NVarChar, value: data.derivedRoleKey || null },
      { name: "MatchedUserId", type: sql.Int, value: data.matchedUserId || null },
      { name: "ValidationStatus", type: sql.NVarChar, value: data.validationStatus },
      { name: "ValidationMessage", type: sql.NVarChar, value: data.validationMessage || null },
      { name: "ImportStatus", type: sql.NVarChar, value: data.importStatus || "Pending" },
      { name: "ImportMessage", type: sql.NVarChar, value: data.importMessage || null },
      { name: "AssignmentKey", type: sql.NVarChar, value: data.assignmentKey || null },
      { name: "ScopeType", type: sql.NVarChar, value: data.scopeType || null },
      { name: "ScopeName", type: sql.NVarChar, value: data.scopeName || null },
      { name: "DepartmentName", type: sql.NVarChar, value: data.departmentName || null },
      { name: "SubjectName", type: sql.NVarChar, value: data.subjectName || null },
    ]
  );

  return insertedId(result, "StaffImportStagingId");
}

/**
 * Find duplicate user by EmployeeId or SchoolEmail.
 */
async function findDuplicateUser(employeeId, schoolEmail) {
  const result = await executeQuery(
    `
    SELECT TOP 1
      UserId,
      EmployeeId,
      SchoolEmail,
      FullName
    FROM dbo.Users
    WHERE IsDeleted = 0
      AND (
        EmployeeId = @EmployeeId
        OR SchoolEmail = @SchoolEmail
      );
    `,
    [
      { name: "EmployeeId", type: sql.NVarChar, value: employeeId },
      { name: "SchoolEmail", type: sql.NVarChar, value: schoolEmail },
    ]
  );

  return firstOrNull(result);
}

/**
 * Find role by RoleKey.
 */
async function findRoleByKey(roleKey) {
  const result = await executeQuery(
    `
    SELECT TOP 1
      RoleId,
      RoleKey,
      RoleName,
      DisplayName,
      IsProtected,
      IsActive
    FROM dbo.Roles
    WHERE IsActive = 1
      AND RoleKey = @RoleKey;
    `,
    [
      { name: "RoleKey", type: sql.NVarChar, value: roleKey },
    ]
  );

  return firstOrNull(result);
}

/**
 * Create user from staging row.
 */
async function createUserFromImport(data) {
  const result = await executeQuery(
    `
    INSERT INTO dbo.Users
    (
      EmployeeId,
      FullName,
      SchoolEmail,
      PasswordHash,
      RoleId,
      LegacyRole,
      MustChangePassword,
      EmailVerified,
      IsRegistrationCompleted,
      IsActive,
      IsLocked,
      FailedLoginAttempts,
      CreatedAt,
      UpdatedAt,
      IsDeleted,
      SchoolId
    )
    OUTPUT INSERTED.UserId
    VALUES
    (
      @EmployeeId,
      @FullName,
      @SchoolEmail,
      @PasswordHash,
      @RoleId,
      @LegacyRole,
      1,
      0,
      1,
      1,
      0,
      0,
      GETDATE(),
      GETDATE(),
      0,
      @SchoolId
    );
    `,
    [
      { name: "EmployeeId", type: sql.NVarChar, value: data.employeeId },
      { name: "FullName", type: sql.NVarChar, value: data.fullName },
      { name: "SchoolEmail", type: sql.NVarChar, value: data.schoolEmail },
      { name: "PasswordHash", type: sql.NVarChar, value: data.passwordHash },
      { name: "RoleId", type: sql.Int, value: data.roleId },
      { name: "LegacyRole", type: sql.NVarChar, value: data.legacyRole },
      { name: "SchoolId", type: sql.Int, value: data.schoolId || null },
    ]
  );

  return insertedId(result, "UserId");
}

/**
  * Get staging rows for one batch.
  */
async function getStagingRowsByBatch(batchId) {
  const result = await executeQuery(
    `
    SELECT
      StaffImportStagingId,
      StaffImportBatchId,
      EmployeeId,
      FullName,
      SchoolEmail,
      DerivedRoleKey,
      MatchedUserId,
      ValidationStatus,
      ValidationMessage,
      ImportStatus,
      ImportMessage,
      AssignmentKey,
      ScopeType,
      ScopeName,
      DepartmentName,
      SubjectName,
      CreatedAt,
      ImportedAt
    FROM dbo.StaffImportStaging
    WHERE StaffImportBatchId = @BatchId
    ORDER BY StaffImportStagingId;
    `,
    [
      { name: "BatchId", type: sql.Int, value: batchId },
    ]
  );

  return rows(result);
}

/**
 * Mark staging row as imported.
 */
async function markStagingImported(stagingId, userId) {
  await executeQuery(
    `
    UPDATE dbo.StaffImportStaging
    SET
      MatchedUserId = @UserId,
      ImportStatus = 'Imported',
      ImportMessage = 'User imported successfully.',
      ImportedAt = GETDATE()
    WHERE StaffImportStagingId = @StagingId;
    `,
    [
      { name: "StagingId", type: sql.Int, value: stagingId },
      { name: "UserId", type: sql.Int, value: userId },
    ]
  );
}

/**
 * Mark staging row as failed.
 */
async function markStagingFailed(stagingId, message) {
  await executeQuery(
    `
    UPDATE dbo.StaffImportStaging
    SET
      ImportStatus = 'Failed',
      ImportMessage = @Message
    WHERE StaffImportStagingId = @StagingId;
    `,
    [
      { name: "StagingId", type: sql.Int, value: stagingId },
      { name: "Message", type: sql.NVarChar, value: message },
    ]
  );
}

/**
 * Update batch summary after preview.
 */
async function updateBatchValidationSummary(batchId, summary) {
  await executeQuery(
    `
    UPDATE dbo.StaffImportBatches
    SET
      ValidRows = @ValidRows,
      InvalidRows = @InvalidRows,
      DuplicateRows = @DuplicateRows,
      UpdateRows = @UpdateRows,
      IgnoredRows = @IgnoredRows,
      Status = @Status,
      ValidatedAt = GETDATE(),
      Remarks = @Remarks
    WHERE StaffImportBatchId = @BatchId;
    `,
    [
      { name: "BatchId", type: sql.Int, value: batchId },
      { name: "ValidRows", type: sql.Int, value: summary.validRows || 0 },
      { name: "InvalidRows", type: sql.Int, value: summary.invalidRows || 0 },
      { name: "DuplicateRows", type: sql.Int, value: summary.duplicateRows || 0 },
      { name: "UpdateRows", type: sql.Int, value: summary.updateRows || 0 },
      { name: "IgnoredRows", type: sql.Int, value: summary.ignoredRows || 0 },
      { name: "Status", type: sql.NVarChar, value: summary.status || "Validated" },
      { name: "Remarks", type: sql.NVarChar, value: summary.remarks || null },
    ]
  );
}

/**
 * Update batch summary after commit.
 */
async function updateBatchImportSummary(batchId, summary) {
  await executeQuery(
    `
    UPDATE dbo.StaffImportBatches
    SET
      ImportedRows = @ImportedRows,
      UpdateRows = @UpdateRows,
      Status = @Status,
      ImportedAt = GETDATE(),
      Remarks = @Remarks
    WHERE StaffImportBatchId = @BatchId;
    `,
    [
      { name: "BatchId", type: sql.Int, value: batchId },
      { name: "ImportedRows", type: sql.Int, value: summary.importedRows || 0 },
      { name: "UpdateRows", type: sql.Int, value: summary.updatedRows || 0 },
      { name: "Status", type: sql.NVarChar, value: summary.status || "Imported" },
      { name: "Remarks", type: sql.NVarChar, value: summary.remarks || null },
    ]
  );
}

/**
 * Get recent import batches.
 */
async function getImportHistory() {
  const result = await executeQuery(`
    SELECT TOP 50
      StaffImportBatchId,
      BatchName,
      OriginalFileName,
      UploadedBy,
      TotalRows,
      ValidRows,
      InvalidRows,
      DuplicateRows,
      ImportedRows,
      Status,
      Remarks,
      CreatedAt,
      ValidatedAt,
      ImportedAt
    FROM dbo.StaffImportBatches
    ORDER BY CreatedAt DESC;
  `);

  return rows(result);
}

/**
  * Log import error.
  */
async function logImportError(data) {
  await executeQuery(
    `
    INSERT INTO dbo.ImportErrorLogs
    (
      ImportType,
      BatchId,
      SourceSheet,
      SourceRow,
      RawData,
      ErrorType,
      ErrorMessage,
      IsResolved,
      CreatedAt
    )
    VALUES
    (
      'StaffImport',
      @BatchId,
      @SourceSheet,
      @SourceRow,
      @RawData,
      @ErrorType,
      @ErrorMessage,
      0,
      GETDATE()
    );
    `,
    [
      { name: "BatchId", type: sql.Int, value: data.batchId || null },
      { name: "SourceSheet", type: sql.NVarChar, value: data.sourceSheet || null },
      { name: "SourceRow", type: sql.Int, value: data.sourceRow || null },
      { name: "RawData", type: sql.NVarChar, value: data.rawData || null },
      { name: "ErrorType", type: sql.NVarChar, value: data.errorType || "Validation" },
      { name: "ErrorMessage", type: sql.NVarChar, value: data.errorMessage },
    ]
  );
}

/**
 * Find assignment type by key.
 */
async function findAssignmentTypeByKey(assignmentKey) {
  if (!assignmentKey) return null;

  const result = await executeQuery(
    `
    SELECT TOP 1
      AssignmentTypeId,
      AssignmentKey,
      AssignmentName,
      IsActive
    FROM dbo.AssignmentTypes
    WHERE IsActive = 1
      AND UPPER(AssignmentKey) = UPPER(@AssignmentKey);
    `,
    [
      { name: "AssignmentKey", type: sql.NVarChar, value: String(assignmentKey) },
    ]
  );

  return firstOrNull(result);
}

/**
 * Find department by name.
 */
async function findDepartmentByName(departmentName) {
  const result = await executeQuery(
    `
    SELECT TOP 1 DepartmentId, DepartmentName
    FROM dbo.Departments
    WHERE IsActive = 1
      AND DepartmentName = @DepartmentName;
    `,
    [
      { name: "DepartmentName", type: sql.NVarChar, value: departmentName },
    ]
  );

  return firstOrNull(result);
}

/**
 * Find year level by name.
 */
async function findYearLevelByName(yearLevelName) {
  const result = await executeQuery(
    `
    SELECT TOP 1 YearLevelId, YearLevelName
    FROM dbo.YearLevels
    WHERE IsActive = 1
      AND YearLevelName = @YearLevelName;
    `,
    [
      { name: "YearLevelName", type: sql.NVarChar, value: yearLevelName },
    ]
  );

  return firstOrNull(result);
}

/**
 * Find subject by name.
 */
async function findSubjectByName(subjectName) {
  const result = await executeQuery(
    `
    SELECT TOP 1 SubjectId, SubjectName
    FROM dbo.Subjects
    WHERE IsActive = 1
      AND SubjectName = @SubjectName;
    `,
    [
      { name: "SubjectName", type: sql.NVarChar, value: subjectName },
    ]
  );

  return firstOrNull(result);
}

/**
 * Find section by name.
 */
async function findSectionByName(sectionName) {
  const result = await executeQuery(
    `
    SELECT TOP 1 SectionId, SectionName
    FROM dbo.Sections
    WHERE IsActive = 1
      AND SectionName = @SectionName;
    `,
    [
      { name: "SectionName", type: sql.NVarChar, value: sectionName },
    ]
  );

  return firstOrNull(result);
}

/**
 * Update existing user from import data.
 */
async function updateUserFromImport(data) {
  console.log("[IMPORT REPO] updateUserFromImport:", data);
  await executeQuery(
    `
    UPDATE dbo.Users
    SET
      FullName = @FullName,
      SchoolEmail = @SchoolEmail,
      RoleId = @RoleId,
      LegacyRole = @LegacyRole,
      UpdatedAt = GETDATE()
    WHERE UserId = @UserId;
    `,
    [
      { name: "UserId", type: sql.Int, value: data.userId },
      { name: "FullName", type: sql.NVarChar, value: data.fullName },
      { name: "SchoolEmail", type: sql.NVarChar, value: data.schoolEmail },
      { name: "RoleId", type: sql.Int, value: data.roleId },
      { name: "LegacyRole", type: sql.NVarChar, value: data.legacyRole },
    ]
  );
  console.log("[IMPORT REPO] updateUserFromImport: done");
}

/**
 * Create user assignment after user import.
 */
async function createUserAssignment(data) {
  console.log("[IMPORT REPO] createUserAssignment:", data);
  const result = await executeQuery(
    `
    INSERT INTO dbo.UserAssignments
    (
      UserId,
      AssignmentTypeId,
      IsPrimary,
      IsActive,
      StartDate,
      EndDate,
      DepartmentId,
      SectionId,
      SubjectId,
      YearLevelId,
      CreatedAt,
      UpdatedAt
    )
    OUTPUT INSERTED.UserAssignmentId
    VALUES
    (
      @UserId,
      @AssignmentTypeId,
      @IsPrimary,
      1,
      GETDATE(),
      NULL,
      @DepartmentId,
      @SectionId,
      @SubjectId,
      @YearLevelId,
      GETDATE(),
      GETDATE()
    );
    `,
    [
      { name: "UserId", type: sql.Int, value: data.userId },
      { name: "AssignmentTypeId", type: sql.Int, value: data.assignmentTypeId },
      { name: "IsPrimary", type: sql.Bit, value: data.isPrimary ? 1 : 0 },
      { name: "DepartmentId", type: sql.Int, value: data.departmentId || null },
      { name: "SectionId", type: sql.Int, value: data.sectionId || null },
      { name: "SubjectId", type: sql.Int, value: data.subjectId || null },
      { name: "YearLevelId", type: sql.Int, value: data.yearGroupId || null },
    ]
  );

  const id = insertedId(result, "UserAssignmentId");
  console.log("[IMPORT REPO] createUserAssignment: created id", id);
  return id;
}

/**
 * Create user assignment scope.
 */
async function createUserAssignmentScope(data) {
  console.log("[IMPORT REPO] createUserAssignmentScope:", data);
  await executeQuery(
    `
    INSERT INTO dbo.UserAssignmentScopes
    (
      UserAssignmentId,
      ScopeType,
      ScopeValue,
      ScopeEntityId,
      ScopeVersion,
      IsActive,
      CreatedAt
    )
    VALUES
    (
      @UserAssignmentId,
      @ScopeType,
      @ScopeValue,
      @ScopeEntityId,
      1,
      1,
      GETDATE()
    );
    `,
    [
      { name: "UserAssignmentId", type: sql.Int, value: data.userAssignmentId },
      { name: "ScopeType", type: sql.NVarChar, value: data.scopeType },
      { name: "ScopeValue", type: sql.NVarChar, value: data.scopeValue || null },
      { name: "ScopeEntityId", type: sql.Int, value: data.scopeEntityId },
    ]
  );
  console.log("[IMPORT REPO] createUserAssignmentScope: done");
}

/**
 * Find all assignments for a user.
 */
async function findUserAssignments(userId) {
  console.log("[IMPORT REPO] findUserAssignments for userId:", userId);
  const result = await executeQuery(
    `
    SELECT ua.UserAssignmentId, ua.AssignmentTypeId, ua.DepartmentId, ua.SubjectId, ua.YearLevelId, ua.ClassId, ua.RoomId, at.AssignmentKey
    FROM dbo.UserAssignments ua
    JOIN dbo.AssignmentTypes at ON at.AssignmentTypeId = ua.AssignmentTypeId
    WHERE ua.UserId = @UserId;
    `,
    [{ name: "UserId", type: sql.Int, value: Number(userId) }]
  );

  const assignments = rows(result);
  console.log("[IMPORT REPO] findUserAssignments result:", assignments);
  return assignments;
}

/**
 * Delete all assignments and scopes for a user.
 */
async function deleteUserAssignments(userId) {
  console.log("[IMPORT REPO] deleteUserAssignments for userId:", userId);
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    await new sql.Request(transaction)
      .input("UserId", sql.Int, Number(userId))
      .query(`
        DELETE FROM dbo.UserAssignmentScopes
        WHERE UserAssignmentId IN (
          SELECT UserAssignmentId FROM dbo.UserAssignments WHERE UserId = @UserId
        );
      `);

    await new sql.Request(transaction)
      .input("UserId", sql.Int, Number(userId))
      .query(`
        DELETE FROM dbo.UserAssignments
        WHERE UserId = @UserId;
      `);

    await transaction.commit();
    console.log("[IMPORT REPO] deleteUserAssignments: done");
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback();
    }
    throw error;
  }
}

module.exports = {
  createBatch,
  insertStagingRow,
  findDuplicateUser,
  findRoleByKey,
  createUserFromImport,
  updateUserFromImport,
  getStagingRowsByBatch,
  markStagingImported,
  markStagingFailed,
  updateBatchValidationSummary,
  updateBatchImportSummary,
  getImportHistory,
  logImportError,
  findAssignmentTypeByKey,
  findDepartmentByName,
  findYearLevelByName,
  findSubjectByName,
  findSectionByName,
  createUserAssignment,
  createUserAssignmentScope,
  findUserAssignments,
  deleteUserAssignments,
};