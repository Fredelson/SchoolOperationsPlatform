// backend/modules/lookups/repositories/lookupRepository.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Lookup Repository
 * ============================================================
 *
 * Purpose:
 * Handles database access for dropdown/reference data.
 *
 * Rules:
 * - No business logic here.
 * - No HTTP responses here.
 * - Only SQL queries belong here.
 * ============================================================
 */

const {
  sql,
  executeQuery,
  rows,
} = require("../../../shared/database");

/**
 * Get active departments.
 */
async function getDepartments() {
  const result = await executeQuery(`
    SELECT
      DepartmentId,
      DepartmentKey,
      DepartmentName,
      SectionId
    FROM dbo.Departments
    WHERE IsActive = 1
    ORDER BY DepartmentName ASC;
  `);

  return rows(result);
}

/**
 * Get active sections.
 */
async function getSections() {
  const result = await executeQuery(`
    SELECT
      SectionId,
      SectionKey,
      SectionName
    FROM dbo.Sections
    WHERE IsActive = 1
    ORDER BY SectionName ASC;
  `);

  return rows(result);
}

/**
 * Get active subjects.
 */
async function getSubjects() {
  const result = await executeQuery(`
    SELECT
      SubjectId,
      SubjectKey,
      SubjectName
    FROM dbo.Subjects
    WHERE IsActive = 1
    ORDER BY SubjectName ASC;
  `);

  return rows(result);
}

/**
 * Get active purposes.
 */
async function getPurposes() {
  const result = await executeQuery(`
    SELECT
      PurposeId,
      PurposeKey,
      PurposeName
    FROM dbo.Purposes
    WHERE IsActive = 1
    ORDER BY PurposeName ASC;
  `);

  return rows(result);
}

/**
 * Get active roles.
 */
async function getRoles() {
  const result = await executeQuery(`
    SELECT
      r.RoleId,
      r.RoleKey,
      r.RoleName,
      r.DisplayName,
      r.Description,
      r.AccessLevelId,
      a.AccessLevelName,
      a.DisplayName AS AccessLevelDisplayName,
      r.IsProtected,
      r.IsActive
    FROM dbo.Roles r
    LEFT JOIN dbo.AccessLevels a
      ON r.AccessLevelId = a.AccessLevelId
    WHERE r.IsActive = 1
    ORDER BY r.DisplayName ASC;
  `);

  return rows(result);
}

/**
 * Get active access levels.
 */
async function getAccessLevels() {
  const result = await executeQuery(`
    SELECT
      AccessLevelId,
      AccessLevelKey,
      AccessLevelName,
      DisplayName,
      Description
    FROM dbo.AccessLevels
    WHERE IsActive = 1
    ORDER BY DisplayName ASC;
  `);

  return rows(result);
}

/**
 * Get active HOD users by department.
 *
 * New schema:
 * - Users store RoleId.
 * - Roles store RoleKey.
 * - Subjects are stored through UserAssignments.
 */
async function getHodsByDepartment(departmentId) {
  const result = await executeQuery(
    `
    SELECT
      u.UserId,
      u.FullName,
      u.EmployeeId,
      u.SchoolEmail,
      u.DepartmentId,
      d.DepartmentName,
      ua.SubjectId,
      sub.SubjectName
    FROM dbo.Users u
    INNER JOIN dbo.Roles r
      ON u.RoleId = r.RoleId
    LEFT JOIN dbo.Departments d
      ON u.DepartmentId = d.DepartmentId
    LEFT JOIN dbo.UserAssignments ua
      ON u.UserId = ua.UserId
      AND ua.IsActive = 1
      AND ua.DepartmentId = @DepartmentId
    LEFT JOIN dbo.Subjects sub
      ON ua.SubjectId = sub.SubjectId
    WHERE r.RoleKey = 'HOD'
      AND u.IsActive = 1
      AND u.DepartmentId = @DepartmentId
    ORDER BY u.FullName ASC;
    `,
    [
      {
        name: "DepartmentId",
        type: sql.Int,
        value: departmentId,
      },
    ]
  );

  return rows(result);
}

module.exports = {
  getDepartments,
  getSections,
  getSubjects,
  getPurposes,
  getRoles,
  getAccessLevels,
  getHodsByDepartment,
};