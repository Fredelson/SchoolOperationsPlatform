// ============================================
// ARAB UNITY SCHOOL
// Lookup Controller
// Provides dropdown data for frontend forms
// ============================================

const { poolPromise, sql } = require("../../config/db")

// ============================================
// Get active departments
// GET /api/lookups/departments
// ============================================
const getDepartments = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        DepartmentId,
        DepartmentName
      FROM Departments
      WHERE IsActive = 1
      ORDER BY DepartmentName ASC
    `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get Departments Error:", error);

    return res.status(500).json({
      message: "Server error while fetching departments",
      error: error.message,
    });
  }
};

// ============================================
// Get active subjects
// GET /api/lookups/subjects
// ============================================
const getSubjects = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        SubjectId,
        SubjectName
      FROM Subjects
      WHERE IsActive = 1
      ORDER BY SubjectName ASC
    `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get Subjects Error:", error);

    return res.status(500).json({
      message: "Server error while fetching subjects",
      error: error.message,
    });
  }
};

// ============================================
// Get active purposes
// GET /api/lookups/purposes
// ============================================
const getPurposes = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        PurposeId,
        PurposeName
      FROM Purposes
      WHERE IsActive = 1
      ORDER BY PurposeName ASC
    `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get Purposes Error:", error);

    return res.status(500).json({
      message: "Server error while fetching purposes",
      error: error.message,
    });
  }
};

// ============================================
// Get active roles
// GET /api/lookups/roles
// Used by User Management role dropdown
// ============================================
const getRoles = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        r.RoleId,
        r.RoleName,
        r.DisplayName,
        a.AccessLevelName
      FROM Roles r
      INNER JOIN AccessLevels a
        ON r.AccessLevelId = a.AccessLevelId
      WHERE r.IsActive = 1
        AND a.IsActive = 1
      ORDER BY r.DisplayName ASC
    `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get Roles Error:", error);

    return res.status(500).json({
      message: "Server error while fetching roles",
      error: error.message,
    });
  }
};

// ============================================
// Get active access levels
// GET /api/lookups/access-levels
// Used by Role Management form
// ============================================
const getAccessLevels = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        AccessLevelId,
        AccessLevelName,
        DisplayName,
        Description
      FROM AccessLevels
      WHERE IsActive = 1
      ORDER BY DisplayName ASC
    `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get Access Levels Error:", error);

    return res.status(500).json({
      message: "Server error while fetching access levels",
      error: error.message,
    });
  }
};

// ============================================
// Get active HOD users by department
// GET /api/lookups/hods?departmentId=2
// ============================================
const getHods = async (req, res) => {
  try {
    const departmentId = Number(req.query.departmentId);

    if (!departmentId) {
      return res.status(400).json({
        message: "Department ID is required.",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("departmentId", sql.Int, departmentId)
      .query(`
        SELECT
          UserId,
          FullName,
          EmployeeId,
          DepartmentId,
          Subject
        FROM Users
        WHERE Role = 'HOD'
          AND IsActive = 1
          AND DepartmentId = @departmentId
        ORDER BY FullName ASC
      `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get HODs Error:", error);

    return res.status(500).json({
      message: "Server error while fetching HODs",
      error: error.message,
    });
  }
};

module.exports = {
  getDepartments,
  getSubjects,
  getPurposes,
  getRoles,
  getAccessLevels,
  getHods,
};