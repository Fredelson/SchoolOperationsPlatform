// backend/modules/assignments/repositories/assignmentRepository.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Assignment Repository
 * ============================================================
 *
 * Purpose:
 * Handles database access for assignment-related data.
 *
 * Source of Truth:
 * OperationsPlatformDB
 *
 * Rules:
 * - No business logic here.
 * - No HTTP response logic here.
 * - Only SQL queries belong here.
 * ============================================================
 */

const {
  sql,
  executeQuery,
  rows,
  firstOrNull,
  insertedId,
} = require("../../../shared/database");


/**
 * Gets all active assignment types.
 *
 * Used by:
 * GET /api/assignments/types
 *
 * @returns {Promise<Array>} Assignment type records.
 */
async function getAssignmentTypes() {
  const result = await executeQuery(`
    SELECT
      AssignmentTypeId,
      AssignmentKey,
      AssignmentName,
      Description,
      IsSystemAssignment,
      IsActive,
      SortOrder,
      CreatedAt,
      UpdatedAt
    FROM dbo.AssignmentTypes
    WHERE IsActive = 1
    ORDER BY SortOrder ASC, AssignmentName ASC;
  `);

  return rows(result);
}

/**
 * Gets all active assignments for a specific user.
 *
 * Used by:
 * GET /api/assignments/users/:userId
 */
async function getUserAssignments(userId) {
  const result = await executeQuery(
    `
    SELECT
      ua.UserAssignmentId,
      ua.UserId,
      u.FullName,
      u.EmployeeId,
      ua.AssignmentTypeId,
      at.AssignmentKey,
      at.AssignmentName,
      ua.AcademicYearId,
      ay.AcademicYearName,
      ua.DepartmentId,
      d.DepartmentName,
      ua.SectionId,
      s.SectionName,
      ua.SubjectId,
      sub.SubjectName,
      ua.YearLevelId,
      yl.YearLevelName,
      ua.ClassId,
      c.ClassName,
      ua.RoomId,
      r.RoomName,
      ua.IsPrimary,
      ua.IsActive,
      ua.StartDate,
      ua.EndDate,
      ua.CreatedAt,
      ua.UpdatedAt
    FROM dbo.UserAssignments ua
    INNER JOIN dbo.Users u
      ON ua.UserId = u.UserId
    INNER JOIN dbo.AssignmentTypes at
      ON ua.AssignmentTypeId = at.AssignmentTypeId
    LEFT JOIN dbo.AcademicYears ay
      ON ua.AcademicYearId = ay.AcademicYearId
    LEFT JOIN dbo.Departments d
      ON ua.DepartmentId = d.DepartmentId
    LEFT JOIN dbo.Sections s
      ON ua.SectionId = s.SectionId
    LEFT JOIN dbo.Subjects sub
      ON ua.SubjectId = sub.SubjectId
    LEFT JOIN dbo.YearLevels yl
      ON ua.YearLevelId = yl.YearLevelId
    LEFT JOIN dbo.Classes c
      ON ua.ClassId = c.ClassId
    LEFT JOIN dbo.Rooms r
      ON ua.RoomId = r.RoomId
    WHERE ua.UserId = @UserId
      AND ua.IsActive = 1
    ORDER BY ua.IsPrimary DESC, at.SortOrder ASC, at.AssignmentName ASC;
    `,
    [
      {
        name: "UserId",
        type: sql.Int,
        value: userId,
      },
    ]
  );

  return rows(result);
}

/**
 * Finds a user by ID.
 */
async function findUserById(userId) {
  const result = await executeQuery(
    `
    SELECT
      UserId,
      FullName,
      EmployeeId,
      IsActive
    FROM dbo.Users
    WHERE UserId = @UserId;
    `,
    [{ name: "UserId", type: sql.Int, value: userId }]
  );

  return firstOrNull(result);
}

/**
 * Finds an active assignment type.
 */
async function findAssignmentTypeById(assignmentTypeId) {
  const result = await executeQuery(
    `
    SELECT
      AssignmentTypeId,
      AssignmentKey,
      AssignmentName,
      IsActive
    FROM dbo.AssignmentTypes
    WHERE AssignmentTypeId = @AssignmentTypeId
      AND IsActive = 1;
    `,
    [
      {
        name: "AssignmentTypeId",
        type: sql.Int,
        value: assignmentTypeId,
      },
    ]
  );

  return firstOrNull(result);
}

/**
 * Finds an academic year.
 */
async function findAcademicYearById(academicYearId) {
  const result = await executeQuery(
    `
    SELECT
      AcademicYearId,
      AcademicYearName,
      IsActive
    FROM dbo.AcademicYears
    WHERE AcademicYearId = @AcademicYearId;
    `,
    [
      {
        name: "AcademicYearId",
        type: sql.Int,
        value: academicYearId,
      },
    ]
  );

  return firstOrNull(result);
}

/**
 * Checks whether an active assignment already exists for the same user,
 * assignment type, academic year, and exact scope.
 */
async function findDuplicateAssignment(userId, data) {
  const result = await executeQuery(
    `
    SELECT
      UserAssignmentId
    FROM dbo.UserAssignments
    WHERE UserId = @UserId
      AND AssignmentTypeId = @AssignmentTypeId
      AND AcademicYearId = @AcademicYearId
      AND ISNULL(DepartmentId, 0) = ISNULL(@DepartmentId, 0)
      AND ISNULL(SectionId, 0) = ISNULL(@SectionId, 0)
      AND ISNULL(SubjectId, 0) = ISNULL(@SubjectId, 0)
      AND ISNULL(YearLevelId, 0) = ISNULL(@YearLevelId, 0)
      AND ISNULL(ClassId, 0) = ISNULL(@ClassId, 0)
      AND ISNULL(RoomId, 0) = ISNULL(@RoomId, 0)
      AND IsActive = 1;
    `,
    [
      { name: "UserId", type: sql.Int, value: userId },
      { name: "AssignmentTypeId", type: sql.Int, value: data.assignmentTypeId },
      { name: "AcademicYearId", type: sql.Int, value: data.academicYearId },
      { name: "DepartmentId", type: sql.Int, value: data.departmentId },
      { name: "SectionId", type: sql.Int, value: data.sectionId },
      { name: "SubjectId", type: sql.Int, value: data.subjectId },
      { name: "YearLevelId", type: sql.Int, value: data.yearLevelId },
      { name: "ClassId", type: sql.Int, value: data.classId },
      { name: "RoomId", type: sql.Int, value: data.roomId },
    ]
  );

  return firstOrNull(result);
}

/**
 * Clears previous primary assignment for the same user and assignment type.
 *
 * Rule:
 * A user may have one primary record per assignment type.
 */
async function clearPrimaryAssignment(userId, assignmentTypeId) {
  await executeQuery(
    `
    UPDATE dbo.UserAssignments
    SET
      IsPrimary = 0,
      UpdatedAt = GETDATE()
    WHERE UserId = @UserId
      AND AssignmentTypeId = @AssignmentTypeId
      AND IsActive = 1;
    `,
    [
      { name: "UserId", type: sql.Int, value: userId },
      {
        name: "AssignmentTypeId",
        type: sql.Int,
        value: assignmentTypeId,
      },
    ]
  );
}

/**
 * Creates a user assignment.
 */
async function createUserAssignment(userId, data, createdBy) {
  const result = await executeQuery(
    `
    INSERT INTO dbo.UserAssignments
    (
      UserId,
      AssignmentTypeId,
      AcademicYearId,
      DepartmentId,
      SectionId,
      SubjectId,
      YearLevelId,
      ClassId,
      RoomId,
      StartDate,
      EndDate,
      IsPrimary,
      IsActive,
      CreatedBy,
      CreatedAt,
      UpdatedAt
    )
    OUTPUT INSERTED.UserAssignmentId
    VALUES
    (
      @UserId,
      @AssignmentTypeId,
      @AcademicYearId,
      @DepartmentId,
      @SectionId,
      @SubjectId,
      @YearLevelId,
      @ClassId,
      @RoomId,
      @StartDate,
      @EndDate,
      @IsPrimary,
      1,
      @CreatedBy,
      GETDATE(),
      GETDATE()
    );
    `,
    [
      { name: "UserId", type: sql.Int, value: userId },
      { name: "AssignmentTypeId", type: sql.Int, value: data.assignmentTypeId },
      { name: "AcademicYearId", type: sql.Int, value: data.academicYearId },
      { name: "DepartmentId", type: sql.Int, value: data.departmentId },
      { name: "SectionId", type: sql.Int, value: data.sectionId },
      { name: "SubjectId", type: sql.Int, value: data.subjectId },
      { name: "YearLevelId", type: sql.Int, value: data.yearLevelId },
      { name: "ClassId", type: sql.Int, value: data.classId },
      { name: "RoomId", type: sql.Int, value: data.roomId },
      { name: "StartDate", type: sql.Date, value: data.startDate },
      { name: "EndDate", type: sql.Date, value: data.endDate },
      { name: "IsPrimary", type: sql.Bit, value: data.isPrimary },
      { name: "CreatedBy", type: sql.Int, value: createdBy },
    ]
  );

  return insertedId(result, "UserAssignmentId");
}

module.exports = {
  getAssignmentTypes,
  getUserAssignments,
  findUserById,
  findAssignmentTypeById,
  findAcademicYearById,
  findDuplicateAssignment,
  clearPrimaryAssignment,
  createUserAssignment,
};