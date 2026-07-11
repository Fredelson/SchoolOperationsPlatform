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
    [{ name: "UserId", type: sql.Int, value: userId }]
  );

  return rows(result);
}

async function getAssignments({ search = "", assignmentTypeId = null, isActive = null, page = 1, pageSize = 10 }) {
  const offset = (page - 1) * pageSize;
  const params = [
    { name: "Search", type: sql.NVarChar(150), value: `%${search}%` },
    { name: "AssignmentTypeId", type: sql.Int, value: assignmentTypeId },
    { name: "IsActive", type: sql.Bit, value: isActive },
    { name: "Offset", type: sql.Int, value: offset },
    { name: "PageSize", type: sql.Int, value: pageSize },
  ];
  const from = `FROM dbo.UserAssignments ua INNER JOIN dbo.Users u ON u.UserId=ua.UserId
    INNER JOIN dbo.AssignmentTypes at ON at.AssignmentTypeId=ua.AssignmentTypeId
    LEFT JOIN dbo.AcademicYears ay ON ay.AcademicYearId=ua.AcademicYearId
    LEFT JOIN dbo.Departments d ON d.DepartmentId=ua.DepartmentId
    LEFT JOIN dbo.Sections s ON s.SectionId=ua.SectionId`;
  const where = `WHERE (@Search='%%' OR u.FullName LIKE @Search OR u.EmployeeId LIKE @Search OR at.AssignmentName LIKE @Search)
    AND (@AssignmentTypeId IS NULL OR ua.AssignmentTypeId=@AssignmentTypeId)
    AND (@IsActive IS NULL OR ua.IsActive=@IsActive)`;
  const result = await executeQuery(`SELECT ua.UserAssignmentId,ua.UserId,u.FullName,u.EmployeeId,ua.AssignmentTypeId,
    at.AssignmentKey,at.AssignmentName,ua.AcademicYearId,ay.AcademicYearName,ua.DepartmentId,d.DepartmentName,
    ua.SectionId,s.SectionName,ua.SubjectId,ua.YearLevelId,ua.ClassId,ua.RoomId,ua.StartDate,ua.EndDate,
    ua.IsPrimary,ua.IsActive,ua.CreatedAt,ua.UpdatedAt ${from} ${where}
    ORDER BY ua.IsActive DESC,ua.IsPrimary DESC,u.FullName,ua.CreatedAt DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
    SELECT COUNT(1) AS TotalRows ${from} ${where};`, params);
  return { items: result.recordsets?.[0] || [], totalRows: result.recordsets?.[1]?.[0]?.TotalRows || 0, page, pageSize };
}

async function getAssignmentLookups() {
  const result = await executeQuery(`
    SELECT UserId,EmployeeId,FullName FROM dbo.Users WHERE IsActive=1 AND IsDeleted=0 ORDER BY FullName;
    SELECT AssignmentTypeId,AssignmentKey,AssignmentName FROM dbo.AssignmentTypes WHERE IsActive=1 ORDER BY SortOrder,AssignmentName;
    SELECT AcademicYearId,AcademicYearName FROM dbo.AcademicYears WHERE IsActive=1 ORDER BY AcademicYearName DESC;
    SELECT DepartmentId,DepartmentName FROM dbo.Departments WHERE IsActive=1 ORDER BY DepartmentName;
    SELECT SectionId,SectionName FROM dbo.Sections WHERE IsActive=1 ORDER BY SectionName;
    SELECT SubjectId,SubjectName FROM dbo.Subjects WHERE IsActive=1 ORDER BY SortOrder,SubjectName;
    SELECT YearLevelId,YearLevelName,SectionId FROM dbo.YearLevels WHERE IsActive=1 ORDER BY SortOrder,YearLevelName;
    SELECT ClassId,ClassName,AcademicYearId,SectionId,YearLevelId,RoomId FROM dbo.Classes WHERE IsActive=1 ORDER BY ClassName;
    SELECT RoomId,RoomName FROM dbo.Rooms WHERE IsActive=1 ORDER BY RoomName;
  `);
  return { users: result.recordsets?.[0] || [], assignmentTypes: result.recordsets?.[1] || [], academicYears: result.recordsets?.[2] || [], departments: result.recordsets?.[3] || [], sections: result.recordsets?.[4] || [], subjects: result.recordsets?.[5] || [], yearLevels: result.recordsets?.[6] || [], classes: result.recordsets?.[7] || [], rooms: result.recordsets?.[8] || [] };
}

async function activateUserAssignment(userAssignmentId) {
  await executeQuery(`UPDATE dbo.UserAssignments SET IsActive=1,EndDate=NULL,UpdatedAt=GETDATE() WHERE UserAssignmentId=@Id;`, [{name:"Id",type:sql.Int,value:userAssignmentId}]);
}

/**
 * Finds a platform user by ID.
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
 * Finds an active user assignment by assignment ID.
 *
 * Used by:
 * - Update assignment
 * - Soft delete assignment
 * - Set primary assignment
 */
async function findUserAssignmentById(userAssignmentId, activeOnly = true) {
  const result = await executeQuery(
    `
    SELECT
      UserAssignmentId,
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
    FROM dbo.UserAssignments
    WHERE UserAssignmentId = @UserAssignmentId
      AND (@ActiveOnly = 0 OR IsActive = 1);
    `,
    [
      {
        name: "UserAssignmentId",
        type: sql.Int,
        value: userAssignmentId,
      },
      { name: "ActiveOnly", type: sql.Bit, value: activeOnly },
    ]
  );

  return firstOrNull(result);
}

/**
 * Checks whether an active assignment already exists for the same user,
 * assignment type, academic year, and exact assignment scope.
 *
 * Optional excludeUserAssignmentId is used during update so the current
 * record does not detect itself as a duplicate.
 */
async function findDuplicateAssignment(userId, data, excludeUserAssignmentId = null) {
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
      AND IsActive = 1
      AND (
        @ExcludeUserAssignmentId IS NULL
        OR UserAssignmentId <> @ExcludeUserAssignmentId
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
      {
        name: "ExcludeUserAssignmentId",
        type: sql.Int,
        value: excludeUserAssignmentId,
      },
    ]
  );

  return firstOrNull(result);
}

/**
 * Clears all primary assignments for a user.
 *
 * Platform Rule:
 * A user may have many assignments, but only one primary assignment.
 */
async function clearPrimaryAssignment(userId) {
  await executeQuery(
    `
    UPDATE dbo.UserAssignments
    SET
      IsPrimary = 0,
      UpdatedAt = GETDATE()
    WHERE UserId = @UserId
      AND IsActive = 1;
    `,
    [{ name: "UserId", type: sql.Int, value: userId }]
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

/**
 * Updates an existing active user assignment.
 */
async function updateUserAssignment(userAssignmentId, data) {
  await executeQuery(
    `
    UPDATE dbo.UserAssignments
    SET
      AssignmentTypeId = @AssignmentTypeId,
      AcademicYearId = @AcademicYearId,
      DepartmentId = @DepartmentId,
      SectionId = @SectionId,
      SubjectId = @SubjectId,
      YearLevelId = @YearLevelId,
      ClassId = @ClassId,
      RoomId = @RoomId,
      StartDate = @StartDate,
      EndDate = @EndDate,
      IsPrimary = @IsPrimary,
      UpdatedAt = GETDATE()
    WHERE UserAssignmentId = @UserAssignmentId
      AND IsActive = 1;
    `,
    [
      {
        name: "UserAssignmentId",
        type: sql.Int,
        value: userAssignmentId,
      },
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
    ]
  );
}

/**
 * Soft deletes an assignment.
 *
 * Important:
 * This preserves assignment history and avoids breaking reports.
 */
async function softDeleteUserAssignment(userAssignmentId) {
  await executeQuery(
    `
    UPDATE dbo.UserAssignments
    SET
      IsActive = 0,
      IsPrimary = 0,
      EndDate = ISNULL(EndDate, CAST(GETDATE() AS DATE)),
      UpdatedAt = GETDATE()
    WHERE UserAssignmentId = @UserAssignmentId
      AND IsActive = 1;
    `,
    [
      {
        name: "UserAssignmentId",
        type: sql.Int,
        value: userAssignmentId,
      },
    ]
  );
}

/**
 * Sets one assignment as the user's primary assignment.
 *
 * This is done in one SQL statement so the user cannot end up with
 * multiple primary assignments.
 */
async function setPrimaryUserAssignment(userId, userAssignmentId) {
  await executeQuery(
    `
    UPDATE dbo.UserAssignments
    SET
      IsPrimary =
        CASE
          WHEN UserAssignmentId = @UserAssignmentId THEN 1
          ELSE 0
        END,
      UpdatedAt = GETDATE()
    WHERE UserId = @UserId
      AND IsActive = 1;
    `,
    [
      { name: "UserId", type: sql.Int, value: userId },
      {
        name: "UserAssignmentId",
        type: sql.Int,
        value: userAssignmentId,
      },
    ]
  );
}

module.exports = {
  getAssignmentTypes,
  getUserAssignments,
  findUserById,
  findAssignmentTypeById,
  findAcademicYearById,
  findUserAssignmentById,
  findDuplicateAssignment,
  clearPrimaryAssignment,
  createUserAssignment,
  updateUserAssignment,
  softDeleteUserAssignment,
  setPrimaryUserAssignment,
  getAssignments,
  getAssignmentLookups,
  activateUserAssignment,
};
